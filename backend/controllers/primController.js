import JourneyArchive from '../models/JourneyArchive.js';

// Metabolic Reference (L/min)
const METABOLIC_REFERENCE = {
  driving: 7.5, // Resting/Sedentary
  walking: 14.5,
  cycling: 30.0,
};

/**
 * calculateInhaledDose
 * Formula: Inhaled Dose (mg) = [AQI (µg/m³) * VE (L/min) * Duration (min)] / 1000
 */
const calculateInhaledDose = (aqiConcentration, travelMode, durationMinutes) => {
  if (aqiConcentration == null) return null;
  const ve = METABOLIC_REFERENCE[travelMode] || METABOLIC_REFERENCE.driving;
  
  // NOTE: Technically AQI != PM2.5 concentration, but for the scope of this
  // simplified engine logic as defined by the user prompt, AQI value is used 
  // as the proxy concentration in µg/m³.
  const dose_micrograms = aqiConcentration * ve * durationMinutes;
  const dose_mg = dose_micrograms / 1000;
  
  return dose_mg;
};

// Map typical frontend modes to OSRM profiles
const OSRM_PROFILES = {
  driving: 'driving',
  walking: 'foot',
  cycling: 'bike',
};

// Geocode helper
async function geocode(address) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
    { headers: { 'Accept-Language': 'en', 'User-Agent': 'SmartCommute/1.0' } }
  );
  if (!res.ok) throw new Error('Geocoding blocked or rate limited');
  const data = await res.json();
  if (!data.length) throw new Error(`Location not found: "${address}"`);
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

// Open-Meteo AQI checker helper
async function fetchAqiForPoint(lat, lng) {
  try {
    const res = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=pm2_5&domains=cams_global`);
    if (!res.ok) return null;
    const data = await res.json();
    const pm25 = data?.current?.pm2_5;
    
    // Internal PM2.5 to AQI conversion logic map
    if (pm25 == null) return null;
    const bp = [
      [0.0, 12.0, 0, 50], [12.1, 35.4, 51, 100], [35.5, 55.4, 101, 150],
      [55.5, 150.4, 151, 200], [150.5, 250.4, 201, 300], [250.5, 500.4, 301, 500],
    ];
    const b = bp.find(([lo, hi]) => pm25 >= lo && pm25 <= hi);
    if (!b) return Math.min(500, Math.round(pm25 * 2));
    return Math.round(((b[3] - b[2]) / (b[1] - b[0])) * (pm25 - b[0]) + b[2]);
  } catch (err) {
    return null;
  }
}

function determineHealthRisk(mgDose) {
  if (mgDose == null) return "Unknown";
  if (mgDose < 0.2) return "Low";
  if (mgDose < 0.5) return "Moderate";
  if (mgDose < 1.0) return "High";
  return "Critical";
}

// @desc    Calculate routes using OSRM, sample AQI, compute PRIM dose.
// @route   POST /api/prim/calculate
// @access  Public
export const calculatePRIMRoute = async (req, res) => {
  try {
    const { startAddr, endAddr, travelMode } = req.body;
    
    if (!startAddr || !endAddr) {
      return res.status(400).json({ success: false, message: 'Start and end locations required.' });
    }
    const mode = travelMode && METABOLIC_REFERENCE[travelMode] ? travelMode : 'driving';
    const osrmProfile = OSRM_PROFILES[mode];

    // 1. Geocode
    const startCoord = await geocode(startAddr);
    const endCoord = await geocode(endAddr);

    // 2. Fetch OSRM Routes
    const url = `https://router.project-osrm.org/route/v1/${osrmProfile}/${startCoord.lng},${startCoord.lat};${endCoord.lng},${endCoord.lat}?alternatives=true&geometries=geojson&overview=full`;
    const osrmRes = await fetch(url);
    const osrmData = await osrmRes.json();
    
    if (osrmData.code !== 'Ok') {
      return res.status(404).json({ success: false, message: 'No routes found.' });
    }
    
    const routes = osrmData.routes.slice(0, 3);
    
    // 3. Score Routes & Calculate PRIM
    const scoredRoutes = await Promise.all(routes.map(async (route) => {
      // Pick midpoints for AQI
      const coords = route.geometry.coordinates;
      const n = 3;
      let points = [];
      if (coords.length <= n) {
        points = coords.map(([lng, lat]) => [lat, lng]);
      } else {
        const step = Math.floor(coords.length / (n + 1));
        points = Array.from({ length: n }, (_, i) => {
          const [lng, lat] = coords[(i + 1) * step];
          return [lat, lng];
        });
      }
      
      const aqis = await Promise.all(points.map(([lat, lng]) => fetchAqiForPoint(lat, lng)));
      const validAqis = aqis.filter(v => v !== null);
      const avgAqi = validAqis.length ? Math.round(validAqis.reduce((a, b) => a + b, 0) / validAqis.length) : null;
      
      const durationMinutes = route.duration / 60;
      const dose_mg = calculateInhaledDose(avgAqi, mode, durationMinutes);
      
      return {
        ...route,
        aqiScore: avgAqi,
        primData: {
          travelMode: mode,
          minuteVentilation: METABOLIC_REFERENCE[mode],
          totalInhaledMass_mg: dose_mg ? Number(dose_mg.toFixed(3)) : null,
          healthRiskLevel: determineHealthRisk(dose_mg),
        }
      };
    }));
    
    // Rank by lowest Dose (or AQI if dose is null), nulls at end
    scoredRoutes.sort((a, b) => {
      const doseA = a.primData.totalInhaledMass_mg;
      const doseB = b.primData.totalInhaledMass_mg;
      if (doseA === null && doseB === null) return 0;
      if (doseA === null) return 1;
      if (doseB === null) return -1;
      return doseA - doseB;
    });

    res.status(200).json({
      success: true,
      startCoord,
      endCoord,
      routes: scoredRoutes
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Save a selected route to DB history
// @route   POST /api/prim/save
// @access  Public (Optional auth)
export const saveJourney = async (req, res) => {
  try {
    const {
      fromLabel, toLabel, distance_m, duration_s, avgAqi,
      travelMode, minuteVentilation, totalInhaledMass_mg, healthRiskLevel,
      routeCoordinates
    } = req.body;

    const journey = await JourneyArchive.create({
      userId: req.user ? req.user._id : null,
      fromLabel,
      toLabel,
      distance_m,
      duration_s,
      avgAqi,
      travelMode,
      minuteVentilation,
      totalInhaledMass_mg,
      healthRiskLevel,
      routeCoordinates
    });

    res.status(201).json({ success: true, data: journey });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
