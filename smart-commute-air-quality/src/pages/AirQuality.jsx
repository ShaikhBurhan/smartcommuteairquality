import { useState } from 'react';
import PageWrapper from '../components/PageWrapper';
import {
  Wind, Activity, AlertTriangle, CheckCircle,
  Search, MapPin, Globe, Loader, RefreshCw,
  Flame, Droplets, Zap, Thermometer, CloudSnow
} from 'lucide-react';

// ─── AQI styling helper ───────────────────────────────────────────────────────
function getAQIStyle(aqi) {
  if (aqi === null) return {
    color: 'slate', bg: 'bg-slate-500', light: 'bg-slate-50',
    text: 'text-slate-700', border: 'border-slate-200',
    glow: 'shadow-slate-200', ring: 'ring-slate-300',
    label: 'Unknown', icon: <Wind size={20} />,
    advice: 'No data available for this location.',
    gradient: 'from-slate-400 to-slate-600',
  };
  if (aqi <= 50) return {
    color: 'emerald', bg: 'bg-emerald-500', light: 'bg-emerald-50',
    text: 'text-emerald-700', border: 'border-emerald-200',
    glow: 'shadow-emerald-200', ring: 'ring-emerald-300',
    label: 'Good', icon: <CheckCircle size={20} />,
    advice: 'Air quality is satisfactory. Enjoy outdoor activities freely.',
    gradient: 'from-emerald-400 to-teal-500',
  };
  if (aqi <= 100) return {
    color: 'amber', bg: 'bg-amber-500', light: 'bg-amber-50',
    text: 'text-amber-700', border: 'border-amber-200',
    glow: 'shadow-amber-200', ring: 'ring-amber-300',
    label: 'Moderate', icon: <Activity size={20} />,
    advice: 'Acceptable air quality. Sensitive individuals should limit prolonged exertion.',
    gradient: 'from-amber-400 to-orange-400',
  };
  if (aqi <= 150) return {
    color: 'orange', bg: 'bg-orange-500', light: 'bg-orange-50',
    text: 'text-orange-700', border: 'border-orange-200',
    glow: 'shadow-orange-200', ring: 'ring-orange-300',
    label: 'Unhealthy (Sensitive)', icon: <AlertTriangle size={20} />,
    advice: 'Sensitive groups should reduce outdoor activity.',
    gradient: 'from-orange-400 to-red-400',
  };
  if (aqi <= 200) return {
    color: 'red', bg: 'bg-red-500', light: 'bg-red-50',
    text: 'text-red-700', border: 'border-red-200',
    glow: 'shadow-red-200', ring: 'ring-red-300',
    label: 'Unhealthy', icon: <AlertTriangle size={20} />,
    advice: 'Everyone may experience health effects. Limit time outdoors.',
    gradient: 'from-red-500 to-rose-600',
  };
  if (aqi <= 300) return {
    color: 'rose', bg: 'bg-rose-600', light: 'bg-rose-50',
    text: 'text-rose-800', border: 'border-rose-300',
    glow: 'shadow-rose-200', ring: 'ring-rose-400',
    label: 'Very Unhealthy', icon: <AlertTriangle size={20} />,
    advice: 'Serious health effects. Avoid outdoor activities.',
    gradient: 'from-rose-500 to-pink-700',
  };
  return {
    color: 'purple', bg: 'bg-purple-700', light: 'bg-purple-50',
    text: 'text-purple-900', border: 'border-purple-300',
    glow: 'shadow-purple-200', ring: 'ring-purple-400',
    label: 'Hazardous', icon: <Flame size={20} />,
    advice: 'Health emergency conditions. Stay indoors and seal gaps.',
    gradient: 'from-purple-600 to-indigo-800',
  };
}

// ─── AQI gauge arc ────────────────────────────────────────────────────────────
function AQIGauge({ aqi, style }) {
  const max = 300;
  const pct = Math.min((aqi ?? 0) / max, 1);
  const r = 80, cx = 100, cy = 100;
  const startAngle = -210, sweepAngle = 240;
  const toRad = d => (d * Math.PI) / 180;
  const arc = (angle) => ({
    x: cx + r * Math.cos(toRad(angle)),
    y: cy + r * Math.sin(toRad(angle)),
  });
  const end = arc(startAngle + sweepAngle * pct);
  const totalEnd = arc(startAngle + sweepAngle);
  const largeArc = sweepAngle * pct > 180 ? 1 : 0;

  const pathD = (endPt, la = 0) =>
    `M ${arc(startAngle).x} ${arc(startAngle).y} A ${r} ${r} 0 ${la} 1 ${endPt.x} ${endPt.y}`;

  return (
    <svg viewBox="0 0 200 200" className="w-48 h-48">
      <path d={pathD(totalEnd, 1)} fill="none" stroke="#e2e8f0" strokeWidth="14" strokeLinecap="round" />
      {(aqi ?? 0) > 0 && (
        <path d={pathD(end, largeArc)} fill="none" strokeWidth="14" strokeLinecap="round"
          stroke={style.color === 'emerald' ? '#10b981' : style.color === 'amber' ? '#f59e0b' :
            style.color === 'orange' ? '#f97316' : style.color === 'red' ? '#ef4444' :
            style.color === 'rose' ? '#e11d48' : style.color === 'purple' ? '#7c3aed' : '#94a3b8'}
        />
      )}
      <text x="100" y="108" textAnchor="middle" fontSize="36" fontWeight="900"
        fill="#0f172a" fontFamily="system-ui">{aqi ?? '—'}</text>
      <text x="100" y="130" textAnchor="middle" fontSize="10" fontWeight="700"
        fill="#94a3b8" fontFamily="system-ui" letterSpacing="2">AQI</text>
    </svg>
  );
}

// ─── Pollutant pill ───────────────────────────────────────────────────────────
function PollutantCard({ label, value, unit, icon, color }) {
  return (
    <div className={`bg-white rounded-[1.5rem] p-5 border-2 ${color.border} shadow-sm hover:shadow-md transition-shadow`}>
      <div className={`w-9 h-9 ${color.light} ${color.text} rounded-xl flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      <p className="text-2xl font-black text-slate-900 tracking-tight">
        {value != null ? value : '—'}
        {value != null && <span className="text-xs font-medium text-slate-400 ml-1">{unit}</span>}
      </p>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
function AirQuality() {
  const [form, setForm]         = useState({ city: '', state: '', country: '' });
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!form.city.trim()) { setError('Please enter at least a city name.'); return; }
    setLoading(true); setError(''); setData(null);
    try {
      const params = new URLSearchParams({
        city: form.city.trim(),
        ...(form.state.trim()   && { state:   form.state.trim()   }),
        ...(form.country.trim() && { country: form.country.trim() }),
      });
      const res  = await fetch(`http://localhost:5000/api/aqi/city?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setData(json);
      setSearched(true);
    } catch (e) {
      setError(e.message || 'Failed to fetch AQI data.');
    } finally {
      setLoading(false);
    }
  };

  const handleKey = e => { if (e.key === 'Enter') handleSearch(); };

  const style = data ? getAQIStyle(data.aqi) : getAQIStyle(null);

  return (
    <PageWrapper>
      <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12 relative overflow-hidden">

        {/* BG grid */}
        <div className="absolute inset-0 opacity-[0.03] z-0 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        {/* BG orb */}
        <div className={`absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px] -z-10 pointer-events-none opacity-30 bg-gradient-to-br ${style.gradient}`} />

        <div className="max-w-7xl mx-auto relative z-10">

          {/* ── HEADER ─── */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center text-emerald-500">
                  <Wind size={24} />
                </div>
                <h1 className="text-4xl font-black tracking-tight text-slate-900">AQI Telemetry</h1>
              </div>
              <p className="text-slate-500 font-medium text-lg ml-1">
                Live atmospheric data from any city worldwide.
              </p>
            </div>
            {data && (
              <div className="flex items-center gap-2 bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-200">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs font-black uppercase tracking-widest text-slate-600">LIVE DATA</span>
              </div>
            )}
          </div>

          {/* ── SEARCH BOX ─── */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/60 border border-slate-100 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-[100px] -z-10 pointer-events-none" />

            <div className="flex items-center gap-3 mb-6">
              <Globe size={18} className="text-emerald-500" />
              <h2 className="text-lg font-black text-slate-700 tracking-tight">Search Location</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
              {/* City */}
              <div className="sm:col-span-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5 pl-1">
                  City *
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text" placeholder="e.g. Delhi"
                    value={form.city}
                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    onKeyDown={handleKey}
                    className="w-full bg-slate-50 border-2 border-slate-200 pl-10 pr-4 py-3.5 rounded-2xl text-sm font-semibold text-slate-900 outline-none focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>

              {/* State */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5 pl-1">
                  State / Province
                </label>
                <input
                  type="text" placeholder="e.g. Delhi"
                  value={form.state}
                  onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                  onKeyDown={handleKey}
                  className="w-full bg-slate-50 border-2 border-slate-200 px-4 py-3.5 rounded-2xl text-sm font-semibold text-slate-900 outline-none focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-300"
                />
              </div>

              {/* Country */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5 pl-1">
                  Country
                </label>
                <input
                  type="text" placeholder="e.g. India"
                  value={form.country}
                  onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                  onKeyDown={handleKey}
                  className="w-full bg-slate-50 border-2 border-slate-200 px-4 py-3.5 rounded-2xl text-sm font-semibold text-slate-900 outline-none focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 mb-4">
                <AlertTriangle size={14} className="shrink-0" /> {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="flex items-center gap-2 bg-slate-900 text-white font-bold text-sm px-8 py-4 rounded-2xl shadow-xl hover:bg-emerald-600 hover:shadow-emerald-500/20 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading
                  ? <><Loader size={16} className="animate-spin" /> Fetching Data…</>
                  : <><Search size={16} /> Get Live AQI</>}
              </button>
              {data && (
                <button
                  onClick={handleSearch}
                  className="flex items-center gap-2 bg-white border-2 border-slate-200 text-slate-700 font-bold text-sm px-6 py-4 rounded-2xl hover:border-emerald-400 hover:text-emerald-600 transition-all"
                >
                  <RefreshCw size={16} /> Refresh
                </button>
              )}
            </div>
          </div>

          {/* ── RESULTS ─── */}
          {data && (
            <>
              {/* Main AQI Hero Card */}
              <div className={`bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl ${style.glow} border-2 ${style.border} mb-8 relative overflow-hidden`}>
                <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[80px] opacity-20 ${style.bg}`} />
                <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${style.gradient}`} />

                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                  {/* Gauge */}
                  <div className="shrink-0">
                    <AQIGauge aqi={data.aqi} style={style} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                      <MapPin size={16} className="text-slate-400" />
                      <span className="text-sm font-bold text-slate-500 truncate max-w-xs">
                        {data.location.display_name}
                      </span>
                    </div>

                    <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 mb-2">
                      {data.location.city}
                      {data.location.state && <span className="text-slate-400">, {data.location.state}</span>}
                    </h2>
                    {data.location.country && (
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
                        {data.location.country}
                      </p>
                    )}

                    <div className="flex items-center gap-3 justify-center md:justify-start mb-6">
                      <span className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-sm border-2 ${style.light} ${style.text} ${style.border} shadow-sm`}>
                        {style.icon} {style.label}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        Updated: {new Date(data.recorded_at).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className={`${style.light} ${style.border} border rounded-2xl px-5 py-3 inline-block`}>
                      <p className={`text-sm font-bold ${style.text}`}>{style.advice}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pollutants Grid */}
              <div className="mb-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
                  Pollutant Breakdown
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <PollutantCard
                    label="PM2.5" value={data.pollutants.pm25} unit="µg/m³"
                    icon={<CloudSnow size={16} />}
                    color={{ light: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' }}
                  />
                  <PollutantCard
                    label="PM10" value={data.pollutants.pm10} unit="µg/m³"
                    icon={<CloudSnow size={16} />}
                    color={{ light: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' }}
                  />
                  <PollutantCard
                    label="NO₂" value={data.pollutants.no2} unit="µg/m³"
                    icon={<Zap size={16} />}
                    color={{ light: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' }}
                  />
                  <PollutantCard
                    label="SO₂" value={data.pollutants.so2} unit="µg/m³"
                    icon={<Flame size={16} />}
                    color={{ light: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' }}
                  />
                  <PollutantCard
                    label="O₃ (Ozone)" value={data.pollutants.o3} unit="µg/m³"
                    icon={<Thermometer size={16} />}
                    color={{ light: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' }}
                  />
                  <PollutantCard
                    label="CO" value={data.pollutants.co} unit="µg/m³"
                    icon={<Droplets size={16} />}
                    color={{ light: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' }}
                  />
                </div>
              </div>

              {/* AQI Scale Reference */}
              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">AQI Reference Scale</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { range: '0–50',   label: 'Good',             color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
                    { range: '51–100', label: 'Moderate',          color: 'bg-amber-500',   text: 'text-amber-700',   bg: 'bg-amber-50'   },
                    { range: '101–150',label: 'Sensitive',         color: 'bg-orange-500',  text: 'text-orange-700',  bg: 'bg-orange-50'  },
                    { range: '151–200',label: 'Unhealthy',         color: 'bg-red-500',     text: 'text-red-700',     bg: 'bg-red-50'     },
                    { range: '201–300',label: 'Very Unhealthy',    color: 'bg-rose-600',    text: 'text-rose-800',    bg: 'bg-rose-50'    },
                    { range: '301+',   label: 'Hazardous',         color: 'bg-purple-700',  text: 'text-purple-900',  bg: 'bg-purple-50'  },
                  ].map(s => (
                    <div key={s.range} className={`${s.bg} rounded-2xl p-4 text-center ${data.aqi != null && (
                      (s.range === '0–50'    && data.aqi <= 50)  ||
                      (s.range === '51–100'  && data.aqi > 50  && data.aqi <= 100) ||
                      (s.range === '101–150' && data.aqi > 100 && data.aqi <= 150) ||
                      (s.range === '151–200' && data.aqi > 150 && data.aqi <= 200) ||
                      (s.range === '201–300' && data.aqi > 200 && data.aqi <= 300) ||
                      (s.range === '301+'    && data.aqi > 300)
                    ) ? 'ring-2 ring-offset-2 ring-slate-900 scale-105 shadow-md' : ''} transition-all`}>
                      <div className={`w-3 h-3 rounded-full ${s.color} mx-auto mb-2`} />
                      <p className={`text-xs font-black ${s.text}`}>{s.range}</p>
                      <p className="text-[10px] font-bold text-slate-500 mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── EMPTY STATE ─── */}
          {!data && !loading && (
            <div className="bg-white rounded-[3rem] p-16 border border-slate-100 shadow-sm text-center">
              <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Wind size={40} className="text-emerald-400" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Enter a Location</h3>
              <p className="text-slate-500 font-medium max-w-sm mx-auto">
                Type any city name — you can also add state and country for more precise results.
              </p>
              <div className="flex gap-3 justify-center mt-8 flex-wrap">
                {['Delhi, India', 'Mumbai, India', 'London, UK', 'New York, USA', 'Beijing, China'].map(ex => (
                  <button
                    key={ex}
                    onClick={() => {
                      const [city, ...rest] = ex.split(', ');
                      setForm({ city, state: '', country: rest.join(', ') });
                    }}
                    className="bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold px-4 py-2 rounded-full hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-all"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </PageWrapper>
  );
}

export default AirQuality;