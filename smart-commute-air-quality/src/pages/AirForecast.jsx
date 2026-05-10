import PageWrapper from '../components/PageWrapper';
import { CalendarDays, CloudRain, Sun, Cloud, Thermometer, Droplets, Wind, ArrowRight } from 'lucide-react';

const days = [
  { day: 'Today', aqi: 45, status: 'Good', icon: <Sun className="text-amber-500" />, temp: '28°C', humidity: '45%' },
  { day: 'Tomorrow', aqi: 82, status: 'Moderate', icon: <Cloud className="text-slate-400" />, temp: '26°C', humidity: '52%' },
  { day: 'Wednesday', aqi: 115, status: 'Unhealthy', icon: <CloudRain className="text-blue-500" />, temp: '22°C', humidity: '78%' },
  { day: 'Thursday', aqi: 140, status: 'Unhealthy', icon: <CloudRain className="text-blue-500" />, temp: '23°C', humidity: '80%' },
  { day: 'Friday', aqi: 65, status: 'Moderate', icon: <Cloud className="text-slate-400" />, temp: '25°C', humidity: '60%' },
];

function AirForecast() {
  return (
    <PageWrapper>
      <div className="min-h-screen bg-[#f8fafc] p-6 text-slate-900 md:p-12 relative overflow-hidden">

        <div className="absolute inset-0 opacity-[0.03] z-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)", backgroundSize: "32px 32px" }}></div>

        <div className="max-w-7xl mx-auto mb-10 relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-xl shadow-blue-500/20 flex items-center justify-center text-white">
                <CalendarDays size={24} />
              </div>
              <h2 className="text-4xl font-black tracking-tight text-slate-900">7-Day Prediction</h2>
            </div>
            <p className="text-slate-500 font-medium text-lg ml-1">AI-driven atmospheric projections for optimal commute planning.</p>
          </div>
        </div>

        {/* Highlight Banner */}
        <div className="max-w-7xl mx-auto mb-8 bg-slate-900 text-white rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px]"></div>
          <div className="relative z-10">
            <h3 className="text-2xl font-black mb-2 tracking-tight">Incoming Weather System</h3>
            <p className="text-slate-300 font-medium max-w-xl">
              Heavy rain expected on Wednesday will significantly clear particulate matter density strings. AQI is expected to improve by <span className="text-emerald-400 font-bold">45%</span> post-storm.
            </p>
          </div>
          <button className="mt-6 md:mt-0 relative z-10 bg-white text-slate-900 font-black px-6 py-3 rounded-xl text-sm flex items-center gap-2 hover:bg-emerald-400 hover:text-white transition-colors duration-300">
            Set Alert <ArrowRight size={16} />
          </button>
        </div>

        {/* Forecast List */}
        <div className="max-w-7xl mx-auto space-y-4 relative z-10">
          {days.map((d, i) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between hover:shadow-xl hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-300">
              <div className="flex items-center gap-6 w-full md:w-auto mb-4 md:mb-0">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shadow-inner shrink-0">
                  {d.icon}
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-800">{d.day}</h4>
                  <p className="text-sm font-bold text-slate-400">Projected Index</p>
                </div>
              </div>

              <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                <div className="flex items-center gap-6 text-slate-500 font-bold text-sm bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
                  <span className="flex items-center gap-1.5"><Thermometer size={16} className="text-rose-500" /> {d.temp}</span>
                  <span className="flex items-center gap-1.5"><Droplets size={16} className="text-cyan-500" /> {d.humidity}</span>
                </div>
                <div className="text-right shrink-0 min-w-[100px]">
                  <p className="text-3xl font-black tracking-tight text-slate-900">{d.aqi}</p>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${d.aqi > 100 ? 'text-rose-500' : d.aqi > 50 ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {d.status}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </PageWrapper>
  );
}

export default AirForecast;