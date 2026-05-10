import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, ShieldCheck, RefreshCw, Loader2, ArrowLeft } from 'lucide-react';
import api from '../utils/api';

function VerifyEmail({ onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef([]);

  // Redirect if no email in state
  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only last char
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data } = await api.post('/auth/verify-email', { email, otp: code });

      if (data.success) {
        // Store token and profile
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('userProfile', JSON.stringify({
          _id: data._id,
          name: data.name,
          email: data.email,
          success: true,
        }));

        setSuccess('✅ Email verified successfully! Redirecting...');
        onLogin();

        setTimeout(() => navigate('/dashboard'), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setResendLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data } = await api.post('/auth/resend-otp', { email });
      if (data.success) {
        setSuccess('📧 New verification code sent! Check your inbox.');
        setResendCooldown(60);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans selection:bg-emerald-500/30">

      {/* LEFT PANE — FORM */}
      <div className="w-full lg:w-1/2 flex flex-col p-8 md:p-16 xl:p-24 justify-center relative z-10">
        <button
          onClick={() => navigate('/register')}
          className="absolute top-10 left-10 md:left-16 inline-flex items-center gap-2 text-slate-400 hover:text-emerald-500 font-bold text-xs uppercase tracking-widest transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm">
            <ArrowLeft size={14} />
          </div>
          Back
        </button>

        <div className="w-full max-w-sm mx-auto">
          {/* Header */}
          <div className="mb-10 text-center lg:text-left">
            <div className="w-16 h-16 bg-emerald-50 border-2 border-emerald-100 rounded-[1.2rem] flex items-center justify-center text-emerald-600 shadow-xl shadow-emerald-500/10 mb-6 mx-auto lg:mx-0">
              <Mail size={28} />
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter mb-2">
              Verify Email.
            </h2>
            <p className="text-slate-500 font-medium text-base">
              We sent a 6-digit code to
            </p>
            <p className="text-emerald-600 font-black text-base mt-1">
              {email}
            </p>
          </div>

          {/* Error / Success messages */}
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-3 mb-6">
              <div className="w-2 h-2 rounded-full bg-rose-500"></div>
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-3 mb-6">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              {success}
            </div>
          )}

          {/* OTP Input Boxes */}
          <div className="flex gap-3 justify-center mb-8" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`w-14 h-16 text-center text-2xl font-black rounded-2xl border-2 outline-none transition-all duration-200 ${
                  digit
                    ? 'border-emerald-400 bg-emerald-50/50 text-emerald-700 shadow-[0_0_0_4px_rgba(52,211,153,0.1)]'
                    : 'border-slate-200 bg-slate-50/50 text-slate-800 focus:border-emerald-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(52,211,153,0.1)]'
                }`}
              />
            ))}
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={loading || otp.join('').length !== 6}
            className="w-full bg-emerald-500 text-white font-bold text-base py-4 rounded-2xl shadow-xl shadow-emerald-500/30 hover:bg-emerald-600 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                <ShieldCheck size={20} /> Verify & Activate
              </>
            )}
          </button>

          {/* Resend */}
          <div className="text-center mt-8">
            <p className="text-sm text-slate-500 font-medium mb-2">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResend}
              disabled={resendLoading || resendCooldown > 0}
              className="text-emerald-600 font-bold text-sm hover:text-emerald-500 flex items-center justify-center gap-2 mx-auto disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
            >
              {resendLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}
              {resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : 'Resend Code'}
            </button>
          </div>

          <p className="text-center text-xs text-slate-400 font-medium mt-10">
            Check your spam/junk folder if you don't see the email in your inbox.
          </p>
        </div>
      </div>

      {/* RIGHT PANE — BRANDING */}
      <div className="hidden lg:flex w-1/2 p-4 relative z-0">
        <div className="w-full h-full bg-slate-900 rounded-[3rem] overflow-hidden relative flex flex-col items-center justify-center p-12 border border-slate-800 shadow-2xl">

          {/* Geometry */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-[500px] h-[500px] rounded-full border border-slate-700/50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-dashed"></div>
            <div className="w-[350px] h-[350px] rounded-full border border-emerald-500/20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="w-[200px] h-[200px] rounded-full bg-slate-800/80 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-slate-700 shadow-2xl flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent"></div>
              <Mail size={60} className="text-emerald-400 relative z-10" strokeWidth={1} />
            </div>
          </div>

          {/* Glow */}
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>

          {/* Status badge */}
          <div className="absolute top-12 left-12">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-400 font-bold text-xs uppercase tracking-widest border border-amber-500/20 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
              Awaiting Verification
            </span>
          </div>

          {/* Bottom info */}
          <div className="absolute bottom-12 left-12 right-12 bg-slate-800/60 border border-slate-700/50 p-8 rounded-3xl shadow-2xl text-center">
            <h3 className="text-white font-black text-xl tracking-tight mb-2">
              📧 Check Your Inbox
            </h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              A 6-digit verification code has been sent to your email. Enter it to activate your Smart Commute account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
