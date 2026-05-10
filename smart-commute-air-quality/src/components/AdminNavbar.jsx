import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutDashboard, Users, Wind, FileText, LogOut, ShieldCheck } from "lucide-react";

function AdminNavbar({ onLogout }) {
  const location = useLocation();

  const navLinks = [
    { name: "Overview", path: "/admin", icon: <LayoutDashboard size={16} /> },
    { name: "User Base", path: "/admin/users", icon: <Users size={16} /> },
    { name: "Live Data", path: "/admin/aqi", icon: <Wind size={16} /> },
    { name: "Intel", path: "/admin/reports", icon: <FileText size={16} /> },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10 px-6 py-3 flex justify-between items-center shadow-2xl">
      {/* Brand Section */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center text-slate-900 shadow-lg shadow-emerald-500/20">
          <ShieldCheck size={22} className="text-white" />
        </div>
        <h2 className="font-extrabold text-xl tracking-tight text-white flex items-center gap-2">
          SmartCommute <span className="text-emerald-400 text-sm font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Admin</span>
        </h2>
      </div>

      {/* Navigation Links */}
      <div className="flex items-center gap-4">
        <div className="flex bg-slate-950/50 p-1.5 rounded-2xl border border-white/5">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 z-10 ${isActive ? "text-slate-900" : "text-slate-400 hover:text-slate-200"
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="admin-nav-indicator"
                    className="absolute inset-0 bg-emerald-400 rounded-xl -z-10 shadow-md shadow-emerald-500/20"
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  />
                )}
                {link.icon}
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Action Section */}
        <div className="pl-4 border-l border-slate-700/50">
          <button
            onClick={onLogout}
            className="group flex items-center gap-2 bg-slate-800/50 hover:bg-red-500 border border-slate-700/50 hover:border-red-500 text-slate-400 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300"
          >
            <LogOut size={16} className="group-hover:rotate-12 transition-transform" />
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}

export default AdminNavbar;