import { useState, useEffect } from "react";
import axios from "axios";
import { Wind, MapPin, Gauge, Plus, Trash2, RefreshCw, Loader2, X, ShieldAlert } from "lucide-react";

function getAdminHeaders() {
  const token = localStorage.getItem("adminToken");
  return { headers: { Authorization: `Bearer ${token}` } };
}

function getAqiColor(aqi) {
  if (aqi == null) return "text-slate-500 bg-slate-100 border-slate-200";
  if (aqi <= 50) return "text-teal-700 bg-teal-100 border-teal-200";
  if (aqi <= 100) return "text-emerald-700 bg-emerald-100 border-emerald-200";
  if (aqi <= 150) return "text-amber-700 bg-amber-100 border-amber-200";
  if (aqi <= 200) return "text-orange-700 bg-orange-100 border-orange-200";
  return "text-red-700 bg-red-100 border-red-200";
}

function ManageAQI() {
  const [cities, setCities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ city: "", state: "", country: "India" });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [refreshingId, setRefreshingId] = useState(null);

  const fetchCities = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/cities", getAdminHeaders());
      if (res.data.success) {
        setCities(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch cities", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const handleAddCity = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError("");

    try {
      const res = await axios.post("http://localhost:5000/api/admin/cities", addForm, getAdminHeaders());
      if (res.data.success) {
        setCities([...cities, res.data.data]);
        setAddForm({ city: "", state: "", country: "India" });
        setShowAddForm(false);
      }
    } catch (err) {
      setAddError(err.response?.data?.message || "Failed to add city");
    } finally {
      setAddLoading(false);
    }
  };

  const handleDelete = async (id, cityName) => {
    if (!window.confirm(`Remove "${cityName}" from monitoring?`)) return;

    try {
      const res = await axios.delete(`http://localhost:5000/api/admin/cities/${id}`, getAdminHeaders());
      if (res.data.success) {
        setCities(cities.filter((c) => c._id !== id));
      }
    } catch {
      alert("Failed to remove city");
    }
  };

  const handleRefresh = async (id) => {
    setRefreshingId(id);
    try {
      const res = await axios.post(`http://localhost:5000/api/admin/cities/${id}/refresh`, {}, getAdminHeaders());
      if (res.data.success) {
        setCities(cities.map((c) => (c._id === id ? res.data.data : c)));
      }
    } catch {
      alert("Failed to refresh AQI");
    } finally {
      setRefreshingId(null);
    }
  };

  return (
    <div className="p-10 min-h-screen bg-[#f8fafc] text-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm">
            <Wind size={28} className="text-emerald-500" />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">AQI Live Radar</h2>
            <p className="text-slate-500 text-sm font-medium mt-1">
              Real-time air quality metrics across active monitored metropolitan areas.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all shadow-xl shadow-slate-900/10 hover:shadow-emerald-500/20 active:scale-95 flex items-center gap-2"
        >
          {showAddForm ? <X size={16} /> : <Plus size={16} />}
          {showAddForm ? "Cancel" : "Add City"}
        </button>
      </div>

      {/* Add City Form */}
      {showAddForm && (
        <div className="mb-8 bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Add New City to Monitor</h3>
          {addError && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl text-sm font-bold mb-4 flex items-center gap-2">
              <ShieldAlert size={16} /> {addError}
            </div>
          )}
          <form onSubmit={handleAddCity} className="flex items-end gap-4 flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                City Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Delhi"
                value={addForm.city}
                onChange={(e) => setAddForm({ ...addForm, city: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none text-sm font-bold"
              />
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                State
              </label>
              <input
                type="text"
                placeholder="e.g. Maharashtra"
                value={addForm.state}
                onChange={(e) => setAddForm({ ...addForm, state: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none text-sm font-bold"
              />
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                Country
              </label>
              <input
                type="text"
                placeholder="e.g. India"
                value={addForm.country}
                onChange={(e) => setAddForm({ ...addForm, country: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none text-sm font-bold"
              />
            </div>
            <button
              type="submit"
              disabled={addLoading}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
            >
              {addLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {addLoading ? "Adding..." : "Add City"}
            </button>
          </form>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-slate-400 font-bold">
            <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            Fetching AQI telemetry...
          </div>
        </div>
      ) : cities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Wind size={48} className="text-slate-300 mb-4" />
          <p className="font-bold text-lg">No cities being monitored</p>
          <p className="text-sm mt-1">Click "Add City" to start tracking air quality.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cities.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 hover:-translate-y-2 hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-full -z-10 group-hover:scale-125 transition-transform duration-500"></div>

              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-slate-400" />
                  <h3 className="text-lg font-black text-slate-800">{item.city}</h3>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleRefresh(item._id)}
                    disabled={refreshingId === item._id}
                    className="p-1.5 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Refresh AQI"
                  >
                    <RefreshCw size={14} className={refreshingId === item._id ? "animate-spin" : ""} />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id, item.city)}
                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove City"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* AQI Value */}
              <div className="flex flex-col items-center justify-center py-4">
                <p className="text-6xl font-black tracking-tighter text-slate-900">
                  {item.lastAqi ?? "—"}
                </p>
                <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase mt-1">
                  AQ Index
                </span>
              </div>

              {/* Status Badge */}
              <div className="mt-4 flex justify-center">
                <span
                  className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border ${getAqiColor(
                    item.lastAqi
                  )} shadow-sm`}
                >
                  {item.lastStatus || "Unknown"}
                </span>
              </div>

              {/* Last updated */}
              {item.lastChecked && (
                <p className="text-center text-[10px] text-slate-400 mt-3 font-medium">
                  Updated: {new Date(item.lastChecked).toLocaleTimeString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ManageAQI;