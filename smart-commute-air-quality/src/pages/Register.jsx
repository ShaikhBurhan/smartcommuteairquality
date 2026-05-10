import { useState } from 'react';
import api from '../utils/api';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ArrowLeft, ShieldCheck, Cpu, Zap, Activity } from 'lucide-react';

function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/register', formData);
      if (res.data.success && res.data.requiresVerification) {
        // Redirect to email verification page
        navigate('/verify-email', { state: { email: res.data.email } });
      } else if (res.data.success) {
        // Fallback: direct login (shouldn't happen with OTP flow)
        const { token, ...profile } = res.data;
        localStorage.setItem('userToken', token);
        localStorage.setItem('userProfile', JSON.stringify(profile));
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration sequence failed.');
    }
  };

  const featureCards = [
    { icon: <Cpu size={20} />, title: 'AI Routing', color: 'text-emerald-400' },
    { icon: <Zap size={20} />, title: 'Live Sync', color: 'text-blue-400' },
    { icon: <Activity size={20} />, title: 'Health Index', color: 'text-rose-400' },
  ];

  return (
    <div className="min-h-screen w-full flex bg-white font-sans selection:bg-emerald-500/30">

      {/* LEFT PANE - FORM */}
      <div className="w-full lg:w-[45%] flex flex-col p-8 md:p-16 xl:p-24 justify-center relative z-10">
        <Link to="/" className="absolute top-10 left-10 md:left-16 inline-flex items-center gap-2 text-slate-400 hover:text-emerald-500 font-bold text-xs uppercase tracking-widest transition-colors mb-12">
          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm"><ArrowLeft size={14} /></div>
          Abort
        </Link>

        <div className="w-full max-w-sm mx-auto">
          <div className="mb-10 text-center lg:text-left">
            <div className="w-16 h-16 bg-emerald-50 border-2 border-emerald-100 rounded-[1.2rem] flex items-center justify-center text-emerald-600 shadow-xl shadow-emerald-500/10 mb-6 mx-auto lg:mx-0">
              <ShieldCheck size={28} />
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter mb-2">Initialize.</h2>
            <p className="text-slate-500 font-medium text-lg">Configure your new telemetry node.</p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-3 mb-6">
              <div className="w-2 h-2 rounded-full bg-rose-500"></div>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2 group">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Legal Identity</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                  <User size={20} />
                </div>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-50/50 border-2 border-slate-100 pl-12 pr-4 py-4 rounded-2xl text-base font-bold text-slate-900 outline-none focus:bg-white focus:border-emerald-400 focus:shadow-[0_0_0_4px_rgba(52,211,153,0.1)] transition-all placeholder:text-slate-300"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Secure Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  required
                  className="w-full bg-slate-50/50 border-2 border-slate-100 pl-12 pr-4 py-4 rounded-2xl text-base font-bold text-slate-900 outline-none focus:bg-white focus:border-emerald-400 focus:shadow-[0_0_0_4px_rgba(52,211,153,0.1)] transition-all placeholder:text-slate-300"
                  placeholder="identity@domain.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Encryption Passcode</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  required
                  className="w-full bg-slate-50/50 border-2 border-slate-100 pl-12 pr-4 py-4 rounded-2xl text-base font-bold text-slate-900 outline-none focus:bg-white focus:border-emerald-400 focus:shadow-[0_0_0_4px_rgba(52,211,153,0.1)] transition-all placeholder:text-slate-300"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 text-white font-bold text-base py-4 rounded-2xl mt-8 shadow-xl shadow-emerald-500/30 hover:bg-emerald-600 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Broadcast Node
            </button>
          </form>

          <p className="text-center lg:text-left text-sm font-bold text-slate-500 mt-10">
            Already initialized? <Link to="/login" className="text-slate-900 hover:text-emerald-500 underline decoration-2 underline-offset-4 ml-1">Authenticate here.</Link>
          </p>
        </div>
      </div>

      {/* RIGHT PANE */}
      <div className="hidden lg:flex w-[55%] p-4 relative z-0">
        <div className="w-full h-full bg-slate-50 rounded-[3rem] overflow-hidden relative flex flex-col justify-end p-12 border border-slate-200">

          <div className="absolute inset-0 opacity-40 z-0" style={{ backgroundImage: "linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)", backgroundSize: "32px 32px", transform: "perspective(1000px) rotateX(60deg) scale(2)", transformOrigin: "top" }}></div>

          <div className="relative z-10 w-full max-w-lg mb-20 bg-white/70 backdrop-blur-3xl p-10 rounded-[2.5rem] border border-white shadow-2xl shadow-emerald-100/50">
            <h3 className="text-3xl font-black text-slate-800 tracking-tight leading-tight mb-4">
              Breathe easier, <br />travel smarter.
            </h3>
            <p className="text-slate-500 font-medium">Join thousands of conscious commuters actively reducing their carbon footprints and minimizing PM2.5 exposure daily.</p>

            <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-200">
              {featureCards.map((feat, i) => (
                <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-center">
                  <div className={`mx-auto w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mb-2 ${feat.color}`}>
                    {feat.icon}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{feat.title}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute top-12 right-12 text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-2">
            Registration Portal <ShieldCheck size={14} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;