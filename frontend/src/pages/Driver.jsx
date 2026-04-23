import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Navbar from "../assets/Navigation";
import LastAlert from "../charts/motion/Last_Alert";
import LockStatusCard from "../charts/security/Last_Alert";
import TempLastAlert from "../charts/temperature/Last_Alert";
import HumLastAlert from "../charts/humidity/Last_Alert";
import RouteMap from "../assets/RouteMap";
import Chatbot from "./Chatbot";
import Wifi from '../charts/wifi/Last_Alert';

// Keep socket connection for other team's lock UI feature
const socket = io("http://localhost:5000");

// Route API base for your route feature
const ROUTE_API_BASE = "http://localhost:5000";

const pageStyles = `
  html, body {
    margin: 0;
    padding: 0;
    height: 100%;
    overflow: hidden;
    font-family: 'Poppins', sans-serif;
  }

  .dashboard-root { 
    background-color: #f0f4f8; 
    height: calc(100vh - 60px); 
    display: flex; 
    flex-direction: column; 
    padding: 10px;
    gap: 10px;
    box-sizing: border-box;
  }

  /* Sidebar: Vertical stack */
  .sidebar { 
    display: flex;
    flex-direction: column; 
    gap: 10px;
    overflow-y: auto;
    flex: 0 0 40%; /* Mobile height */
  }

  .sidebar-card { 
    background: white; 
    border-radius: 12px; 
    padding: 15px; 
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    display: flex;
    flex-direction: column;
    justify-content: center;
    border: 1px solid transparent;
  }

  /* Laptop/Desktop View Fixes */
  @media (min-width: 1024px) {
    .dashboard-root { 
      flex-direction: row; 
      padding: 20px;
      gap: 20px;
    }

    .sidebar { 
      width: 320px; 
      flex: 0 0 auto;
      height: 100%;
      overflow: hidden; /* Prevent double scrollbars */
      justify-content: space-between; /* Distributes cards to fill the gap */
    }

    .sidebar-card {
      flex: 1; /* Makes cards grow to fill available height */
      margin-bottom: 0;
      max-height: 18%; /* Keeps them proportional as seen in image_481f3d.jpg */
    }
  }

  .map-container { 
    flex: 1; 
    background: white; 
    border-radius: 20px; 
    padding: 20px; 
    display: flex; 
    flex-direction: column; 
    overflow: hidden;
    min-height: 0; 
    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  }

  .map-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }

  .map-wrapper { 
    flex: 1; 
    border-radius: 15px; 
    overflow: hidden; 
    position: relative;
    border: 1px solid #eef2f6;
  }

  .route-btn { 
    border: none; 
    border-radius: 8px; 
    padding: 10px 24px; 
    font-weight: 700; 
    cursor: pointer; 
    color: white; 
    background: #dc2626; /* Match End Route color in image_481f3d.jpg */
    transition: transform 0.1s;
  }
  
  .route-btn:active { transform: scale(0.98); }

  .alert-popup {
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    background: white; padding: 25px; border-radius: 15px; z-index: 9999;
    box-shadow: 0 20px 50px rgba(0,0,0,0.3); border: 3px solid #1e3a6e; 
    width: 85%; max-width: 380px; text-align: center;
  }
`;

export default function Driver() {
  const [activeRoute, setActiveRoute] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [showLockPopup, setShowLockPopup] = useState(false);

  const fetchCurrentRoute = async () => {
    try {
      const res = await fetch(`${ROUTE_API_BASE}/api/route/current`);
      const data = await res.json();

      if (res.ok) {
        setActiveRoute(data);
      } else {
        console.error("Failed to fetch current route:", data.message);
      }
    } catch (error) {
      console.error("Failed to fetch current route:", error);
    }
  };

  useEffect(() => {
    fetchCurrentRoute();
    socket.on("requestLockUI", () => setShowLockPopup(true));
    socket.on("clearLockUI", () => setShowLockPopup(false));
    return () => {
      socket.off("requestLockUI");
      socket.off("clearLockUI");
    };
  }, []);

  const handleLockResponse = (choice) => {
    if (choice === "yes") socket.emit("uiLockResponse", "yes");
    setShowLockPopup(false);
  };

  const handleRouteToggle = async () => {
    try {
      setLoadingRoute(true);

      if (activeRoute) {
        const res = await fetch(`${ROUTE_API_BASE}/api/route/end`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to end route");

        setActiveRoute(null);
      } else {
        const res = await fetch(`${ROUTE_API_BASE}/api/route/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to start route");

        setActiveRoute(data.route);
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoadingRoute(false);
    }
  };

  return (
    <>
      <style>{pageStyles}</style>
      
      {showLockPopup && (
        <div className="alert-popup">
          <h3 style={{ color: '#1e3a6e', margin: '0 0 10px 0' }}>📦 Box Closed</h3>
          <p style={{ color: '#64748b' }}>The MediPORT lid is closed. Lock the box now?</p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px' }}>
            <button 
              style={{padding: '10px 20px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'}} 
              onClick={() => handleLockResponse("yes")}
            >Yes, Lock</button>
            <button 
              style={{padding: '10px 20px', background: '#64748b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer'}} 
              onClick={() => handleLockResponse("no")}
            >Not Now</button>
          </div>
        </div>
      )}

      <Navbar />
      
      <div className="dashboard-root">
        <aside className="sidebar">
          <div className="sidebar-card"><LockStatusCard /></div>
          <div className="sidebar-card"><TempLastAlert /></div>
          <div className="sidebar-card"><LastAlert /></div>
          <div className="sidebar-card"><HumLastAlert /></div>
          <div className="sidebar-card"><Wifi/></div>
        </aside>

        <main className="map-container">
          <div className="map-topbar">
            <div className="route-info">
              <h2 className="route-title">Route Tracking</h2>
              <span className="route-id">
                {activeRoute
                  ? `Active Route ID: ${activeRoute.route_id}`
                  : "No active route"}
              </span>
            </div>

            <div className="route-actions">
              <button
                className={`route-btn ${activeRoute ? "end" : "start"}`}
                onClick={handleRouteToggle}
                disabled={loadingRoute}
              >
                {loadingRoute
                  ? "Please wait..."
                  : activeRoute
                  ? "End Route"
                  : "Start Route"}
              </button>
            </div>
          </div>

          <div className="map-wrapper">
            <RouteMap activeRoute={activeRoute} />
          </div>
        </main>

        <Chatbot />
      </div>
    </>
  );
}