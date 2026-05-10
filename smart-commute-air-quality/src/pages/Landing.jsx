import { Link } from 'react-router-dom';
import { Leaf, Shield, Zap, ArrowRight, ShieldCheck, Activity, Map } from 'lucide-react';

function Landing() {
  return (
    <div className="bg-[#f8fafc] min-h-screen font-sans selection:bg-emerald-500/30 overflow-hidden relative">

      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] -z-10 pointer-events-none transform translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] -z-10 pointer-events-none transform -translate-x-1/3 translate-y-1/3"></div>

      {/* Hero Section */}
      <section className="relative px-6 pt-32 pb-20 md:pt-48 md:pb-32 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-600 font-bold text-xs uppercase tracking-widest mb-8 border border-emerald-100 shadow-sm">
          <Leaf size={14} /> Eco-Intelligence Platform 2.0
        </div>

        <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[1.1] mb-8">
          Navigate the city.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">Breathe</span> the difference.
        </h1>

        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mb-12 font-medium">
          Our AI-driven routing engine analyzes multi-node PM2.5 sensors in real-time, calculating commuting vectors that minimize pollutant exposure and maximize respiratory safety.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/register" className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-slate-900/20 hover:bg-emerald-500 hover:shadow-emerald-500/30 transition-all active:scale-95 flex items-center justify-center gap-2">
            Initialize Setup <ArrowRight size={18} />
          </Link>
          <Link to="/about" className="bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm">
            View Telemetry Specs
          </Link>
        </div>
      </section>

      {/* Data Visualization Mockup */}
      <section className="px-6 mb-32 max-w-6xl mx-auto">
        <div className="bg-slate-900 rounded-[3rem] p-4 shadow-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/50 rounded-[3rem] pointer-events-none z-20"></div>
          <div className="bg-slate-800 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden border border-slate-700 min-h-[400px] flex items-center justify-center">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(#475569 1px, transparent 1px), linear-gradient(90deg, #475569 1px, transparent 1px)", backgroundSize: "32px 32px" }}></div>

            <div className="relative z-10 w-full grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 p-6 rounded-3xl">
                <div className="flex items-center gap-3 mb-4 text-emerald-400">
                  <Activity size={20} /> <span className="font-bold text-xs uppercase tracking-widest text-slate-300">Live Scans</span>
                </div>
                <p className="text-4xl font-black text-white">4.2M</p>
              </div>
              <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 p-6 rounded-3xl">
                <div className="flex items-center gap-3 mb-4 text-blue-400">
                  <Map size={20} /> <span className="font-bold text-xs uppercase tracking-widest text-slate-300">Active Nodes</span>
                </div>
                <p className="text-4xl font-black text-white">1,024</p>
              </div>
              <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 p-6 rounded-3xl">
                <div className="flex items-center gap-3 mb-4 text-rose-400">
                  <ShieldCheck size={20} /> <span className="font-bold text-xs uppercase tracking-widest text-slate-300">Diverted Risk</span>
                </div>
                <p className="text-4xl font-black text-white">88%</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 pb-32 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-4">Unmatched Precision.</h2>
          <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">Our routing engine considers 14 specific environmental variants.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl border border-slate-200 transition-shadow group">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
              <Shield size={24} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-3">Health-First Routing</h3>
            <p className="text-slate-500 font-medium leading-relaxed">We calculate your vectors by placing biological safety above mere speed. Arrive unharmed.</p>
          </div>
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl border border-slate-200 transition-shadow group">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <Activity size={24} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-3">Live AQI Polling</h3>
            <p className="text-slate-500 font-medium leading-relaxed">Ping satellite and ground nodes in real-time. Know exactly what you're breathing before you step outside.</p>
          </div>
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl border border-slate-200 transition-shadow group">
            <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
              <Zap size={24} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-3">Impact Analytics</h3>
            <p className="text-slate-500 font-medium leading-relaxed">Track your historical footprint and view the direct carbon and emission reductions you've achieved.</p>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Landing;