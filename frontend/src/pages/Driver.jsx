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

const socket = io("http://localhost:5000");
const ROUTE_API_BASE = "http://localhost:5000";

const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  html, body {
    margin: 0;
    padding: 0;
    height: 100%;
    font-family: 'Poppins', sans-serif;
    background: #eef2f7;
  }

  /* ── Root layout ── */
  .dashboard-root {
    height: calc(100vh - 60px);
    display: flex;
    flex-direction: column;
    padding: 12px;
    gap: 12px;
    overflow: hidden;
  }

  /* ══════════════════════════════════════
     MOBILE  (< 768px)
  ══════════════════════════════════════ */
  .sidebar {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    flex-shrink: 0;
  }

  .sidebar-card {
    background: #ffffff;
    border-radius: 14px;
    padding: 14px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.06);
    border: 1px solid #e8edf4;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 90px;
    overflow: hidden;
  }

  .map-container {
    flex: 1;
    min-height: 0;
    background: #ffffff;
    border-radius: 18px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.07);
    overflow: hidden;
  }

  .map-wrapper {
    flex: 1;
    min-height: 0;
    border-radius: 14px;
    overflow: hidden;
    border: 1px solid #e8edf4;
    position: relative;
  }

  .map-wrapper > * {
    width: 100% !important;
    height: 100% !important;
  }

  /* ══════════════════════════════════════
     TABLET  (768px – 1023px)
  ══════════════════════════════════════ */
  @media (min-width: 768px) and (max-width: 1023px) {
    html, body {
      overflow-y: auto;
      height: auto;
    }

    .dashboard-root {
      flex-direction: column;
      padding: 16px;
      gap: 14px;
      overflow-y: auto;
      height: auto;
      min-height: calc(100vh - 60px);
    }

    .sidebar {
      grid-template-columns: repeat(5, 1fr);
      gap: 10px;
      flex-shrink: 0;
    }

    .sidebar-card {
      min-height: 110px;
      padding: 10px 8px;
      overflow: hidden;
    }

    

   

    /* Preserve icon sizes */
    .sidebar-card svg {
      width: 32px !important;
      height: 32px !important;
      min-width: 32px !important;
      min-height: 32px !important;
      flex-shrink: 0;
    }

    /* Map container — fixed height so Leaflet can render */
    .map-container {
      flex-shrink: 0;
      height: 500px;
      min-height: 500px;
      display: flex;
      flex-direction: column;
      padding: 16px;
      gap: 12px;
    }

    /* Explicit pixel height — Leaflet cannot use percentage heights */
    .map-wrapper {
      flex: 1;
      min-height: 0;
      height: 420px;
      border-radius: 14px;
      overflow: hidden;
      border: 1px solid #e8edf4;
      position: relative;
    }

    .map-wrapper > * {
      position: absolute !important;
      top: 0;
      left: 0;
      width: 100% !important;
      height: 100% !important;
    }
  }

  /* ══════════════════════════════════════
     DESKTOP  (≥ 1024px)
  ══════════════════════════════════════ */
  @media (min-width: 1024px) {
    html, body {
      overflow: hidden;
      height: 100%;
    }

    .dashboard-root {
      flex-direction: row;
      padding: 20px;
      gap: 20px;
      overflow: hidden;
      height: calc(100vh - 60px);
    }

    .sidebar {
      grid-template-columns: 1fr;
      width: 280px;
      flex-shrink: 0;
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .sidebar-card {
      min-height: 0;
    }

    .map-container {
      flex: 1;
      min-height: 0;
      height: 100%;
    }

    .map-wrapper {
      flex: 1;
      min-height: 0;
      height: 100%;
      position: relative;
    }

    .map-wrapper > * {
      position: absolute !important;
      top: 0;
      left: 0;
      width: 100% !important;
      height: 100% !important;
    }
  }

  /* ── Map topbar ── */
  .map-topbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
  }

  .route-title {
    margin: 0 0 2px 0;
    font-size: 1rem;
    font-weight: 700;
    color: #1e3a6e;
  }

  .route-id {
    font-size: 0.75rem;
    color: #94a3b8;
    font-weight: 500;
  }

  /* ── Buttons ── */
  .route-btn {
    border: none;
    border-radius: 10px;
    padding: 10px 22px;
    font-weight: 700;
    font-size: 0.85rem;
    cursor: pointer;
    color: #fff;
    transition: transform 0.1s, opacity 0.2s;
    letter-spacing: 0.3px;
  }
  .route-btn:active   { transform: scale(0.97); }
  .route-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .route-btn.start    { background: #1e3a6e; }
  .route-btn.end      { background: #dc2626; }

  /* ── Lock popup ── */
  .alert-popup {
    position: fixed;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    background: #fff;
    padding: 28px 24px;
    border-radius: 18px;
    z-index: 9999;
    box-shadow: 0 24px 60px rgba(0,0,0,0.25);
    border: 2.5px solid #1e3a6e;
    width: 88%;
    max-width: 380px;
    text-align: center;
  }

  .popup-title {
    color: #1e3a6e;
    margin: 0 0 8px;
    font-size: 1.1rem;
    font-weight: 700;
  }

  .popup-body {
    color: #64748b;
    font-size: 0.9rem;
    margin: 0 0 20px;
  }

  .popup-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
  }

  .popup-btn {
    padding: 10px 22px;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: opacity 0.15s;
  }
  .popup-btn:hover   { opacity: 0.88; }
  .popup-btn.confirm { background: #16a34a; color: #fff; }
  .popup-btn.cancel  { background: #f1f5f9; color: #475569; }
`;

export default function Driver() {
  const [activeRoute, setActiveRoute]     = useState(null);
  const [loadingRoute, setLoadingRoute]   = useState(false);
  const [showLockPopup, setShowLockPopup] = useState(false);

  const fetchCurrentRoute = async () => {
    try {
      const res  = await fetch(`${ROUTE_API_BASE}/api/route/current`);
      const data = await res.json();
      if (res.ok) setActiveRoute(data);
      else console.error("Failed to fetch current route:", data.message);
    } catch (err) {
      console.error("Failed to fetch current route:", err);
    }
  };

  useEffect(() => {
    fetchCurrentRoute();
    socket.on("requestLockUI", () => setShowLockPopup(true));
    socket.on("clearLockUI",   () => setShowLockPopup(false));
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
        const res  = await fetch(`${ROUTE_API_BASE}/api/route/end`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to end route");
        setActiveRoute(null);
      } else {
        const res  = await fetch(`${ROUTE_API_BASE}/api/route/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to start route");
        setActiveRoute(data.route);
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoadingRoute(false);
    }
  };

  return (
    <>
      <style>{pageStyles}</style>

      {showLockPopup && (
        <div className="alert-popup">
          <h3 className="popup-title">📦 Box Closed</h3>
          <p className="popup-body">The MediPORT lid is closed. Lock the box now?</p>
          <div className="popup-actions">
            <button className="popup-btn confirm" onClick={() => handleLockResponse("yes")}>
              Yes, Lock
            </button>
            <button className="popup-btn cancel" onClick={() => handleLockResponse("no")}>
              Not Now
            </button>
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
          <div className="sidebar-card"><Wifi /></div>
        </aside>

        <main className="map-container">
          <div className="map-topbar">
            <div>
              <h2 className="route-title">Route Tracking</h2>
              <span className="route-id">
                {activeRoute ? `Active Route ID: ${activeRoute.route_id}` : "No active route"}
              </span>
            </div>
            <button
              className={`route-btn ${activeRoute ? "end" : "start"}`}
              onClick={handleRouteToggle}
              disabled={loadingRoute}
            >
              {loadingRoute ? "Please wait…" : activeRoute ? "End Route" : "Start Route"}
            </button>
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