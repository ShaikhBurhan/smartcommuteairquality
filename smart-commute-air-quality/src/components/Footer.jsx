function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-white pt-16 pb-8 border-t border-emerald-50 overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-40 -mr-32 -mb-32"></div>

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          
          {/* Column 1: Project Info */}
          <div className="space-y-4 text-center md:text-left">
            <h2 className="text-xl font-black text-slate-800">
              Smart<span className="text-emerald-500">Commute</span>
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto md:mx-0">
              An intelligent assistant for environmental-aware urban navigation and spatial air quality analysis.
            </p>
          </div>

          {/* Column 2: Tech Specs (Impresses Faculty) */}
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-4 italic">
              System Architecture
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="bg-slate-50 border border-slate-100 px-3 py-1 rounded-md text-[10px] font-bold text-slate-600 uppercase">React 18</span>
              <span className="bg-slate-50 border border-slate-100 px-3 py-1 rounded-md text-[10px] font-bold text-slate-600 uppercase">Tailwind v3</span>
              <span className="bg-slate-50 border border-slate-100 px-3 py-1 rounded-md text-[10px] font-bold text-slate-600 uppercase">Vite Core</span>
            </div>
          </div>

          {/* Column 3: Academic Submission */}
          <div className="text-center md:text-right space-y-2">
            <p className="text-slate-800 font-bold text-sm uppercase tracking-tighter">Academic Review Submission</p>
            <p className="text-emerald-600 font-black text-lg">IMCA Semester VIII</p>
            <p className="text-slate-400 text-[10px] uppercase font-medium tracking-widest">Major Project Phase — 01</p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-[11px] font-bold uppercase tracking-widest">
          <p>© {currentYear} Environment Intelligence Lab</p>
          <div className="flex gap-6">
            <span className="hover:text-emerald-500 cursor-pointer transition-colors">Documentation</span>
            <span className="hover:text-emerald-500 cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-emerald-500 cursor-pointer transition-colors">Privacy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;