import { Database, Binary, Cpu, Server } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';

function About() {
  return (
    <PageWrapper>
      <div className="bg-[#f8fafc] min-h-screen py-20 px-6 font-sans">
        <div className="max-w-4xl mx-auto">

          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center p-3 bg-emerald-100 text-emerald-600 rounded-2xl mb-6 shadow-sm">
              <Cpu size={32} />
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">System Architecture</h1>
            <p className="text-xl text-slate-500 font-medium">Technical specifications of the SmartCommute routing engine.</p>
          </div>

          <div className="space-y-8">
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200 flex flex-col md:flex-row gap-8 items-center">
              <div className="w-20 h-20 shrink-0 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100">
                <Binary size={36} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">Our Core Mission</h3>
                <p className="text-slate-500 leading-relaxed font-medium">
                  We built this platform to mitigate the physiological impact of urban airborne pollutants. By leveraging continuous geospatial intelligence, we empower both citizens and automated fleets to traverse zones with optimal atmospheric purity.
                </p>
              </div>
            </div>

            <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl flex flex-col md:flex-row gap-8 items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]"></div>
              <div className="w-20 h-20 shrink-0 bg-slate-800 rounded-2xl flex items-center justify-center text-emerald-400 border border-slate-700 relative z-10">
                <Database size={36} />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-black text-white mb-2">Data Integrity</h3>
                <p className="text-slate-300 leading-relaxed font-medium mb-4">
                  The MERN stack (MongoDB, Express, React, Node) guarantees non-blocking I/O across our telemetry pipelines. User accounts, historical vectors, and live AQI cache are all strictly localized and highly encrypted.
                </p>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-slate-800 rounded-lg text-xs font-bold text-slate-400">Node v18.x</span>
                  <span className="px-3 py-1 bg-slate-800 rounded-lg text-xs font-bold text-slate-400">React 18</span>
                  <span className="px-3 py-1 bg-slate-800 rounded-lg text-xs font-bold text-slate-400">MongoDB</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200 flex flex-col md:flex-row gap-8 items-center">
              <div className="w-20 h-20 shrink-0 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100">
                <Server size={36} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">Machine Learning Integrations</h3>
                <p className="text-slate-500 leading-relaxed font-medium">
                  We utilize Python-based ML nodes (accessible via API) strictly for 7-day predictability models. By analyzing previous particulate trends, the engine predicts high-PM2.5 choke points up to 168 hours in advance.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </PageWrapper>
  );
}

export default About;