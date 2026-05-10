import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import PageWrapper from '../components/PageWrapper';
import {
  Map, Layers, RefreshCw, Search, MapPin,
  Globe, AlertTriangle, Loader, Wind
} from 'lucide-react';

// ─── AQI colour helpers ───────────────────────────────────────────────────────

function aqiColor(aqi) {
  if (aqi == null)  return '#94a3b8';
  if (aqi <= 50)    return '#10b981';
  if (aqi <= 100)   return '#f59e0b';
  if (aqi <= 150)   return '#f97316';
  if (aqi <= 200)   return '#ef4444';
  if (aqi <= 300)   return '#be185d';
  return                   '#7c3aed';
}

function aqiLabel(aqi) {
  if (aqi == null)  return 'No data';
  if (aqi <= 50)    return 'Good';
  if (aqi <= 100)   return 'Moderate';
  if (aqi <= 150)   return 'Sensitive';
  if (aqi <= 200)   return 'Unhealthy';
  if (aqi <= 300)   return 'Very Unhealthy';
  return                   'Hazardous';
}

// ─── GRID BUILDER ────────────────────────────────────────────────────────────
// Returns an array of {lat, lng} forming an NxN grid centred on (clat, clng)
function buildGrid(clat, clng, n = 5, stepDeg = 0.025) {
  const half   = Math.floor(n / 2);
  const points = [];
  for (let r = -half; r <= half; r++) {
    for (let c = -half; c <= half; c++) {
      points.push({
        lat: +(clat + r * stepDeg).toFixed(6),
        lng: +(clng + c * stepDeg).toFixed(6),
      });
    }
  }
  return points;
}

// ─── FETCH AQI for one point via backend proxy ────────────────────────────────
async function fetchAQI(lat, lng) {
  try {
    const res  = await fetch(`http://localhost:5000/api/aqi?lat=${lat}&lng=${lng}`);
    const json = await res.json();
    return json.success ? json.aqi : null;
  } catch {
    return null;
  }
}

// ─── NOMINATIM GEOCODE ────────────────────────────────────────────────────────
async function geocode(query) {
  const res  = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
    { headers: { 'Accept-Language': 'en', 'User-Agent': 'EcoCommute/1.0' } }
  );
  const data = await res.json();
  if (!data.length) throw new Error(`Location not found: "${query}"`);
  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    display: data[0].display_name,
  };
}

// ─── Map auto-fit sub-component ───────────────────────────────────────────────
function MapFlyTo({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo([center.lat, center.lng], 13, { duration: 1.2 });
  }, [center, map]);
  return null;
}

// ─── LEGEND ROW ──────────────────────────────────────────────────────────────
const LEGEND = [
  { range: '0–50',   label: 'Good',          color: '#10b981' },
  { range: '51–100', label: 'Moderate',       color: '#f59e0b' },
  { range: '101–150',label: 'Sensitive',      color: '#f97316' },
  { range: '151–200',label: 'Unhealthy',      color: '#ef4444' },
  { range: '201–300',label: 'Very Unhealthy', color: '#be185d' },
  { range: '301+',   label: 'Hazardous',      color: '#7c3aed' },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
function PollutionHeatmap() {
  const [form, setForm]       = useState({ area: '', city: '', state: '', country: '' });
  const [center, setCenter]   = useState(null);
  const [display, setDisplay] = useState('');
  const [points, setPoints]   = useState([]);   // [{lat,lng,aqi}]
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError]     = useState('');
  const [mapReady, setMapReady] = useState(false);

  const handleSearch = async () => {
    const query = [form.area, form.city, form.state, form.country]
      .filter(Boolean).join(', ');
    if (!query.trim()) { setError('Please enter at least a city name.'); return; }

    setLoading(true); setError(''); setPoints([]); setProgress(0); setMapReady(false);

    try {
      // 1. Geocode
      const loc = await geocode(query);
      setCenter({ lat: loc.lat, lng: loc.lng });
      setDisplay(loc.display);

      // 2. Build 5×5 grid (~2.5 km step)
      const grid = buildGrid(loc.lat, loc.lng, 5, 0.025);

      // 3. Fetch AQI for each point sequentially to avoid hammering backend
      const results = [];
      for (let i = 0; i < grid.length; i++) {
        const aqi = await fetchAQI(grid[i].lat, grid[i].lng);
        results.push({ ...grid[i], aqi });
        setProgress(Math.round(((i + 1) / grid.length) * 100));
      }

      setPoints(results);
      setMapReady(true);
    } catch (e) {
      setError(e.message || 'Failed to load heatmap. Try again.');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleKey = e => { if (e.key === 'Enter') handleSearch(); };

  // Summary stats from loaded points
  const validPts  = points.filter(p => p.aqi != null);
  const avgAQI    = validPts.length
    ? Math.round(validPts.reduce((s, p) => s + p.aqi, 0) / validPts.length)
    : null;
  const maxAQI    = validPts.length ? Math.max(...validPts.map(p => p.aqi)) : null;
  const dangerPts = validPts.filter(p => p.aqi > 100).length;

  return (
    <PageWrapper>
      <div className="min-h-screen bg-[#f8fafc] p-6 text-slate-900 md:p-10 relative overflow-hidden">

        {/* BG grid */}
        <div className="absolute inset-0 opacity-[0.03] z-0 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="max-w-7xl mx-auto relative z-10">

          {/* ── HEADER ── */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-orange-500 rounded-2xl shadow-xl shadow-rose-500/20 flex items-center justify-center text-white">
                  <Map size={24} />
                </div>
                <h1 className="text-4xl font-black tracking-tight text-slate-900">Pollution Heatmap</h1>
              </div>
              <p className="text-slate-500 font-medium text-lg ml-1">
                Real PM2.5-based AQI grid for any location worldwide.
              </p>
            </div>
            {points.length > 0 && (
              <button
                onClick={handleSearch}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-white shadow-xl text-sm font-bold hover:bg-rose-500 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh Data
              </button>
            )}
          </div>

          {/* ── SEARCH BOX ── */}
          <div className="bg-white rounded-[2.5rem] p-7 shadow-xl shadow-slate-200/60 border border-slate-100 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-rose-50 rounded-bl-[100px] -z-10 pointer-events-none" />

            <div className="flex items-center gap-2 mb-5">
              <Globe size={16} className="text-rose-500" />
              <h2 className="text-base font-black text-slate-700">Search Location</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
              {[
                { key: 'area',    placeholder: 'Area / Neighborhood', label: 'Area' },
                { key: 'city',    placeholder: 'e.g. Ahmedabad',      label: 'City *' },
                { key: 'state',   placeholder: 'e.g. Gujarat',        label: 'State' },
                { key: 'country', placeholder: 'e.g. India',          label: 'Country' },
              ].map(({ key, placeholder, label }) => (
                <div key={key}>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5 pl-1">
                    {label}
                  </label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                    <input
                      type="text"
                      value={form[key]}
                      placeholder={placeholder}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      onKeyDown={handleKey}
                      className="w-full bg-slate-50 border-2 border-slate-200 pl-9 pr-3 py-3 rounded-2xl text-sm font-semibold text-slate-900 outline-none focus:bg-white focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10 transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 mb-4">
                <AlertTriangle size={14} className="shrink-0" /> {error}
              </div>
            )}

            {/* Progress bar */}
            {loading && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <Loader size={12} className="animate-spin" />
                    Sampling {progress}% of {25} grid points…
                  </span>
                  <span className="text-xs font-bold text-rose-500">{progress}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 to-orange-400 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex items-center gap-2 bg-slate-900 text-white font-bold text-sm px-8 py-4 rounded-2xl shadow-xl hover:bg-rose-600 hover:shadow-rose-500/20 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? <><Loader size={16} className="animate-spin" /> Loading Heatmap…</>
                : <><Search size={16} /> Generate Heatmap</>}
            </button>
          </div>

          {/* ── SUMMARY STATS (post-load) ── */}
          {points.length > 0 && !loading && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Location',     value: display.split(',').slice(0, 2).join(','), small: true },
                { label: 'Avg AQI',      value: avgAQI ?? '—', color: aqiColor(avgAQI) },
                { label: 'Peak AQI',     value: maxAQI ?? '—', color: aqiColor(maxAQI) },
                { label: 'Danger Zones', value: `${dangerPts} / ${validPts.length}`, color: dangerPts > 0 ? '#ef4444' : '#10b981' },
              ].map(({ label, value, color, small }) => (
                <div key={label} className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-5 text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
                  <p
                    className={`font-black text-slate-900 ${small ? 'text-xs truncate' : 'text-2xl'}`}
                    style={color ? { color } : {}}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* ── MAP ── */}
          <div className="bg-slate-900 rounded-[3rem] p-2 shadow-2xl" style={{ minHeight: 560 }}>
            {mapReady && center ? (
              <div className="w-full rounded-[2.5rem] overflow-hidden" style={{ height: 580 }}>
                <MapContainer
                  center={[center.lat, center.lng]}
                  zoom={13}
                  style={{ width: '100%', height: '100%', borderRadius: '2rem' }}
                  zoomControl={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {/* Heatmap circles */}
                  {points.map((pt, i) => (
                    <CircleMarker
                      key={i}
                      center={[pt.lat, pt.lng]}
                      radius={38}
                      pathOptions={{
                        color: 'transparent',
                        fillColor: aqiColor(pt.aqi),
                        fillOpacity: pt.aqi != null ? 0.55 : 0.1,
                      }}
                    >
                      <Tooltip direction="top" sticky>
                        <div style={{ fontWeight: 700, fontSize: 12 }}>
                          <div style={{ color: aqiColor(pt.aqi) }}>AQI {pt.aqi ?? '—'} — {aqiLabel(pt.aqi)}</div>
                          <div style={{ color: '#94a3b8', fontSize: 10 }}>{pt.lat.toFixed(4)}, {pt.lng.toFixed(4)}</div>
                        </div>
                      </Tooltip>
                    </CircleMarker>
                  ))}

                  <MapFlyTo center={center} />
                </MapContainer>
              </div>
            ) : (
              /* Placeholder */
              <div
                className="w-full h-full rounded-[2.5rem] bg-slate-800 border border-slate-700 flex flex-col items-center justify-center relative overflow-hidden"
                style={{ minHeight: 560 }}
              >
                <div
                  className="absolute inset-0 opacity-[0.07] rounded-[2.5rem]"
                  style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                />

                {/* Simulated colour blobs */}
                <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-rose-500/15 blur-[80px] rounded-full pointer-events-none" />
                <div className="absolute top-1/2 right-1/3 w-[220px] h-[220px] bg-amber-500/15 blur-[60px] rounded-full pointer-events-none" />
                <div className="absolute bottom-1/4 left-1/2 w-[280px] h-[280px] bg-emerald-500/10 blur-[70px] rounded-full pointer-events-none" />

                <div className="text-center z-10 relative px-8">
                  <div className="w-24 h-24 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-500/30">
                    <Wind size={36} className="text-rose-400" />
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight mb-2">Enter a Location</h3>
                  <p className="text-slate-400 text-sm font-medium max-w-xs mx-auto">
                    Type a city name above to generate a real-time PM2.5 pollution heatmap with a 5×5 sampling grid.
                  </p>
                  <div className="flex gap-2 flex-wrap justify-center mt-8">
                    {['Delhi, India', 'Mumbai, India', 'Beijing, China', 'London, UK'].map(ex => (
                      <button
                        key={ex}
                        onClick={() => {
                          const [city, ...rest] = ex.split(', ');
                          setForm({ area: '', city, state: '', country: rest.join(', ') });
                        }}
                        className="bg-slate-700/60 border border-slate-600 text-slate-300 text-[10px] font-bold px-3 py-1.5 rounded-full hover:bg-slate-600 transition-all"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status pill */}
                <div className="absolute top-6 left-6">
                  <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl text-white text-xs font-bold border border-slate-700 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                    HEATMAP READY
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── LEGEND ── */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 mt-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">AQI Legend (PM2.5-based)</p>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {LEGEND.map(({ range, label, color }) => (
                <div key={range} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full shrink-0" style={{ background: color, opacity: 0.85 }} />
                  <div>
                    <p className="text-[10px] font-black text-slate-600">{range}</p>
                    <p className="text-[10px] text-slate-400">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </PageWrapper>
  );
}

export default PollutionHeatmap;