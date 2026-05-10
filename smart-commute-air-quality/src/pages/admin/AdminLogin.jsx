import { useState } from "react";
import axios from "axios";
import { ShieldCheck, Mail, Lock, Loader2 } from "lucide-react";

function AdminLogin({ onAdminLogin }) {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/admin/login", credentials);
      if (res.data.success) {
        // Store admin token and profile
        localStorage.setItem("adminToken", res.data.token);
        localStorage.setItem(
          "adminProfile",
          JSON.stringify({
            _id: res.data._id,
            name: res.data.name,
            email: res.data.email,
            role: res.data.role,
          })
        );
        onAdminLogin();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed. Please check credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50">
      <div className="w-full max-w-md px-6">
        {/* Branding/Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-slate-900 rounded-[1.2rem] flex items-center justify-center text-white shadow-xl shadow-slate-900/20 mb-6 mx-auto">
            <ShieldCheck size={28} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            SmartCommute <span className="text-slate-500 font-light">Admin</span>
          </h1>
          <p className="text-slate-500 mt-2">Secure access for platform administrators</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-3 mb-6">
            <div className="w-2 h-2 rounded-full bg-rose-500"></div>
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200"
        >
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Admin Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-300">
                <Mail size={18} />
              </div>
              <input
                type="email"
                placeholder="admin@smartcommute.com"
                required
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
                value={credentials.email}
                onChange={(e) =>
                  setCredentials({ ...credentials, email: e.target.value })
                }
              />
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-300">
                <Lock size={18} />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                required
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Authenticating...
              </>
            ) : (
              "Login to Console"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;