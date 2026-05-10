import express from 'express';

const router = express.Router();

// ─── EPA AQI BREAKPOINTS ─────────────────────────────────────────────────────

function pm25ToAQI(pm25) {
  const bp = [
    [0.0, 12.0, 0, 50], [12.1, 35.4, 51, 100], [35.5, 55.4, 101, 150],
    [55.5, 150.4, 151, 200], [150.5, 250.4, 201, 300], [250.5, 500.4, 301, 500],
  ];
  const b = bp.find(([lo, hi]) => pm25 >= lo && pm25 <= hi);
  if (!b) return Math.min(500, Math.round(pm25 * 2));
  return Math.round(((b[3] - b[2]) / (b[1] - b[0])) * (pm25 - b[0]) + b[2]);
}

function pm10ToAQI(pm10) {
  const bp = [
    [0, 54, 0, 50], [55, 154, 51, 100], [155, 254, 101, 150],
    [255, 354, 151, 200], [355, 424, 201, 300], [425, 604, 301, 500],
  ];
  const b = bp.find(([lo, hi]) => pm10 >= lo && pm10 <= hi);
  if (!b) return Math.min(500, Math.round(pm10 * 1.5));
  return Math.round(((b[3] - b[2]) / (b[1] - b[0])) * (pm10 - b[0]) + b[2]);
}

function aqiLabel(aqi) {
  if (aqi <= 50)  return { status: 'Good',                  level: 1 };
  if (aqi <= 100) return { status: 'Moderate',               level: 2 };
  if (aqi <= 150) return { status: 'Unhealthy (Sensitive)',  level: 3 };
  if (aqi <= 200) return { status: 'Unhealthy',              level: 4 };
  if (aqi <= 300) return { status: 'Very Unhealthy',         level: 5 };
  return           { status: 'Hazardous',                    level: 6 };
}

// ─── GEOCODE + AQI  (city search) ────────────────────────────────────────────

/**
 * GET /api/aqi/city?city=Delhi&state=Delhi&country=India
 * Returns live AQI + all pollutants for a named city.
 */
router.get('/city', async (req, res) => {
  const { city, state, country } = req.query;
  if (!city) return res.status(400).json({ success: false, message: '"city" is required' });

  try {
    // 1. Geocode with Nominatim
    const query = [city, state, country].filter(Boolean).join(', ');
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      { headers: { 'Accept-Language': 'en', 'User-Agent': 'EcoCommute/1.0' } }
    );
    const geoData = await geoRes.json();
    if (!geoData.length) {
      return res.status(404).json({ success: false, message: `Location not found: "${query}"` });
    }

    const { lat, lon, display_name } = geoData[0];

    // 2. Fetch all pollutants from Open-Meteo Air Quality API
    const aqRes = await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality` +
      `?latitude=${lat}&longitude=${lon}` +
      `&current=pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone` +
      `&domains=cams_global`,
      { headers: { Accept: 'application/json' } }
    );

    if (!aqRes.ok) {
      return res.status(502).json({ success: false, message: 'Air quality API error' });
    }

    const aqData = await aqRes.json();
    const cur = aqData.current ?? {};

    const pm25 = cur.pm2_5 ?? null;
    const pm10 = cur.pm10  ?? null;
    const aqi  = pm25 != null ? pm25ToAQI(pm25) : (pm10 != null ? pm10ToAQI(pm10) : null);
    const { status, level } = aqi != null ? aqiLabel(aqi) : { status: 'Unknown', level: 0 };

    res.json({
      success: true,
      location: {
        city: city.trim(),
        state: state?.trim() || null,
        country: country?.trim() || null,
        display_name,
        lat: parseFloat(lat),
        lng: parseFloat(lon),
      },
      aqi,
      status,
      level,
      pollutants: {
        pm25:              pm25 != null ? +pm25.toFixed(1) : null,
        pm10:              pm10 != null ? +pm10.toFixed(1) : null,
        co:  cur.carbon_monoxide   != null ? +cur.carbon_monoxide.toFixed(1)   : null,
        no2: cur.nitrogen_dioxide  != null ? +cur.nitrogen_dioxide.toFixed(1)  : null,
        so2: cur.sulphur_dioxide   != null ? +cur.sulphur_dioxide.toFixed(1)   : null,
        o3:  cur.ozone             != null ? +cur.ozone.toFixed(1)             : null,
      },
      recorded_at: cur.time ?? new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── COORD-BASED ROUTE (used by Route Planner) ───────────────────────────────

/**
 * GET /api/aqi?lat=28.63&lng=77.21
 * Returns AQI computed from PM2.5 for a lat/lng coordinate.
 */
router.get('/', async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) {
    return res.status(400).json({ success: false, message: 'lat and lng are required' });
  }

  try {
    const url =
      `https://air-quality-api.open-meteo.com/v1/air-quality` +
      `?latitude=${lat}&longitude=${lng}&current=pm2_5&domains=cams_global`;

    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!response.ok) {
      return res.status(502).json({ success: false, message: 'Air quality API request failed' });
    }

    const data = await response.json();
    const pm25 = data?.current?.pm2_5;
    const aqi  = pm25 != null && pm25 >= 0 ? pm25ToAQI(pm25) : null;

    res.json({ success: true, aqi, pm25: pm25 ?? null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
