import { useState, useEffect } from "react";
import axios from "axios";
import { Users, MapPin, AlertCircle, Activity, CheckCircle2, ShieldAlert, UserPlus, Wind, Trash2, LogIn } from "lucide-react";

// Helper to get auth headers
function getAdminHeaders() {
  const token = localStorage.getItem("adminToken");
  return { headers: { Authorization: `Bearer ${token}` } };
}

// Map activity types to icons and colors
function getActivityMeta(type, severity) {
  const map = {
    user_registered: { icon: <UserPlus size={16} className="text-blue-500" />, color: "text-blue-500" },
    user_deleted: { icon: <Trash2 size={16} className="text-red-500" />, color: "text-red-500" },
    aqi_alert: { icon: <AlertCircle size={16} className="text-red-500" />, color: "text-red-500" },
    city_added: { icon: <MapPin size={16} className="text-emerald-500" />, color: "text-emerald-500" },
    city_removed: { icon: <Wind size={16} className="text-amber-500" />, color: "text-amber-500" },
    admin_login: { icon: <LogIn size={16} className="text-indigo-500" />, color: "text-indigo-500" },
  };
  return map[type] || { icon: <Activity size={16} className="text-slate-400" />, color: "text-slate-400" };
}

// Format relative time
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/dashboard-stats", getAdminHeaders());
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="p-10 min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400 font-bold">
          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          Loading dashboard intelligence...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="bg-rose-50 border border-rose-200 text-rose-600 px-6 py-4 rounded-2xl font-bold flex items-center gap-3">
          <ShieldAlert size={20} /> {error}
        </div>
      </div>
    );
  }

  const cards = [
    {
      label: "Total Users",
      value: stats?.totalUsers?.toLocaleString() ?? "0",
      icon: <Users size={18} />,
      badge: stats?.userGrowthPercent != null
        ? `${stats.userGrowthPercent >= 0 ? "↑" : "↓"} ${Math.abs(stats.userGrowthPercent)}%`
        : null,
      badgeColor: stats?.userGrowthPercent >= 0
        ? "bg-emerald-100 text-emerald-700"
        : "bg-red-100 text-red-700",
      accent: "emerald",
    },
    {
      label: "Cities Tracked",
      value: stats?.totalCities?.toString() ?? "0",
      icon: <MapPin size={18} />,
      badge: null,
      accent: "blue",
    },
    {
      label: "High AQI Alerts",
      value: stats?.highAqiAlerts?.toString() ?? "0",
      icon: <AlertCircle size={18} />,
      badge: stats?.highAqiAlerts > 0 ? "Critical" : "Normal",
      badgeColor: stats?.highAqiAlerts > 0
        ? "bg-red-50 text-red-600 border border-red-100 animate-pulse"
        : "bg-emerald-50 text-emerald-600 border border-emerald-100",
      accent: "red",
      hasTopBar: stats?.highAqiAlerts > 0,
    },
    {
      label: "Active Monitors",
      value: stats?.totalCities?.toString() ?? "0",
      icon: <Activity size={18} />,
      badge: null,
      accent: "indigo",
    },
  ];

  return (
    <div className="p-10 min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-emerald-500/30">
      {/* Header Section */}
      <header className="mb-10">
        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">
          Admin Dashboard
        </h2>
        <p className="text-slate-500 mt-2 text-lg font-medium">
          Real-time overview of system usage and environmental anomalies.
        </p>
      </header>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
          >
            {card.hasTopBar && (
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
            )}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-${card.accent}-500/5 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform`}></div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className={`p-2 ${card.accent === "red" ? "bg-red-50 text-red-500" : "bg-slate-100 text-slate-500"} rounded-lg`}>
                  {card.icon}
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                  {card.label}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <p className="text-5xl font-black text-slate-900 tracking-tighter">{card.value}</p>
                {card.badge && (
                  <span className={`px-2 py-1 rounded-md text-xs font-bold ${card.badgeColor}`}>
                    {card.badge}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Stream */}
      <div className="mt-10 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <Activity size={20} className="text-emerald-500" />
          <h3 className="text-lg font-bold text-slate-800 tracking-tight">Recent System Activity</h3>
          <span className="ml-auto text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-lg">
            Live Feed
          </span>
        </div>
        <div className="divide-y divide-slate-100">
          {stats?.recentActivity?.length > 0 ? (
            stats.recentActivity.map((activity) => {
              const meta = getActivityMeta(activity.type, activity.severity);
              return (
                <div key={activity._id} className="p-6 flex items-start gap-4 hover:bg-slate-50 transition-colors">
                  <div className="mt-1 bg-white border border-slate-200 p-2 rounded-xl shadow-sm">
                    {meta.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-700">{activity.message}</p>
                    <p className="text-xs font-medium text-slate-400 mt-1">{timeAgo(activity.time)}</p>
                  </div>
                  {activity.severity === "critical" && (
                    <span className="px-2 py-1 bg-red-50 text-red-600 border border-red-100 rounded-lg text-[10px] font-black uppercase tracking-wider">
                      Critical
                    </span>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center text-slate-400 font-bold text-sm">
              <div className="flex flex-col items-center gap-3">
                <CheckCircle2 size={32} className="text-slate-300" />
                No recent activity recorded yet. Events will appear here as users interact with the platform.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;