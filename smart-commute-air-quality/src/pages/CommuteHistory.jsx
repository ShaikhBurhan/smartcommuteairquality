import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import {
  History, Route, TreePine, Timer, MapPin,
  ArrowRight, Wind, Trash2, Navigation, Plus
} from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(metres) {
  if (metres == null) return '—';
  return metres >= 1000 ? `${(metres / 1000).toFixed(1)} km` : `${Math.round(metres)} m`;
}

function fmtTime(seconds) {
  if (seconds == null) return '—';
  const m = Math.floor(seconds / 60);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60}m`;
}

function fmtDate(iso) {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffDays = Math.floor((now - d) / 86400000);
    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 0) return `Today, ${timeStr}`;
    if (diffDays === 1) return `Yesterday, ${timeStr}`;
    return `${d.toLocaleDateString([], { day: 'numeric', month: 'short' })}, ${timeStr}`;
  } catch { return iso; }
}

function aqiBadge(aqi) {
  if (aqi == null) return { label: 'No Data', cls: 'bg-slate-100 text-slate-500 border-slate-200' };
  if (aqi <= 50)   return { label: 'Good',       cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  if (aqi <= 100)  return { label: 'Moderate',    cls: 'bg-amber-50 text-amber-700 border-amber-200' };
  if (aqi <= 150)  return { label: 'Sensitive',   cls: 'bg-orange-50 text-orange-700 border-orange-200' };
  if (aqi <= 200)  return { label: 'Unhealthy',   cls: 'bg-red-50 text-red-700 border-red-200' };
  return                  { label: 'Hazardous',   cls: 'bg-rose-100 text-rose-800 border-rose-300' };
}

/** AQI bar width as percent of max 300 */
function aqiBarWidth(aqi) {
  if (aqi == null) return '0%';
  return `${Math.min((aqi / 300) * 100, 100).toFixed(0)}%`;
}

/** Bar colour depending on AQI level */
function aqiBarColor(aqi) {
  if (aqi == null || aqi <= 50)  return 'bg-emerald-500';
  if (aqi <= 100)                return 'bg-amber-500';
  if (aqi <= 150)                return 'bg-orange-500';
  if (aqi <= 200)                return 'bg-red-500';
  return                                'bg-rose-700';
}

// ─── Summary stats for header ─────────────────────────────────────────────────
function calcStats(trips) {
  const total = trips.length;
  const totalDist = trips.reduce((s, t) => s + (t.distance || 0), 0);
  const validAQI  = trips.filter(t => t.aqi != null);
  const avgAQI    = validAQI.length
    ? Math.round(validAQI.reduce((s, t) => s + t.aqi, 0) / validAQI.length)
    : null;
  return { total, totalDist, avgAQI };
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
function CommuteHistory() {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('commuteHistory') || '[]');
      setTrips(stored);
    } catch { setTrips([]); }
  }, []);

  const clearAll = () => {
    localStorage.removeItem('commuteHistory');
    setTrips([]);
  };

  const removeTrip = (id) => {
    const updated = trips.filter(t => t.id !== id);
    localStorage.setItem('commuteHistory', JSON.stringify(updated));
    setTrips(updated);
  };

  const { total, totalDist, avgAQI } = calcStats(trips);

  return (
    <PageWrapper>
      <div className="min-h-screen bg-[#f8fafc] p-6 text-slate-900 md:p-12 relative overflow-hidden">

        {/* BG grid */}
        <div className="absolute inset-0 opacity-[0.03] z-0 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="max-w-5xl mx-auto relative z-10">

          {/* ── HEADER ── */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center text-indigo-500">
                  <History size={24} />
                </div>
                <h1 className="text-4xl font-black tracking-tight text-slate-900">Journey Archives</h1>
              </div>
              <p className="text-slate-500 font-medium text-lg ml-1">
                Your route history saved automatically from Route AI.
              </p>
            </div>
            {trips.length > 0 && (
              <button
                onClick={clearAll}
                className="flex items-center gap-2 text-sm font-bold text-rose-600 bg-rose-50 border border-rose-200 px-5 py-3 rounded-2xl hover:bg-rose-100 transition-colors"
              >
                <Trash2 size={15} /> Clear All
              </button>
            )}
          </div>

          {/* ── SUMMARY STATS ── */}
          {trips.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm text-center">
                <p className="text-3xl font-black text-slate-900">{total}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Total Trips</p>
              </div>
              <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm text-center">
                <p className="text-3xl font-black text-slate-900">{fmt(totalDist)}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Total Distance</p>
              </div>
              <div className="bg-white rounded-[2rem] p-6 border border-emerald-100 shadow-sm text-center">
                <p className={`text-3xl font-black ${avgAQI != null ? aqiBadge(avgAQI).cls.split(' ')[1] : 'text-slate-400'}`}>
                  {avgAQI ?? '—'}
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Avg AQI Exposure</p>
              </div>
            </div>
          )}

          {/* ── TRIP LIST ── */}
          <div className="bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-4">
            <div className="bg-slate-50 rounded-[2.5rem] p-8 min-h-[400px]">

              <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-5">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">
                  Recorded Routes
                </h3>
                <span className="text-xs font-bold bg-white px-3 py-1.5 rounded-full text-slate-500 shadow-sm border border-slate-100">
                  {trips.length} {trips.length === 1 ? 'trip' : 'trips'} recorded
                </span>
              </div>

              {trips.length === 0 ? (
                /* ── EMPTY STATE ── */
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                    <Navigation size={32} className="text-indigo-300" />
                  </div>
                  <h3 className="text-xl font-black text-slate-700 mb-2">No trips yet</h3>
                  <p className="text-slate-400 font-medium text-sm max-w-xs mb-8">
                    Your trips will appear here automatically after you calculate a route in Route AI.
                  </p>
                  <Link
                    to="/route-checker"
                    className="flex items-center gap-2 bg-slate-900 text-white font-bold text-sm px-6 py-3.5 rounded-2xl shadow-xl hover:bg-indigo-600 transition-colors"
                  >
                    <Plus size={16} /> Plan Your First Route
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {trips.map((trip) => {
                    const badge = aqiBadge(trip.aqi);
                    return (
                      <div
                        key={trip.id}
                        className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md border border-slate-100 flex flex-col md:flex-row justify-between md:items-center gap-6 group transition-shadow duration-300"
                      >
                        {/* Left: Route info */}
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center shrink-0 border border-indigo-100">
                            <Route size={20} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-base font-black text-slate-800 tracking-tight truncate">
                                {trip.from}
                              </span>
                              <ArrowRight size={14} className="text-slate-400 shrink-0" />
                              <span className="text-base font-black text-slate-800 tracking-tight truncate">
                                {trip.to}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-slate-400">
                              {trip.id} &bull; {fmtDate(trip.date)}
                              {trip.alternativesCount > 1 && (
                                <span className="ml-2 text-emerald-600">
                                  (Cleanest of {trip.alternativesCount} routes)
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Right: Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full md:w-auto shrink-0">

                          <div>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1">
                              <MapPin size={10} /> Distance
                            </p>
                            <p className="text-sm font-bold text-slate-800 mt-1">{fmt(trip.distance)}</p>
                          </div>

                          <div>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1">
                              <Timer size={10} /> Duration
                            </p>
                            <p className="text-sm font-bold text-slate-800 mt-1">{fmtTime(trip.duration)}</p>
                          </div>

                          <div className="col-span-2 lg:col-span-2">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1">
                              <Wind size={10} className="text-indigo-400" /> Air Quality Score
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${aqiBarColor(trip.aqi)}`}
                                  style={{ width: aqiBarWidth(trip.aqi) }}
                                />
                              </div>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border shrink-0 ${badge.cls}`}>
                                {trip.aqi != null ? `AQI ${trip.aqi}` : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Delete btn */}
                        <button
                          onClick={() => removeTrip(trip.id)}
                          className="hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity shrink-0 w-10 h-10 rounded-full bg-rose-50 items-center justify-center text-rose-400 hover:bg-rose-100 hover:text-rose-600"
                          title="Remove trip"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Footer CTA */}
              {trips.length > 0 && (
                <div className="mt-8 flex items-center justify-between">
                  <Link
                    to="/route-checker"
                    className="flex items-center gap-2 text-sm font-bold text-indigo-600 bg-indigo-50 px-5 py-3 rounded-xl hover:bg-indigo-100 transition-colors"
                  >
                    <Plus size={15} /> Plan New Route
                  </Link>
                  <p className="text-xs font-medium text-slate-400">Showing last {trips.length} trips • Stored locally</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default CommuteHistory;