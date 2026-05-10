import { useState, useEffect } from 'react';
import { Crown, Check, Zap, Shield, BarChart3, Sparkles, ArrowRight, Loader2, Star, Heart, Wifi, Bell, FileText, Users, Headphones, Globe, Lock } from 'lucide-react';
import api from '../utils/api';
import PageWrapper from '../components/PageWrapper';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '₹0',
    period: 'forever',
    description: 'Basic air quality monitoring to get you started',
    color: 'slate',
    features: [
      'Basic AQI monitoring for 1 city',
      'Route checker — 3 routes per day',
      'Commute history — last 7 days only',
      'Standard eco-score tracking',
      'Community forum access',
    ],
    limitations: [
      'No SMS/email alerts',
      'No forecast access',
      'No export or reports',
    ],
    cta: 'Current Plan',
    disabled: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₹49',
    period: '/month',
    description: 'Everything you need for daily commute intelligence',
    color: 'emerald',
    popular: true,
    features: [
      'Unlimited AQI monitoring — all cities',
      'Unlimited route checks per day',
      'Full commute history — no limit',
      'Advanced eco-score with detailed analytics',
      'Real-time AQI forecast & predictions',
      'Pollution heatmap — full access',
      'SMS & email alerts on high AQI',
      'Export commute reports as PDF',
      'Priority route optimization (AI-powered)',
      'Ad-free experience',
    ],
    cta: 'Upgrade to Pro — ₹49/mo',
  },
  {
    id: 'enterprise',
    name: 'Premium',
    price: '₹149',
    period: '/month',
    description: 'For health-conscious professionals & teams who want the best',
    color: 'violet',
    features: [
      'Everything in Pro plan',
      'Team dashboard — up to 25 members',
      'Custom AQI alert thresholds',
      'Health impact analysis per commute',
      'API access for custom integrations',
      'Dedicated priority support — 24/7',
      'White-label & branded reports',
      'Weekly health digest via email',
      'Advanced CO₂ savings analytics',
      'Early access to new features',
    ],
    cta: 'Go Premium — ₹149/mo',
  },
];

function Premium() {
  const [loading, setLoading] = useState(false);
  const [activePlan, setActivePlan] = useState('free');
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { data } = await api.get('/payment/history');
        if (data.success && data.data.isPremium) {
          setActivePlan(data.data.premiumPlan || 'pro');
        }
      } catch {
        // User is on free plan
      }
    };
    fetchStatus();
  }, []);

  const handlePayment = async (planId) => {
    if (planId === 'free' || planId === activePlan) return;

    setLoading(true);
    setPaymentStatus(null);

    try {
      const { data } = await api.post('/payment/create-order', { plan: planId });

      if (!data.success) {
        setPaymentStatus({ type: 'error', message: data.message });
        setLoading(false);
        return;
      }

      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'Smart Commute',
        description: data.planName,
        order_id: data.order.id,
        handler: async function (response) {
          try {
            const verifyRes = await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: planId,
            });

            if (verifyRes.data.success) {
              setActivePlan(planId);
              setPaymentStatus({
                type: 'success',
                message: '🎉 Payment successful! Your premium features are now unlocked.',
              });

              const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
              profile.isPremium = true;
              profile.premiumPlan = planId;
              localStorage.setItem('userProfile', JSON.stringify(profile));
            }
          } catch (err) {
            setPaymentStatus({
              type: 'error',
              message: err.response?.data?.message || 'Payment verification failed',
            });
          }
        },
        prefill: {
          name: JSON.parse(localStorage.getItem('userProfile') || '{}').name || '',
          email: JSON.parse(localStorage.getItem('userProfile') || '{}').email || '',
        },
        theme: {
          color: '#10b981',
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      setLoading(false);
    } catch (err) {
      setPaymentStatus({
        type: 'error',
        message: err.response?.data?.message || 'Failed to create payment order',
      });
      setLoading(false);
    }
  };

  const colorMap = {
    slate: {
      bg: 'bg-white',
      border: 'border-slate-200',
      badge: 'bg-slate-100 text-slate-600',
      icon: 'bg-slate-100 text-slate-500',
      btn: 'bg-slate-200 text-slate-500 cursor-default',
      check: 'text-emerald-500',
      cross: 'text-slate-300',
      price: 'text-slate-900',
    },
    emerald: {
      bg: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600',
      border: 'border-emerald-400',
      icon: 'bg-white/20 text-white',
      btn: 'bg-white text-emerald-600 hover:bg-emerald-50 shadow-xl shadow-emerald-900/20 hover:shadow-2xl hover:scale-[1.02]',
      check: 'text-emerald-200',
      price: 'text-white',
      text: 'text-white',
      subtext: 'text-emerald-100',
    },
    violet: {
      bg: 'bg-white',
      border: 'border-violet-200 hover:border-violet-300',
      icon: 'bg-violet-100 text-violet-500',
      btn: 'bg-violet-600 text-white hover:bg-violet-700 shadow-xl shadow-violet-500/20 hover:shadow-2xl hover:scale-[1.02]',
      check: 'text-violet-500',
      price: 'text-slate-900',
    },
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12 selection:bg-emerald-500/30">

        {/* ── HERO HEADER ──────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto text-center mb-8">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-50 text-amber-700 font-black text-xs uppercase tracking-widest border border-amber-200 mb-6 shadow-sm">
            <Crown size={14} /> Upgrade Your Plan
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-4 leading-[1.1]">
            Breathe Smarter,<br/>
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">Pay Less.</span>
          </h1>
          <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto leading-relaxed">
            Unlock unlimited route checks, real-time pollution alerts, AI-powered forecasts, 
            and premium analytics — starting at just <strong className="text-emerald-600">₹49/month</strong>.
          </p>
        </div>

        {/* ── TRUST BADGES ─────────────────────────────────────────── */}
        <div className="max-w-3xl mx-auto flex flex-wrap justify-center gap-4 mb-12">
          {[
            { icon: <Lock size={14} />, text: 'Secure Payments' },
            { icon: <Heart size={14} />, text: '7-Day Money Back' },
            { icon: <Wifi size={14} />, text: 'Cancel Anytime' },
            { icon: <Star size={14} />, text: '4.9★ Rated' },
          ].map((badge, i) => (
            <div key={i} className="flex items-center gap-2 px-4 py-2 bg-white rounded-full text-xs font-bold text-slate-500 border border-slate-100 shadow-sm">
              <span className="text-emerald-500">{badge.icon}</span>
              {badge.text}
            </div>
          ))}
        </div>

        {/* ── PAYMENT STATUS TOAST ─────────────────────────────────── */}
        {paymentStatus && (
          <div className={`max-w-2xl mx-auto mb-8 px-6 py-4 rounded-2xl font-bold text-sm flex items-center gap-3 ${
            paymentStatus.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
              : 'bg-rose-50 border border-rose-200 text-rose-700'
          }`}>
            <div className={`w-2.5 h-2.5 rounded-full ${paymentStatus.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
            {paymentStatus.message}
          </div>
        )}

        {/* ── PRICING CARDS ────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {PLANS.map((plan) => {
            const c = colorMap[plan.color];
            const isActive = activePlan === plan.id;
            const isUpgraded = plan.id !== 'free' && isActive;

            return (
              <div
                key={plan.id}
                className={`relative ${c.bg} border-2 ${c.border} rounded-[2.5rem] p-8 flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                  plan.popular ? 'shadow-2xl md:scale-105 z-10' : 'shadow-sm hover:shadow-xl'
                }`}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-white font-black text-[11px] uppercase tracking-widest shadow-lg flex items-center gap-1.5">
                    <Sparkles size={12} /> Best Value
                  </div>
                )}

                {/* Plan header */}
                <div className="mb-6">
                  <div className={`w-12 h-12 ${c.icon} rounded-2xl flex items-center justify-center mb-4`}>
                    {plan.id === 'free' && <Shield size={20} />}
                    {plan.id === 'pro' && <Zap size={20} />}
                    {plan.id === 'enterprise' && <BarChart3 size={20} />}
                  </div>
                  <h3 className={`text-2xl font-black tracking-tight mb-1 ${c.text || 'text-slate-800'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm font-medium ${c.subtext || 'text-slate-500'}`}>
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <span className={`text-5xl font-black tracking-tighter ${c.price}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm font-bold ${c.subtext || 'text-slate-400'} ml-1`}>
                    {plan.period}
                  </span>
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map((feat, i) => (
                    <li key={i} className={`flex items-start gap-3 text-sm font-medium ${c.subtext || 'text-slate-600'}`}>
                      <Check size={16} className={`${c.check} mt-0.5 shrink-0`} />
                      {feat}
                    </li>
                  ))}
                </ul>

                {/* Limitations (free plan only) */}
                {plan.limitations && (
                  <ul className="space-y-2 mb-6 pt-4 border-t border-slate-100">
                    {plan.limitations.map((lim, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm font-medium text-slate-400">
                        <span className="text-rose-300 mt-0.5 shrink-0 text-xs">✕</span>
                        {lim}
                      </li>
                    ))}
                  </ul>
                )}

                {/* CTA button */}
                <button
                  onClick={() => handlePayment(plan.id)}
                  disabled={plan.disabled || isUpgraded || loading}
                  className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all duration-300 ${
                    isUpgraded
                      ? 'bg-emerald-100 text-emerald-600 cursor-default'
                      : plan.disabled
                        ? c.btn
                        : c.btn
                  }`}
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : isUpgraded ? (
                    <>
                      <Check size={18} /> Active Plan ✅
                    </>
                  ) : (
                    <>
                      {plan.cta} {!plan.disabled && <ArrowRight size={16} />}
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* ── WHAT YOU GET SECTION ─────────────────────────────────── */}
        <div className="max-w-5xl mx-auto mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">
              What You Unlock After Payment
            </h2>
            <p className="text-slate-500 font-medium text-base max-w-xl mx-auto">
              Every premium feature is activated <strong>instantly</strong> after successful payment. No waiting, no manual setup.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Globe size={24} />,
                title: 'Unlimited City Monitoring',
                desc: 'Monitor air quality across unlimited cities in real-time. No more 1-city restriction.',
                color: 'emerald',
              },
              {
                icon: <Bell size={24} />,
                title: 'Instant AQI Alerts',
                desc: 'Get SMS & email notifications when air quality drops in your area. Stay safe automatically.',
                color: 'violet',
              },
              {
                icon: <Zap size={24} />,
                title: 'AI Route Optimization',
                desc: 'Unlimited AI-powered route checks that find the healthiest path with lowest pollution exposure.',
                color: 'amber',
              },
              {
                icon: <BarChart3 size={24} />,
                title: 'Advanced Analytics',
                desc: 'Deep-dive into your commute data with health impact scores, CO₂ savings trends, and eco-reports.',
                color: 'blue',
              },
              {
                icon: <FileText size={24} />,
                title: 'Export PDF Reports',
                desc: 'Download beautiful, branded commute reports. Perfect for health tracking and corporate wellness.',
                color: 'rose',
              },
              {
                icon: <Headphones size={24} />,
                title: 'Priority Support',
                desc: 'Premium users get dedicated 24/7 customer support. We respond within 1 hour guaranteed.',
                color: 'indigo',
              },
            ].map((item, i) => (
              <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className={`w-14 h-14 bg-${item.color}-50 text-${item.color}-500 rounded-2xl flex items-center justify-center mb-5`}>
                  {item.icon}
                </div>
                <h4 className="text-lg font-black text-slate-800 tracking-tight mb-2">{item.title}</h4>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── FAQ / ASSURANCE ──────────────────────────────────────── */}
        <div className="max-w-3xl mx-auto mt-20 mb-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-8 text-center">
              Frequently Asked Questions
            </h3>
            <div className="space-y-6">
              {[
                {
                  q: 'When will my premium features activate?',
                  a: 'Instantly! The moment your payment is verified by Razorpay, all premium features are unlocked. No waiting period, no manual activation needed.',
                },
                {
                  q: 'Is my payment secure?',
                  a: 'Absolutely. All payments are processed through Razorpay — a PCI DSS Level 1 certified payment gateway trusted by 8M+ businesses. We never store your card details.',
                },
                {
                  q: 'Can I cancel anytime?',
                  a: 'Yes! You can cancel your subscription at any time. Plus, we offer a 7-day money-back guarantee — no questions asked.',
                },
                {
                  q: 'What happens after my plan expires?',
                  a: 'Your account will revert to the Free plan. All your data and commute history will be preserved — you just lose access to premium features until you renew.',
                },
              ].map((faq, i) => (
                <div key={i} className="border-b border-slate-100 pb-5 last:border-0 last:pb-0">
                  <h4 className="text-base font-black text-slate-800 mb-1.5">{faq.q}</h4>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── BOTTOM CTA ───────────────────────────────────────────── */}
        <div className="max-w-2xl mx-auto text-center mt-8">
          <p className="text-slate-400 text-sm font-medium flex items-center justify-center gap-2">
            <Lock size={14} /> Payments secured by Razorpay. Cancel anytime. 7-day money-back guarantee.
          </p>
        </div>
      </div>
    </PageWrapper>
  );
}

export default Premium;
