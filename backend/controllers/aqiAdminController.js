import CityAQI from '../models/CityAQI.js';
import ActivityLog from '../models/ActivityLog.js';

// ─── AQI HELPERS ─────────────────────────────────────────────────────────────

function pm25ToAQI(pm25) {
    const bp = [
        [0.0, 12.0, 0, 50], [12.1, 35.4, 51, 100], [35.5, 55.4, 101, 150],
        [55.5, 150.4, 151, 200], [150.5, 250.4, 201, 300], [250.5, 500.4, 301, 500],
    ];
    const b = bp.find(([lo, hi]) => pm25 >= lo && pm25 <= hi);
    if (!b) return Math.min(500, Math.round(pm25 * 2));
    return Math.round(((b[3] - b[2]) / (b[1] - b[0])) * (pm25 - b[0]) + b[2]);
}

function aqiLabel(aqi) {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy (Sensitive)';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
}

// Fetch live AQI for a given lat/lng from Open-Meteo
async function fetchLiveAQI(lat, lng) {
    try {
        const url =
            `https://air-quality-api.open-meteo.com/v1/air-quality` +
            `?latitude=${lat}&longitude=${lng}&current=pm2_5&domains=cams_global`;

        const response = await fetch(url, { headers: { Accept: 'application/json' } });
        if (!response.ok) return { aqi: null, status: 'API Error' };

        const data = await response.json();
        const pm25 = data?.current?.pm2_5;

        if (pm25 != null && pm25 >= 0) {
            const aqi = pm25ToAQI(pm25);
            return { aqi, status: aqiLabel(aqi) };
        }
        return { aqi: null, status: 'No Data' };
    } catch {
        return { aqi: null, status: 'Fetch Error' };
    }
}

// ─── CONTROLLERS ─────────────────────────────────────────────────────────────

// @desc    Get all monitored cities with live AQI
// @route   GET /api/admin/cities
// @access  Private (Admin)
export const getMonitoredCities = async (req, res) => {
    try {
        const cities = await CityAQI.find({ isActive: true }).sort({ city: 1 });

        // Refresh AQI for each city in parallel
        const updatedCities = await Promise.all(
            cities.map(async (city) => {
                const { aqi, status } = await fetchLiveAQI(city.lat, city.lng);
                city.lastAqi = aqi;
                city.lastStatus = status;
                city.lastChecked = new Date();
                await city.save();

                // Log critical AQI alerts
                if (aqi && aqi > 200) {
                    await ActivityLog.create({
                        type: 'aqi_alert',
                        message: `Critical AQI level (${aqi}) detected in ${city.city}`,
                        severity: 'critical',
                        relatedId: city._id,
                    });
                }

                return city;
            })
        );

        res.status(200).json({
            success: true,
            count: updatedCities.length,
            data: updatedCities,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add a new city to monitor
// @route   POST /api/admin/cities
// @access  Private (Admin)
export const addCity = async (req, res) => {
    const { city, state, country } = req.body;

    if (!city) {
        return res.status(400).json({ success: false, message: 'City name is required' });
    }

    try {
        // Geocode city using Nominatim
        const query = [city, state, country].filter(Boolean).join(', ');
        const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
            { headers: { 'Accept-Language': 'en', 'User-Agent': 'SmartCommute/1.0' } }
        );
        const geoData = await geoRes.json();

        if (!geoData.length) {
            return res.status(404).json({ success: false, message: `Location not found: "${query}"` });
        }

        const { lat, lon } = geoData[0];

        // Fetch initial AQI
        const { aqi, status } = await fetchLiveAQI(lat, lon);

        const newCity = await CityAQI.create({
            city: city.trim(),
            state: state?.trim() || null,
            country: country?.trim() || 'India',
            lat: parseFloat(lat),
            lng: parseFloat(lon),
            lastAqi: aqi,
            lastStatus: status,
            lastChecked: new Date(),
        });

        // Log activity
        await ActivityLog.create({
            type: 'city_added',
            message: `New city added to monitoring: ${city}`,
            severity: 'info',
            relatedId: newCity._id,
        });

        res.status(201).json({
            success: true,
            data: newCity,
        });
    } catch (error) {
        // Handle duplicate city
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'This city is already being monitored' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Remove a city from monitoring
// @route   DELETE /api/admin/cities/:id
// @access  Private (Admin)
export const removeCity = async (req, res) => {
    try {
        const city = await CityAQI.findById(req.params.id);

        if (!city) {
            return res.status(404).json({ success: false, message: 'City not found' });
        }

        await CityAQI.deleteOne({ _id: city._id });

        // Log activity
        await ActivityLog.create({
            type: 'city_removed',
            message: `City removed from monitoring: ${city.city}`,
            severity: 'warning',
            relatedId: city._id,
        });

        res.status(200).json({ success: true, message: `${city.city} removed from monitoring` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Force refresh AQI for a specific city
// @route   POST /api/admin/cities/:id/refresh
// @access  Private (Admin)
export const refreshCityAQI = async (req, res) => {
    try {
        const city = await CityAQI.findById(req.params.id);

        if (!city) {
            return res.status(404).json({ success: false, message: 'City not found' });
        }

        const { aqi, status } = await fetchLiveAQI(city.lat, city.lng);
        city.lastAqi = aqi;
        city.lastStatus = status;
        city.lastChecked = new Date();
        await city.save();

        res.status(200).json({ success: true, data: city });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
