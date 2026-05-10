import { Link } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import { Target, Leaf, Cpu, Award, MapPin, Shield, Wind, ArrowRight, TrendingUp } from 'lucide-react';
import { getCommuteStats } from '../utils/commuteStats';

// Eco score ring offset: circumference = 2π×110 ≈ 691
function ecoOffset(score) {
  return Math.max(0, 691 - (score / 100) * 691);
}

function ecoRingColor(score) {
  if (score >= 75) return '#10b981'; // emerald
  if (score >= 50) return '#f59e0b'; // amber
  if (score >= 25) return '#f97316'; // orange
  return '#ef4444';                  // red
}

function ecoRank(score) {
  if (score >= 90) return { label: 'Platinum Eco Hero',  pct: 'Top 5%',  desc: 'Exceptional commitment to clean air commuting.' };
  if (score >= 75) return { label: 'Gold Carbon Saver',  pct: `Top ${100 - score + 5}%`, desc: 'Consistently choosing the cleanest routes available.' };
  if (score >= 50) return { label: 'Silver Commuter',    pct: `Top ${100 - score + 10}%`, desc: 'Good progress — keep picking low-AQI routes to rank up.' };
  if (score >= 25) return { label: 'Bronze Starter',     pct: `Top ${100 - score + 15}%`, desc: 'You\'re on your way. More green routes will boost your score.' };
  return                  { label: 'Getting Started',    pct: 'New',    desc: 'Plan your first route to earn your eco ranking.' };
}

function StatCard({ icon, label, value, sub, color = 'slate' }) {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-500',
    blue:    'bg-blue-50 text-blue-500',
    amber:   'bg-amber-50 text-amber-500',
    rose:    'bg-rose-50 text-rose-500',
    slate:   'bg-slate-50 text-slate-500',
  };
  return (
    <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm text-center">
      <div className={`w-10 h-10 ${colors[color]} rounded-xl flex items-center justify-center mx-auto mb-3`}>
        {icon}
      </div>
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-black text-slate-900">{value}</p>
      {sub && <p className="text-xs text-slate-400 font-medium mt-1">{sub}</p>}
    </div>
  );
}

function EcoScore() {
  const {
    total, totalDistKm, safeTrips, safeRate,
    avgAQI, healthScore, co2Saved, ecoScore,
    percentile, weekTrips, weekCO2,
  } = getCommuteStats();

  const rank       = ecoRank(ecoScore);
  const hasData    = total > 0;
  const ringColor  = ecoRingColor(ecoScore);

  return (
    <PageWrapper>
      <div className="min-h-screen bg-[#f8fafc] p-6 text-slate-900 md:p-12 relative overflow-hidden">

        {/* BG grid */}
        <div className="absolute inset-0 opacity-[0.03] z-0 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        {/* BG orb */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">

          {/* ── HEADER ── */}
          <div className="flex flex-col items-center justify-center pt-8 mb-12">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-3xl shadow-xl shadow-emerald-500/30 flex items-center justify-center text-white mb-6">
              <Target size={32} />
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-slate-900 mb-4 text-center">Your Eco-Rating</h1>
            <p className="text-slate-500 font-medium text-lg text-center max-w-2xl mx-auto">
              Computed from your real route history — safe rate, AQI exposure, and total distance covered.
            </p>
          </div>

          {/* ── MAIN SCORE CARD ── */}
          <div className="max-w-4xl mx-auto mb-10">
            <div className="bg-white p-10 md:p-12 rounded-[4rem] shadow-2xl shadow-slate-200/50 border border-emerald-50 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] -z-10 transform translate-x-1/2 -translate-y-1/2 pointer-events-none" />

              {/* Ring gauge */}
              <div className="relative shrink-0 flex items-center justify-center">
                <svg className="w-64 h-64 transform -rotate-90">
                  <circle cx="128" cy="128" r="110" stroke="#f1f5f9" strokeWidth="20" fill="transparent" />
                  <circle
                    cx="128" cy="128" r="110"
                    stroke={ringColor}
                    strokeWidth="20"
                    fill="transparent"
                    strokeDasharray="691"
                    strokeDashoffset={ecoOffset(ecoScore)}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s ease' }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-400 mb-1">Eco Score</span>
                  <span className="text-7xl font-black text-slate-900 tracking-tighter">
                    {ecoScore}<span className="text-3xl" style={{ color: ringColor }}>%</span>
                  </span>
                  <span className="text-xs font-bold text-slate-400 mt-1">{rank.pct} of commuters</span>
                </div>
              </div>

              {/* Right info */}
              <div className="flex-1 space-y-5">
                {/* Rank badge */}
                <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl flex items-start gap-4">
                  <div className="bg-white p-2 rounded-xl shadow-sm text-emerald-500 shrink-0">
                    <Award size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-lg tracking-tight">{rank.label}</h4>
                    <p className="text-sm text-emerald-700 font-medium leading-relaxed mt-1">{rank.desc}</p>
                  </div>
                </div>

                {/* Mini stats grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm text-center">
                    <Leaf size={22} className="mx-auto text-emerald-500 mb-2" />
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">CO₂ Avoided</p>
                    <p className="text-2xl font-black text-slate-900">{co2Saved > 0 ? `${co2Saved} kg` : '—'}</p>
                    {!hasData && <p className="text-[10px] text-slate-400 mt-1">Plan a route to track</p>}
                  </div>
                  <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm text-center">
                    <Cpu size={22} className="mx-auto text-blue-500 mb-2" />
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Safe Routes</p>
                    <p className="text-2xl font-black text-slate-900">{hasData ? safeTrips : '—'}</p>
                    {hasData && <p className="text-[10px] text-slate-400 mt-1">AQI ≤ 100</p>}
                  </div>
                </div>

                {hasData && (
                  <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
                    <TrendingUp size={16} className="text-emerald-500 shrink-0" />
                    <p className="text-xs font-semibold text-slate-600">
                      {weekTrips > 0
                        ? `This week: ${weekTrips} route${weekTrips > 1 ? 's' : ''}, saved ${weekCO2} kg CO₂`
                        : `${totalDistKm} km total commuted across ${total} trips`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── DETAILED BREAKDOWN ── */}
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <StatCard icon={<MapPin size={18} />}    label="Total Trips"      value={total}                       color="slate"   />
            <StatCard icon={<Wind size={18} />}       label="Avg AQI"          value={avgAQI ?? '—'}               color="emerald" />
            <StatCard icon={<Shield size={18} />}     label="Safe Rate"        value={hasData ? `${safeRate}%` : '—'} color="amber"   />
            <StatCard icon={<Leaf size={18} />}       label="Health Score"     value={healthScore != null ? `${healthScore}%` : '—'} color="emerald" />
          </div>

          {/* ── Safe Rate Progress Bar ── */}
          {hasData && (
            <div className="max-w-4xl mx-auto bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 mb-10">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-black text-slate-700">Safe Route Rate</p>
                <span className="text-sm font-black text-emerald-600">{safeRate}%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${safeRate}%`, transition: 'width 1s ease' }}
                />
              </div>
              <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          )}

          {/* ── Empty state CTA ── */}
          {!hasData && (
            <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-12 text-center">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target size={36} className="text-emerald-300" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">No trips recorded yet</h3>
              <p className="text-slate-500 font-medium text-sm max-w-sm mx-auto mb-8">
                Plan and calculate routes using Route AI — your eco score will update automatically after each trip.
              </p>
              <Link
                to="/route-checker"
                className="inline-flex items-center gap-2 bg-slate-900 text-white font-bold text-sm px-8 py-4 rounded-2xl shadow-xl hover:bg-emerald-600 transition-colors"
              >
                Plan First Route <ArrowRight size={16} />
              </Link>
            </div>
          )}

        </div>
      </div>
    </PageWrapper>
  );
}

export default EcoScore;