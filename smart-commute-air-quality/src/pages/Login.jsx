import { Link } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowLeft, Leaf, Shield, Activity, Droplets } from 'lucide-react';
import { useState } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

function Login({ onLogin }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', formData);
      if (res.data.success && res.data.requiresVerification) {
        // Email not verified — redirect to verification
        navigate('/verify-email', { state: { email: res.data.email } });
      } else if (res.data.success) {
        const { token, ...profile } = res.data;
        localStorage.setItem('userToken', token);
        localStorage.setItem('userProfile', JSON.stringify(profile));
        onLogin(profile);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check credentials.');
    }
  };

  const floatingItems = [
    { icon: <Shield size={24} />, title: 'Endpoint Security' },
    { icon: <Activity size={24} />, title: 'Live Telemetry' },
    { icon: <Droplets size={24} />, title: 'PM2.5 Filtration' },
  ];

  return (
    <div className="min-h-screen w-full flex bg-white font-sans selection:bg-emerald-500/30">

      {/* LEFT PANE - FORM */}
      <div className="w-full lg:w-1/2 flex flex-col p-8 md:p-16 xl:p-24 justify-center relative z-10">
        <Link to="/" className="absolute top-10 left-10 md:left-16 inline-flex items-center gap-2 text-slate-400 hover:text-emerald-500 font-bold text-xs uppercase tracking-widest transition-colors mb-12">
          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm"><ArrowLeft size={14} /></div>
          Gateway
        </Link>

        <div className="w-full max-w-sm mx-auto">
          <div className="mb-10 text-center lg:text-left">
            <div className="w-16 h-16 bg-slate-900 rounded-[1.2rem] flex items-center justify-center text-white shadow-xl shadow-slate-900/20 mb-6 mx-auto lg:mx-0">
              <LogIn size={28} />
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter mb-2">Welcome Back.</h2>
            <p className="text-slate-500 font-medium text-lg">Re-establish your secure connection.</p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-3 mb-6">
              <div className="w-2 h-2 rounded-full bg-rose-500"></div>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 group">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Authorized Email</label>
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
              <div className="flex items-center justify-between pr-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Passcode</label>
                <Link to="#" className="text-[10px] font-bold text-emerald-600 hover:text-emerald-500">Forgot Code?</Link>
              </div>
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
              className="w-full bg-slate-900 text-white font-bold text-base py-4 rounded-2xl mt-8 shadow-xl shadow-slate-900/20 hover:bg-emerald-500 hover:shadow-emerald-500/30 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Authenticate
            </button>
          </form>

          <p className="text-center lg:text-left text-sm font-bold text-slate-500 mt-10">
            New to the grid? <Link to="/register" className="text-emerald-600 hover:text-emerald-500 underline decoration-2 underline-offset-4 ml-1">Deploy New Node.</Link>
          </p>
        </div>
      </div>

      {/* RIGHT PANE - BRANDING */}
      <div className="hidden lg:flex w-1/2 p-4 relative z-0">
        <div className="w-full h-full bg-slate-900 rounded-[3rem] overflow-hidden relative flex flex-col items-center justify-center p-12 border border-slate-800 shadow-2xl">

          {/* Static Geometry */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-[600px] h-[600px] rounded-full border border-slate-700/50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-dashed"></div>
            <div className="w-[450px] h-[450px] rounded-full border border-emerald-500/20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="w-[300px] h-[300px] rounded-full bg-slate-800/80 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-slate-700 shadow-2xl flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent"></div>
              <Leaf size={80} className="text-emerald-400" strokeWidth={1} />
            </div>
          </div>

          {/* Glow Orb */}
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-[100px] pointer-events-none"></div>

          {/* Floating Data Display */}
          <div className="absolute bottom-12 left-12 right-12 z-20 flex justify-between gap-4">
            {floatingItems.map((item, idx) => (
              <div key={idx} className="flex-1 bg-slate-800/60 border border-slate-700/50 p-6 rounded-3xl shadow-2xl">
                <div className="text-emerald-400 mb-3">{item.icon}</div>
                <p className="text-white font-bold text-sm tracking-tight">{item.title}</p>
                <div className="w-8 h-1 bg-slate-600 mt-4 rounded-full"></div>
              </div>
            ))}
          </div>

          <div className="absolute top-12 left-12">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-xs uppercase tracking-widest border border-emerald-500/20 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              Platform Telemetry Active
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;