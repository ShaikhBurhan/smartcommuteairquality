import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState, useCallback, lazy, Suspense } from "react";

// Navbars & Layout (loaded eagerly — always visible)
import Navbar from "./components/Navbar";
import AdminNavbar from "./components/AdminNavbar";
import Footer from "./components/Footer";
import LoadingSpinner from "./components/LoadingSpinner";

// ─── Lazy-loaded User Pages ──────────────────────────────────────────────────
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const RouteChecker = lazy(() => import("./pages/RouteChecker"));
const AirQuality = lazy(() => import("./pages/AirQuality"));
const CommuteHistory = lazy(() => import("./pages/CommuteHistory"));
const About = lazy(() => import("./pages/About"));
const AirForecast = lazy(() => import("./pages/AirForecast"));
const PollutionHeatmap = lazy(() => import("./pages/PollutionHeatmap"));
const EcoScore = lazy(() => import("./pages/EcoScore"));
const Profile = lazy(() => import("./pages/Profile"));
const Premium = lazy(() => import("./pages/Premium"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));

// ─── Lazy-loaded Admin Pages ─────────────────────────────────────────────────
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const ManageUsers = lazy(() => import("./pages/admin/ManageUsers"));
const ManageAQI = lazy(() => import("./pages/admin/ManageAQI"));
const Reports = lazy(() => import("./pages/admin/Reports"));

// Inner layout — must be inside BrowserRouter to use useLocation
function AppLayout({ isLoggedIn, isAdminLoggedIn, onLogin, onLogout, onAdminLogin, onAdminLogout }) {
  const { pathname } = useLocation();
  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <div className="flex flex-col min-h-screen">
      {/* NAVBAR SWITCH */}
      {isAdminRoute ? (
        <AdminNavbar onLogout={onAdminLogout} />
      ) : (
        <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} />
      )}

      <main className="flex-grow">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* PUBLIC USER PAGES */}
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />

            {/* USER AUTH */}
            <Route
              path="/login"
              element={!isLoggedIn ? <Login onLogin={onLogin} /> : <Navigate to="/dashboard" />}
            />
            <Route
              path="/register"
              element={!isLoggedIn ? <Register /> : <Navigate to="/dashboard" />}
            />
            <Route
              path="/verify-email"
              element={!isLoggedIn ? <VerifyEmail onLogin={onLogin} /> : <Navigate to="/dashboard" />}
            />

            {/* USER PROTECTED PAGES */}
            <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/" />} />
            <Route path="/route-checker" element={isLoggedIn ? <RouteChecker /> : <Navigate to="/" />} />
            <Route path="/air-quality" element={isLoggedIn ? <AirQuality /> : <Navigate to="/" />} />
            <Route path="/history" element={isLoggedIn ? <CommuteHistory /> : <Navigate to="/" />} />
            <Route path="/air-forecast" element={isLoggedIn ? <AirForecast /> : <Navigate to="/" />} />
            <Route path="/pollution-heatmap" element={isLoggedIn ? <PollutionHeatmap /> : <Navigate to="/" />} />
            <Route path="/eco-score" element={isLoggedIn ? <EcoScore /> : <Navigate to="/" />} />
            <Route path="/profile" element={isLoggedIn ? <Profile /> : <Navigate to="/" />} />
            <Route path="/premium" element={isLoggedIn ? <Premium /> : <Navigate to="/" />} />

            {/* ADMIN AUTH */}
            <Route
              path="/admin/login"
              element={!isAdminLoggedIn ? <AdminLogin onAdminLogin={onAdminLogin} /> : <Navigate to="/admin" />}
            />

            {/* ADMIN PROTECTED PAGES */}
            <Route path="/admin" element={isAdminLoggedIn ? <AdminDashboard /> : <Navigate to="/admin/login" />} />
            <Route path="/admin/users" element={isAdminLoggedIn ? <ManageUsers /> : <Navigate to="/admin/login" />} />
            <Route path="/admin/aqi" element={isAdminLoggedIn ? <ManageAQI /> : <Navigate to="/admin/login" />} />
            <Route path="/admin/reports" element={isAdminLoggedIn ? <Reports /> : <Navigate to="/admin/login" />} />
          </Routes>
        </Suspense>
      </main>

      {!isAdminRoute && <Footer />}
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("userToken"));
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => !!localStorage.getItem("adminToken"));

  const handleLogin = useCallback(() => setIsLoggedIn(true), []);
  const handleLogout = useCallback(() => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userProfile");
    setIsLoggedIn(false);
  }, []);

  const handleAdminLogin = useCallback(() => {
    // Token is stored by AdminLogin.jsx on successful API call
    setIsAdminLoggedIn(true);
  }, []);

  const handleAdminLogout = useCallback(() => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminProfile");
    setIsAdminLoggedIn(false);
  }, []);

  return (
    <BrowserRouter>
      <AppLayout
        isLoggedIn={isLoggedIn}
        isAdminLoggedIn={isAdminLoggedIn}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onAdminLogin={handleAdminLogin}
        onAdminLogout={handleAdminLogout}
      />
    </BrowserRouter>
  );
}

export default App;
