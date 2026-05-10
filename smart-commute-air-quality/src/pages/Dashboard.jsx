import { Link } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import { MapPin, Wind, History, ArrowRight, Leaf, Activity, SquareActivity, Route, Shield, Crown } from 'lucide-react';
import { getCommuteStats } from '../utils/commuteStats';

function aqiLabel(aqi) {
  if (aqi == null)   return { text: 'No Data',          color: 'text-slate-400' };
  if (aqi <= 50)     return { text: 'Great Air Quality', color: 'text-emerald-600' };
  if (aqi <= 100)    return { text: 'Moderate Quality',  color: 'text-amber-600'  };
  if (aqi <= 150)    return { text: 'Sensitive Groups',  color: 'text-orange-600' };
  if (aqi <= 200)    return { text: 'Unhealthy Air',     color: 'text-red-600'    };
  return               { text: 'Hazardous',              color: 'text-rose-700'   };
}

// AQI ring stroke offset: 220 full circle → offset proportional to aqi/300
function aqiOffset(aqi) {
  if (aqi == null) return 220;
  return Math.max(0, 220 - (Math.min(aqi, 300) / 300) * 220);
}

function aqiRingColor(aqi) {
  if (aqi == null || aqi <= 50)  return 'text-emerald-500';
  if (aqi <= 100)                return 'text-amber-500';
  if (aqi <= 150)                return 'text-orange-500';
  if (aqi <= 200)                return 'text-red-500';
  return                                'text-rose-600';
}

function fmt(km) {
  return km >= 1 ? `${km.toFixed(1)} km` : `${Math.round(km * 1000)} m`;
}

function Dashboard() {
  const profileRaw = localStorage.getItem('userProfile');
  const user       = profileRaw && profileRaw !== 'undefined' ? JSON.parse(profileRaw) : null;
  const firstName  = user?.name ? user.name.split(' ')[0] : 'Traveler';

  const {
    total, totalDistKm, safeTrips, safeRate, avgAQI,
    healthScore, weekCO2, weekTrips, co2Saved,
  } = getCommuteStats();

  const { text: aqiText, color: aqiColor } = aqiLabel(avgAQI);
  const hasData = total > 0;

  return (
    <PageWrapper>
      <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12 selection:bg-emerald-500/30">

        {/* ── TOP HEADER ─────────────────────────────────────────── */}
        <header className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="relative flex h-3 w-3">
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-600 font-black text-xs uppercase tracking-[0.2em]">Live Environmental Feed</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter flex items-center gap-3 flex-wrap">
              Welcome back, <span className="text-emerald-600">{firstName}</span>
              {user?.isPremium && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-200 to-amber-300 text-amber-800 text-sm font-black rounded-lg shadow-sm border border-amber-400/50 uppercase tracking-widest mt-1">
                  <Crown size={16} strokeWidth={3} /> {user.premiumPlan} ACTIVE
                </span>
              )}
            </h2>
          </div>

          {/* AQI Overview Widget — driven by real avg AQI */}
          <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-emerald-100/40 border border-emerald-50 flex items-center gap-6 min-w-[310px] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-[100px] -z-10"></div>
            <div className="relative flex items-center justify-center">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100" />
                <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="6" fill="transparent"
                  strokeDasharray="220"
                  strokeDashoffset={aqiOffset(avgAQI)}
                  className={`${aqiRingColor(avgAQI)} transition-all`} />
              </svg>
              <span className="absolute text-xl font-black text-slate-800">{avgAQI ?? '—'}</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                <Activity size={12} /> Avg Route AQI
              </p>
              <h4 className={`text-xl font-black leading-tight tracking-tight mt-0.5 ${aqiColor}`}>{aqiText}</h4>
              <div className="flex gap-3 mt-1.5 text-[10px] font-bold text-slate-400">
                <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                  {total > 0 ? `${total} trips` : 'No trips yet'}
                </span>
                <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                  {total > 0 ? `${fmt(totalDistKm)} total` : 'Plan a route'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* ── STATS BENTO GRID ───────────────────────────────────── */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">

          {/* Weekly Summary Card */}
          <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2.5rem] text-white relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-emerald-400 text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                <Leaf size={14} /> Weekly Summary
              </p>
              {hasData ? (
                <>
                  <h3 className="text-3xl font-black mb-4 tracking-tight">
                    You saved {weekCO2 > 0 ? `${weekCO2}kg` : `${co2Saved}kg`} of CO₂
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-sm font-medium">
                    {weekTrips > 0
                      ? `${weekTrips} optimized route${weekTrips > 1 ? 's' : ''} this week. Keep it up!`
                      : `${total} total optimized routes recorded. You've reduced your environmental footprint.`}
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-3xl font-black mb-4 tracking-tight">Start Your First Route</h3>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-sm font-medium">
                    Plan a safe route in Route AI — your CO₂ savings and health stats will appear here automatically.
                  </p>
                </>
              )}
            </div>
            <div className="absolute -bottom-10 -right-10 text-slate-700/50">
              <Leaf size={200} strokeWidth={1} />
            </div>
          </div>

          {/* Total Trips */}
          <div className="bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 p-8 rounded-[2.5rem] flex flex-col justify-center items-center text-center transition-shadow duration-300">
            <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-4">
              <MapPin size={20} />
            </div>
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">Total Trips</p>
            <span className="text-5xl font-black text-slate-900 tracking-tighter">{total}</span>
            {total > 0 && (
              <p className="text-xs text-slate-400 font-medium mt-2">
                {safeRate}% safe routes
              </p>
            )}
          </div>

          {/* Health Score */}
          <div className="bg-white border border-emerald-100 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 p-8 rounded-[2.5rem] flex flex-col justify-center items-center text-center transition-shadow duration-300">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-4">
              <SquareActivity size={20} />
            </div>
            <p className="text-emerald-600 text-xs font-black uppercase tracking-widest mb-2">Health Score</p>
            <span className="text-5xl font-black text-emerald-600 tracking-tighter">
              {healthScore != null ? `${healthScore}%` : '—'}
            </span>
            {healthScore == null && (
              <p className="text-xs text-slate-400 font-medium mt-2">Plan a route first</p>
            )}
          </div>
        </div>

        {/* ── SAFE RATE BAR (only if trips exist) ───────────────── */}
        {hasData && (
          <div className="max-w-7xl mx-auto mb-12">
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 flex flex-col md:flex-row items-center gap-6">
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <Shield size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Safe Route Rate</p>
                  <p className="text-lg font-black text-slate-900">{safeRate}% of your trips were AQI ≤ 100</p>
                </div>
              </div>
              <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden min-w-0">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${safeRate}%` }}
                />
              </div>
              <span className="text-sm font-black text-emerald-600 shrink-0">{safeTrips || safeRate > 0 ? `${Math.round((safeRate / 100) * total)} / ${total}` : '0 / 0'}</span>
            </div>
          </div>
        )}

        {/* ── FEATURE CARDS ──────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link to="/route-checker" className="block focus:outline-none">
            <div className="group bg-white border border-slate-200 p-10 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 hover:border-emerald-200 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden h-full flex flex-col">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[100px] -z-10 group-hover:bg-emerald-50 transition-colors"></div>
              <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-8 text-slate-400 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500 transition-all duration-300 shadow-sm">
                <Route size={24} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">Route Intelligence</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-1 font-medium">Plan the healthiest path to your destination using live pollution heatmaps.</p>
              <div className="text-slate-400 group-hover:text-emerald-600 font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-colors">
                Open Planner <ArrowRight size={14} />
              </div>
            </div>
          </Link>

          <Link to="/air-quality" className="block focus:outline-none">
            <div className="group bg-white border border-slate-200 p-10 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 hover:border-emerald-200 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden h-full flex flex-col">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[100px] -z-10 group-hover:bg-emerald-50 transition-colors"></div>
              <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-8 text-slate-400 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500 transition-all duration-300 shadow-sm">
                <Wind size={24} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">AQI Stations</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-1 font-medium">Real-time telemetry from city-wide atmospheric monitoring stations.</p>
              <div className="text-slate-400 group-hover:text-emerald-600 font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-colors">
                View Live Feed <ArrowRight size={14} />
              </div>
            </div>
          </Link>

          <Link to="/history" className="block focus:outline-none">
            <div className="group bg-white border border-slate-200 p-10 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 hover:border-emerald-200 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden h-full flex flex-col">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[100px] -z-10 group-hover:bg-emerald-50 transition-colors"></div>
              <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-8 text-slate-400 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500 transition-all duration-300 shadow-sm">
                <History size={24} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">Analytics History</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-1 font-medium">Deep dive into your journey archives and health impact over time.</p>
              <div className="text-slate-400 group-hover:text-emerald-600 font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-colors">
                Review Logs <ArrowRight size={14} />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </PageWrapper>
  );
}

export default Dashboard;