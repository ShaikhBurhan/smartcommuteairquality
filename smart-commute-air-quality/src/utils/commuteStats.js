/**
 * commuteStats.js
 * Reads the commuteHistory localStorage array and returns all
 * computed metrics used by Dashboard and EcoScore.
 */

/** CO₂ per km for a car (IPCC average) in kg */
const CO2_PER_KM_CAR = 0.21;

/** A "safe" trip = AQI ≤ 100 (Good or Moderate) */
const SAFE_AQI_THRESHOLD = 100;

export function getCommuteStats() {
  let trips = [];
  try {
    trips = JSON.parse(localStorage.getItem('commuteHistory') || '[]');
  } catch { trips = []; }

  const total       = trips.length;
  const totalDistM  = trips.reduce((s, t) => s + (t.distance || 0), 0);
  const totalDistKm = totalDistM / 1000;
  const totalMins   = trips.reduce((s, t) => s + ((t.duration || 0) / 60), 0);

  // Safe trips = those taken on a route with AQI ≤ 100
  const safeTrips   = trips.filter(t => t.aqi != null && t.aqi <= SAFE_AQI_THRESHOLD);
  const safeRate    = total > 0 ? Math.round((safeTrips.length / total) * 100) : 0;

  // Average AQI across all trips that have a score
  const aqiTrips    = trips.filter(t => t.aqi != null);
  const avgAQI      = aqiTrips.length
    ? Math.round(aqiTrips.reduce((s, t) => s + t.aqi, 0) / aqiTrips.length)
    : null;

  // Health score: inversely proportional to avgAQI
  // 0 AQI → 100%, 300 AQI → 0%. Capped 0–100.
  const healthScore = avgAQI != null
    ? Math.max(0, Math.round(100 - (avgAQI / 300) * 100))
    : null;

  // CO₂ saved = km * car emission factor
  // (we assume the user chose a cleaner route so they avoided car-level emissions)
  const co2Saved    = +(totalDistKm * CO2_PER_KM_CAR).toFixed(1);

  // Eco score (0–100): weights safe rate + health score + route count bonus
  const routeBonus  = Math.min(total * 2, 20); // max 20 pts from volume
  const ecoScore    = total === 0 ? 0
    : Math.min(100, Math.round(
        safeRate * 0.5 +
        (healthScore ?? 50) * 0.3 +
        routeBonus
      ));

  // Percentile rank (simulated, capped 1–99)
  const percentile  = Math.min(99, Math.max(1, ecoScore));

  // Trips this week
  const oneWeekAgo  = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weekTrips   = trips.filter(t => new Date(t.date).getTime() > oneWeekAgo);
  const weekDistKm  = weekTrips.reduce((s, t) => s + (t.distance || 0), 0) / 1000;
  const weekCO2     = +(weekDistKm * CO2_PER_KM_CAR).toFixed(1);

  return {
    total,
    totalDistKm: +totalDistKm.toFixed(1),
    totalMins:   Math.round(totalMins),
    safeTrips:   safeTrips.length,
    safeRate,
    avgAQI,
    healthScore,
    co2Saved,
    ecoScore,
    percentile,
    weekTrips:   weekTrips.length,
    weekCO2,
    recentTrips: trips.slice(0, 5),
  };
}
