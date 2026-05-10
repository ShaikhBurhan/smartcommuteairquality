import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { User, LogOut, Crown } from "lucide-react";

function Navbar({ isLoggedIn, onLogout }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const profileRaw = localStorage.getItem("userProfile");
  const user = profileRaw && profileRaw !== "undefined" ? JSON.parse(profileRaw) : null;
  const initials = user && user.name ? user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "U";

  return (
    <nav className="sticky top-0 z-[2000] bg-white/70 backdrop-blur-md border-b border-white/20 px-6 py-4 flex justify-between items-center shadow-sm">

      {/* Brand */}
      <Link to="/" className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-1 hover:opacity-80 transition-opacity">
        Smart<span className="text-emerald-500">Commute</span>
      </Link>

      {/* Links */}
      {!isLoggedIn && (
        <div className="flex gap-6 items-center">
          <Link to="/" className="text-sm text-slate-600 font-semibold hover:text-emerald-600 transition-colors">Home</Link>
          <Link to="/login" className="text-sm text-slate-600 font-semibold hover:text-emerald-600 transition-colors">Login</Link>
          <Link
            to="/register"
            className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            Register
          </Link>
        </div>
      )}

      {isLoggedIn && (
        <div className="flex gap-6 items-center relative">
          <Link to="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">Dashboard</Link>
          <Link to="/route-checker" className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">Route</Link>
          <Link to="/air-quality" className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">AQI</Link>
          {!user?.isPremium ? (
            <Link to="/premium" className="text-sm font-semibold text-amber-600 hover:text-amber-500 transition-colors flex items-center gap-1"><Crown size={14} />Premium</Link>
          ) : (
            <Link to="/premium" className="text-sm font-black text-emerald-600 hover:text-emerald-500 transition-colors flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100 shadow-sm uppercase tracking-wider"><Crown size={14} strokeWidth={3} />{user.premiumPlan}</Link>
          )}

          {/* Simple Dropdown */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors flex items-center gap-1"
          >
            Intelligence <span className="text-[10px]">▼</span>
          </button>

          {showMenu && (
            <div className="absolute top-10 right-28 bg-white/90 backdrop-blur-md border border-slate-100 shadow-xl rounded-xl p-2 w-48 z-[2001]">
              <Link to="/air-forecast" onClick={() => setShowMenu(false)} className="block px-4 py-2 text-sm font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors">Air Forecast</Link>
              <Link to="/pollution-heatmap" onClick={() => setShowMenu(false)} className="block px-4 py-2 text-sm font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors">Heatmap</Link>
              <Link to="/eco-score" onClick={() => setShowMenu(false)} className="block px-4 py-2 text-sm font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors">Eco-Score</Link>
              <Link to="/history" onClick={() => setShowMenu(false)} className="block px-4 py-2 text-sm font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors">History</Link>
            </div>
          )}

          {/* User Profile Avatar / Dropdown */}
          <div className="relative ml-2">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-sm font-black text-emerald-700 hover:bg-emerald-200 hover:-translate-y-0.5 transition-all shadow-sm"
            >
              {initials}
            </button>

            {showProfileMenu && (
              <div className="absolute top-12 right-0 bg-white border border-slate-100 shadow-2xl rounded-2xl p-2 w-56 z-[2001]">
                <div className="px-4 py-3 border-b border-slate-100 mb-2">
                  <p className="text-sm font-bold text-slate-800 truncate flex items-center gap-2">
                    {user?.name}
                    {user?.isPremium && <Crown size={14} className="text-amber-500" />}
                  </p>
                  <p className="text-xs font-medium text-slate-400 truncate">{user?.email}</p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-colors"
                >
                  <User size={16} /> My Profile
                </Link>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors mt-1"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
