import { useState, useEffect } from 'react';
import { User, Mail, Shield, Calendar, Settings } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

function Profile() {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();



  useEffect(() => {
    const rawData = localStorage.getItem('userProfile');
    if (rawData) {
      const parsed = JSON.parse(rawData);
      setProfile(parsed);

      // Fetch fresh profile from backend for phone/premium status
      const fetchProfile = async () => {
        try {
          const { data } = await api.get('/auth/me');
          if (data.success && data.data) {
            // Profile data fetched successfully
          }
        } catch {
          // Use local profile
        }
      };
      fetchProfile();
    } else {
      navigate('/login');
    }
  }, [navigate]);


  if (!profile) return null;

  const initials = profile.name
    ? profile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  return (
    <PageWrapper>
      <div className="min-h-[90vh] bg-[#f8fafc] py-12 px-6 flex items-center justify-center">
        <div className="max-w-3xl w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-emerald-50">

          {/* Header Banner */}
          <div className="h-40 bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 relative">
            <div className="absolute inset-0 bg-white/10 -z-0"></div>
            <div className="absolute -bottom-16 left-12 flex items-end gap-6 z-10">
              <div className="w-32 h-32 rounded-3xl bg-white p-2 shadow-xl shrink-0">
                <div className="w-full h-full rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-4xl font-black text-emerald-700">
                  {initials}
                </div>
              </div>
              <div className="pb-2">
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">{profile.name}</h1>
                <p className="text-emerald-600 font-bold text-sm tracking-widest uppercase mt-1">Verified Member</p>
              </div>
            </div>
          </div>

          <div className="pt-24 px-12 pb-12">
            <h3 className="text-sm font-black text-slate-400 tracking-widest uppercase mb-6 border-b border-slate-100 pb-2">
              Identity &amp; Access
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="bg-slate-50 p-6 rounded-2xl flex items-start gap-4 border border-slate-100">
                <div className="bg-white p-3 rounded-xl shadow-sm text-emerald-500"><User size={20} /></div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Full Name</p>
                  <p className="text-lg font-bold text-slate-800">{profile.name}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl flex items-start gap-4 border border-slate-100">
                <div className="bg-white p-3 rounded-xl shadow-sm text-blue-500"><Mail size={20} /></div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Email Address</p>
                  <p className="text-lg font-bold text-slate-800">{profile.email}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl flex items-start gap-4 border border-slate-100">
                <div className="bg-white p-3 rounded-xl shadow-sm text-indigo-500"><Shield size={20} /></div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Access Role</p>
                  <p className="text-lg font-bold text-slate-800 capitalize">
                    {profile.isPremium ? `${profile.premiumPlan} User` : 'Free User'}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl flex items-start gap-4 border border-slate-100">
                <div className="bg-white p-3 rounded-xl shadow-sm text-orange-500"><Calendar size={20} /></div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Member Since</p>
                  <p className="text-lg font-bold text-slate-800">2026</p>
                </div>
              </div>
            </div>



          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default Profile;
