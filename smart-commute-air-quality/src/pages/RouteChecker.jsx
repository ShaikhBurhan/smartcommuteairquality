import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import PageWrapper from '../components/PageWrapper';
import {
  Navigation, MapPin, Search, ShieldAlert,
  AlertTriangle, Wind, Clock, ArrowDown, Leaf,
  Car, Footprints, Bike, Activity, Loader2, Locate, LocateFixed
} from 'lucide-react';

// ─── FIX LEAFLET DEFAULT ICONS ───────────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ─── UI HELPERS ──────────────────────────────────────────────────────────────

function aqiInfo(aqi) {
  if (aqi === null) return { label: 'Unknown', color: '#94a3b8', badge: 'bg-slate-100 text-slate-600 border-slate-200' };
  if (aqi <= 50)    return { label: 'Excellent', color: '#10b981', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  if (aqi <= 100)   return { label: 'Moderate',  color: '#f59e0b', badge: 'bg-amber-50 text-amber-700 border-amber-200' };
  if (aqi <= 150)   return { label: 'Sensitive',  color: '#f97316', badge: 'bg-orange-50 text-orange-700 border-orange-200' };
  if (aqi <= 200)   return { label: 'Unhealthy', color: '#ef4444', badge: 'bg-red-50 text-red-700 border-red-200' };
  return { label: 'Hazardous', color: '#be185d', badge: 'bg-rose-100 text-rose-800 border-rose-300' };
}

const ROUTE_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

function fmt(m) {
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
}
function fmtTime(s) {
  const m = Math.floor(s / 60);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60}m`;
}

// ─── MAP SUB-COMPONENTS ──────────────────────────────────────────────────────

function MapFitter({ routes }) {
  const map = useMap();
  useEffect(() => {
    if (!routes.length) return;
    const pts = routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    if (pts.length) map.fitBounds(pts, { padding: [50, 50] });
  }, [routes, map]);
  return null;
}

function LiveTracker({ liveLocation, isTracking }) {
  const map = useMap();
  useEffect(() => {
    if (isTracking && liveLocation) {
      const targetZoom = map.getZoom() < 14 ? 15 : map.getZoom();
      map.setView([liveLocation.lat, liveLocation.lng], targetZoom, { animate: true });
    }
  }, [liveLocation, isTracking, map]);
  return null;
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

function RouteChecker() {
  const [startAddr, setStartAddr] = useState('');
  const [endAddr,   setEndAddr]   = useState('');
  const [travelMode, setTravelMode] = useState('driving'); // driving, walking, cycling
  
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [scoredRoutes, setScoredRoutes] = useState([]);
  const [startCoord,   setStartCoord]   = useState(null);
  const [endCoord,     setEndCoord]     = useState(null);
  const [selectedIdx,  setSelectedIdx]  = useState(0);
  const [mapReady,     setMapReady]     = useState(false);
  const [loadingMsg,   setLoadingMsg]   = useState('');
  const [isTracking,   setIsTracking]   = useState(false);
  const [liveLocation, setLiveLocation] = useState(null);

  useEffect(() => {
    let watchId;
    if (isTracking && 'geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => setLiveLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.error("Error watching location:", err),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
    } else {
      setLiveLocation(null);
    }
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isTracking]);

  const userIcon = useMemo(() => new L.DivIcon({
    className: '',
    html: `<div class="w-5 h-5 rounded-full bg-blue-500 border-2 border-white shadow-[0_0_15px_rgba(59,130,246,0.6)] flex items-center justify-center relative"><div class="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-75"></div></div>`,
    iconAnchor: [10, 10],
  }), []);

  const startIcon = useMemo(() => new L.DivIcon({
    className: '',
    html: `<div style="width:18px;height:18px;border-radius:50%;background:#10b981;border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.35)"></div>`,
    iconAnchor: [9, 9],
  }), []);

  const endIcon = useMemo(() => new L.DivIcon({
    className: '',
    html: `<div style="width:18px;height:18px;border-radius:50%;background:#ef4444;border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.35)"></div>`,
    iconAnchor: [9, 9],
  }), []);

  const handleSearch = async () => {
    if (!startAddr.trim() || !endAddr.trim()) {
      setError('Please enter both a start location and a destination.');
      return;
    }
    setLoading(true);
    setError('');
    setScoredRoutes([]);
    setSelectedIdx(0);
    setMapReady(false);

    try {
      setLoadingMsg('Calculating safe route (PRIM)...');
      
      const res = await fetch('http://localhost:5000/api/prim/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startAddr, endAddr, travelMode })
      });
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to calculate route.');
      }
      
      setStartCoord(data.startCoord);
      setEndCoord(data.endCoord);
      setScoredRoutes(data.routes);
      setMapReady(true);

      // Save journey securely via API
      const best = data.routes[0];
      await fetch('http://localhost:5000/api/prim/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('userToken') && { 'Authorization': `Bearer ${localStorage.getItem('userToken')}` })
        },
        body: JSON.stringify({
          fromLabel: startAddr.trim(),
          toLabel: endAddr.trim(),
          distance_m: best.distance,
          duration_s: best.duration,
          avgAqi: best.aqiScore,
          travelMode: best.primData.travelMode,
          minuteVentilation: best.primData.minuteVentilation,
          totalInhaledMass_mg: best.primData.totalInhaledMass_mg,
          healthRiskLevel: best.primData.healthRiskLevel,
        })
      });

    } catch (err) {
      setError(err.message || 'Failed to calculate routes. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMsg('');
    }
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter') handleSearch();
  };

  const selectedRoute = scoredRoutes[selectedIdx];

  return (
    <PageWrapper>
      <div className="min-h-[90vh] bg-[#f8fafc] p-6 md:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[100px] -z-10 pointer-events-none transform translate-x-1/3 -translate-y-1/3"></div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
          
          {/* ── LEFT PANEL ─────────────────────────────────────────── */}
          <div className="w-full lg:w-[400px] shrink-0 flex flex-col gap-5">

            <div className="bg-white p-7 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-[100px] -z-10"></div>
              
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-5 shadow-sm border border-emerald-200">
                <Navigation size={20} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">Route AI + PRIM</h2>
              <p className="text-slate-500 text-sm font-medium mb-6">
                Calculate cleanest routes and estimate PM2.5 inhalation mass dynamically.
              </p>

              {/* Mode Selector */}
              <div className="flex bg-slate-100 p-1 rounded-2xl mb-5">
                {[
                  { id: 'driving', icon: Car, label: 'Drive' },
                  { id: 'cycling', icon: Bike, label: 'Cycle' },
                  { id: 'walking', icon: Footprints, label: 'Walk' }
                ].map(mode => {
                  const Icon = mode.icon;
                  const isActive = travelMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setTravelMode(mode.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive 
                          ? 'bg-white text-emerald-600 shadow-sm border border-emerald-100/50' 
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <Icon size={14} /> {mode.label}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-3">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-emerald-400">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-sm"></div>
                  </div>
                  <input
                    type="text"
                    value={startAddr}
                    onChange={e => setStartAddr(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Start location…"
                    className="w-full bg-slate-50 border-2 border-slate-200 pl-11 pr-4 py-3.5 rounded-2xl text-sm font-semibold text-slate-900 outline-none focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-400"
                  />
                </div>

                <div className="flex items-center gap-2 pl-4">
                   <div className="w-0.5 h-5 bg-slate-200 ml-1"></div>
                   <ArrowDown size={12} className="text-slate-300" />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                     <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white shadow-sm"></div>
                  </div>
                  <input
                    type="text"
                    value={endAddr}
                    onChange={e => setEndAddr(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Destination…"
                    className="w-full bg-slate-50 border-2 border-slate-200 pl-11 pr-4 py-3.5 rounded-2xl text-sm font-semibold text-slate-900 outline-none focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-500/10 transition-all placeholder:text-slate-400"
                  />
                </div>

                {error && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2">
                    <AlertTriangle size={14} className="shrink-0" /> {error}
                  </div>
                )}

                {loading && loadingMsg && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2">
                    <svg className="animate-spin h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    {loadingMsg}
                  </div>
                )}

                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="w-full bg-slate-900 text-white font-bold text-sm py-4 rounded-2xl shadow-xl shadow-slate-900/20 hover:bg-emerald-600 hover:shadow-emerald-500/30 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Analysing Routes…
                    </>
                  ) : (
                    <><Search size={16} /> Compute Route Dose</>
                  )}
                </button>
              </div>
            </div>

            {/* PRIM Respiratory Insights */}
            {selectedRoute && selectedRoute.primData && (
              <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                   <Activity size={100} />
                </div>
                
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                  <Leaf size={14} className="text-emerald-500" /> Respiratory Intake Analysis
                </h3>
                
                <div className="flex items-end gap-2 mb-4">
                   <span className="text-4xl font-black tracking-tighter text-slate-900">
                     {selectedRoute.primData.totalInhaledMass_mg || 0}
                   </span>
                   <span className="text-lg font-bold text-slate-400 pb-1">mg</span>
                </div>
                
                <p className="text-xs font-semibold text-slate-500 mb-4">
                  Estimated mass of PM2.5 particles inhaled during this trip. <br/>
                  <span className="text-[10px] uppercase tracking-wider font-bold">Ventilation Rate: {selectedRoute.primData.minuteVentilation} L/min</span>
                </p>

                {/* Lung Stress Meter CSS bar */}
                <div className="mb-4">
                   <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1 tracking-wider uppercase">
                      <span>Low</span>
                      <span>High</span>
                   </div>
                   <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                     {/* Scale up to 2.0 mg for the meter visualization */}
                     <div 
                       className={`h-full transition-all duration-1000 ${selectedRoute.primData.totalInhaledMass_mg > 1.0 ? 'bg-red-500' : selectedRoute.primData.totalInhaledMass_mg > 0.5 ? 'bg-orange-400' : 'bg-emerald-500'}`}
                       style={{ width: `${Math.min(100, ((selectedRoute.primData.totalInhaledMass_mg || 0) / 2.0) * 100)}%` }}
                     ></div>
                   </div>
                </div>

                {/* Lung Impact Warning */}
                {selectedRoute.primData.totalInhaledMass_mg > 1.0 && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl flex items-start gap-3 mt-4">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    <p className="text-[11px] font-bold leading-relaxed">
                      HIGH INHALATION RISK: Your breathing rate while {selectedRoute.primData.travelMode} will significantly increase toxin intake along this route. Consider an alternate route, bringing an N95 mask, or driving with cabin filtration active.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Route Alternatives Selection */}
            {scoredRoutes.length > 0 && (
              <div className="flex flex-col gap-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 mt-2">
                  {scoredRoutes.length} Route Alternatives
                </p>
                {scoredRoutes.map((route, i) => {
                  const info = aqiInfo(route.aqiScore);
                  const isSelected = i === selectedIdx;
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedIdx(i)}
                      className={`w-full text-left bg-white p-5 rounded-[1.5rem] border-2 transition-all duration-200 shadow-sm ${isSelected
                          ? 'border-emerald-400 shadow-emerald-100 shadow-lg'
                          : 'border-slate-100 hover:border-slate-200'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full shrink-0" style={{ background: ROUTE_COLORS[i] }}></div>
                          <span className="text-xs font-black uppercase tracking-widest text-slate-700">
                            {i === 0 ? '🥇 Optimal Dose Route' : `Alternative ${i}`}
                          </span>
                        </div>
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border ${info.badge}`}>
                          {route.aqiScore !== null ? `AQI ${route.aqiScore}` : 'No Data'}
                        </span>
                      </div>
                      <div className="flex gap-4 text-xs text-slate-500 font-semibold">
                        <span className="flex items-center gap-1">
                          <Clock size={11} /> {fmtTime(route.duration)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={11} /> {fmt(route.distance)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Activity size={11} /> {route.primData.totalInhaledMass_mg} mg
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── RIGHT PANEL: MAP ───────────────────────────────────── */}
          <div
            className="flex-1 bg-slate-900 rounded-[3rem] p-2 shadow-2xl relative overflow-hidden flex flex-col"
            style={{ minHeight: '600px' }}
          >
            {mapReady ? (
              <div className="w-full h-full flex-1 rounded-[2.5rem] overflow-hidden relative">
                
                {/* Live Tracking Toggle Button */}
                <button 
                  onClick={() => setIsTracking(!isTracking)}
                  className={`absolute bottom-6 right-6 z-[1000] px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md border-[1.5px] transition-all duration-300 flex items-center gap-2 font-bold text-sm
                    ${isTracking 
                      ? 'bg-blue-600/90 border-blue-400 text-white shadow-blue-500/50' 
                      : 'bg-white/90 border-slate-200 text-slate-700 hover:bg-white'}
                  `}
                >
                  {isTracking ? <LocateFixed className="animate-pulse text-white" size={20}/> : <Locate className="text-slate-500" size={20}/>}
                  {isTracking ? 'Tracking Live' : 'Live Navigation'}
                </button>

                <MapContainer
                  center={[startCoord.lat, startCoord.lng]}
                  zoom={13}
                  style={{ width: '100%', height: '100%', minHeight: '580px', borderRadius: '2rem', zIndex: 10 }}
                  zoomControl={true}
                >
                  <LayersControl position="topright">
                    <LayersControl.BaseLayer checked name="Street View">
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        maxZoom={19}
                      />
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer name="Satellite View">
                      <TileLayer
                        attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        maxZoom={19}
                      />
                    </LayersControl.BaseLayer>
                  </LayersControl>

                  {scoredRoutes.map((route, i) => (
                    i !== selectedIdx && (
                      <Polyline
                        key={`bg-${i}`}
                        positions={route.geometry.coordinates.map(([lng, lat]) => [lat, lng])}
                        pathOptions={{ color: ROUTE_COLORS[i], weight: 4, opacity: 0.35 }}
                        eventHandlers={{ click: () => setSelectedIdx(i) }}
                      />
                    )
                  ))}
                  
                  {scoredRoutes[selectedIdx] && (
                    <Polyline
                      key={`sel-${selectedIdx}`}
                      positions={scoredRoutes[selectedIdx].geometry.coordinates.map(([lng, lat]) => [lat, lng])}
                      pathOptions={{ color: ROUTE_COLORS[selectedIdx], weight: 7, opacity: 1 }}
                    />
                  )}

                  {startCoord && (
                    <Marker position={[startCoord.lat, startCoord.lng]} icon={startIcon}>
                      <Popup>
                        <div className="font-bold text-emerald-700">📍 Start</div>
                        <div className="text-xs text-slate-600">{startAddr}</div>
                      </Popup>
                    </Marker>
                  )}

                  {endCoord && (
                    <Marker position={[endCoord.lat, endCoord.lng]} icon={endIcon}>
                      <Popup>
                        <div className="font-bold text-red-600">🏁 Destination</div>
                        <div className="text-xs text-slate-600">{endAddr}</div>
                      </Popup>
                    </Marker>
                  )}

                  {liveLocation && (
                    <Marker position={[liveLocation.lat, liveLocation.lng]} icon={userIcon}>
                      <Popup>
                        <div className="font-bold text-blue-600">🧍 You are here</div>
                      </Popup>
                    </Marker>
                  )}

                  <MapFitter routes={scoredRoutes} />
                  <LiveTracker liveLocation={liveLocation} isTracking={isTracking} />
                </MapContainer>
              </div>
            ) : (
              <div
                className="w-full h-full flex-1 rounded-[2.5rem] bg-slate-800 border border-slate-700 flex flex-col items-center justify-center relative overflow-hidden"
                style={{ minHeight: '580px' }}
              >
                <div
                  className="absolute inset-0 opacity-[0.08]"
                  style={{
                    backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                  }}
                ></div>

                <div className="text-center z-10 relative px-8">
                  <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
                    <Leaf size={32} className="text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight">Respiratory Modeling</h3>
                  <p className="text-slate-400 text-sm font-medium mt-2 max-w-xs mx-auto">
                    Enter your route and travel mode to map your safe journey and calculate active PM2.5 inhalation mass using PRIM.
                  </p>
                  
                  <div className="flex gap-2 justify-center mt-8 flex-wrap">
                    {['Nominatim', 'OSRM Dynamic Routing', 'PRIM Engine', 'OpenAQ'].map(api => (
                      <div
                        key={api}
                        className="bg-slate-700/60 border border-slate-600 text-slate-300 text-[10px] font-bold px-3 py-1.5 rounded-full"
                      >
                        {api}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="absolute top-6 left-6">
                  <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl text-white text-xs font-bold border border-slate-700 shadow-lg flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    PRIM READY
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </PageWrapper>
  );
}

export default RouteChecker;