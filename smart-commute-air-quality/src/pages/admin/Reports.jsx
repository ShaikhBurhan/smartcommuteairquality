import { useState, useEffect } from "react";
import axios from "axios";
import { LineChart, BarChart2, PieChart, ActivitySquare, TrendingUp, Loader2, ShieldAlert } from "lucide-react";

function getAdminHeaders() {
  const token = localStorage.getItem("adminToken");
  return { headers: { Authorization: `Bearer ${token}` } };
}

function Reports() {
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/reports", getAdminHeaders());
        if (res.data.success) {
          setReportData(res.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load report data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (isLoading) {
    return (
      <div className="p-10 min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400 font-bold">
          <Loader2 size={20} className="animate-spin text-emerald-500" />
          Generating intelligence report...
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

  const analyticsCards = [
    {
      id: 1,
      label: "Most Polluted Region",
      value: reportData?.mostPolluted?.city || "No data",
      subtext: reportData?.mostPolluted
        ? `Avg. AQI: ${reportData.mostPolluted.aqi} (${reportData.mostPolluted.status})`
        : "No monitored cities yet",
      icon: <LineChart size={24} className="text-red-500" />,
      color: "text-red-600",
      bgBorder: "border-red-200",
      bgHover: "hover:border-red-400 hover:shadow-red-500/10",
    },
    {
      id: 2,
      label: "Cleanest Sector",
      value: reportData?.cleanest?.city || "No data",
      subtext: reportData?.cleanest
        ? `Avg. AQI: ${reportData.cleanest.aqi} (${reportData.cleanest.status})`
        : "No monitored cities yet",
      icon: <PieChart size={24} className="text-emerald-500" />,
      color: "text-emerald-600",
      bgBorder: "border-emerald-200",
      bgHover: "hover:border-emerald-400 hover:shadow-emerald-500/10",
    },
    {
      id: 3,
      label: "Platform Users",
      value: reportData?.totalUsers?.toLocaleString() || "0",
      subtext: `${reportData?.totalCities || 0} cities monitored • Avg AQI: ${reportData?.avgAQI ?? "N/A"}`,
      icon: <BarChart2 size={24} className="text-indigo-500" />,
      color: "text-indigo-600",
      bgBorder: "border-indigo-200",
      bgHover: "hover:border-indigo-400 hover:shadow-indigo-500/10",
    },
  ];

  // Build summary text dynamically
  const summaryParts = [];
  if (reportData?.avgAQI != null) {
    const aqiTrend = reportData.avgAQI <= 100 ? "within safe limits" : "above recommended thresholds";
    summaryParts.push(`Average AQI across monitored cities is ${reportData.avgAQI}, ${aqiTrend}.`);
  }
  if (reportData?.totalUsers > 0) {
    summaryParts.push(`${reportData.totalUsers} users registered on the platform.`);
  }
  if (reportData?.criticalEventsToday > 0) {
    summaryParts.push(`${reportData.criticalEventsToday} critical event${reportData.criticalEventsToday > 1 ? "s" : ""} recorded in the last 24 hours.`);
  } else {
    summaryParts.push("No critical events in the last 24 hours.");
  }

  return (
    <div className="p-10 min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <div className="w-14 h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm">
          <ActivitySquare size={28} className="text-emerald-500" />
        </div>
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Intelligence & Reports</h2>
          <p className="text-slate-500 text-sm font-medium mt-1">Deep analytical insights extracted from live platform data.</p>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {analyticsCards.map((stat) => (
          <div
            key={stat.id}
            className={`bg-white p-8 rounded-3xl shadow-sm border-2 ${stat.bgBorder} ${stat.bgHover} transition-all duration-300 relative overflow-hidden group hover:-translate-y-1`}
          >
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-150 transition-transform duration-700">
              {stat.icon}
            </div>

            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1 rounded-lg">
                {stat.label}
              </span>
              {stat.icon}
            </div>
            <p className={`text-3xl font-black tracking-tight ${stat.color} mb-2`}>
              {stat.value}
            </p>
            <p className="text-sm font-bold text-slate-500">
              {stat.subtext}
            </p>
          </div>
        ))}
      </div>

      {/* Summary Highlight Section */}
      <div className="mt-10 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex items-center justify-between">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp size={24} className="text-emerald-400" />
            <h3 className="text-2xl font-black tracking-tight">Platform Intelligence Summary</h3>
          </div>
          <p className="text-slate-300 text-lg leading-relaxed font-medium">
            {summaryParts.length > 0 ? (
              summaryParts.map((part, idx) => (
                <span key={idx}>
                  {idx > 0 && " "}
                  {part}
                </span>
              ))
            ) : (
              "Add cities and users to see aggregated platform analytics here."
            )}
          </p>
          {reportData?.monthlyRegistrations?.length > 0 && (
            <div className="mt-6 flex gap-4">
              {reportData.monthlyRegistrations.slice(-3).map((m, idx) => (
                <div key={idx} className="bg-slate-800/50 border border-slate-700/50 px-4 py-3 rounded-2xl">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    {new Date(m._id.year, m._id.month - 1).toLocaleString("default", { month: "short", year: "2-digit" })}
                  </p>
                  <p className="text-xl font-black text-emerald-400">{m.count}</p>
                  <p className="text-[10px] text-slate-500 font-bold">new users</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="hidden lg:block relative z-10 mr-10">
          <div className="w-32 h-32 rounded-full border-8 border-slate-700 border-t-emerald-400 animate-spin" style={{ animationDuration: "3s" }}></div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-[100px] opacity-10"></div>
      </div>
    </div>
  );
}

export default Reports;