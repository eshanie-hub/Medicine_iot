import React, { useEffect, useState } from 'react';
import Navbar from '../assets/Navigation';
import LastAlert from '../charts/motion/Last_Alert';
import LockStatusCard from '../charts/security/Last_Alert';
import TempLastAlert from '../charts/temperature/Last_Alert';
import HumLastAlert from '../charts/humidity/Last_Alert';
import RouteMap from '../assets/RouteMap';

const pageStyles = `
  .dashboard-root {
    background-color: #f0f4f8;
    height: calc(100vh - 60px);
    padding: 15px;
    display: flex;
    gap: 15px;
  }

  .sidebar {
    width: 250px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .sidebar-card {
    background: white;
    border-radius: 12px;
    padding: 12px 18px;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }

  .status-label { font-size: 0.8rem; color: #718096; }
  .status-value { font-size: 1.4rem; font-weight: 700; color: #1e3a6e; }
  .status-sub { font-size: 0.75rem; color: #a0aec0; }
  .fan-btn { font-size: 0.7rem; color: #3182ce; margin-top: 5px; cursor: pointer; }

  .status-critical { color: #e53e3e !important; font-weight: 800; }
  .status-warning { color: #dd6b20 !important; }
  .status-stable { color: #3182ce!important; font-weight: 700; }

  .map-container {
    flex: 1;
    background: white;
    border-radius: 20px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    text-align: center;
  }

  .map-topbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 14px;
    flex-wrap: wrap;
  }

  .route-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    gap: 4px;
  }

  .route-title {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 700;
    color: #1e293b;
  }

  .route-id {
    font-size: 0.82rem;
    color: #64748b;
    font-weight: 500;
  }

  .route-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .route-btn {
    border: none;
    border-radius: 12px;
    padding: 10px 16px;
    font-size: 0.88rem;
    font-weight: 700;
    cursor: pointer;
    color: white;
    min-width: 125px;
    transition: 0.2s ease;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }

  .route-btn.start {
    background: #16a34a;
  }

  .route-btn.end {
    background: #dc2626;
  }

  .route-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .map-wrapper {
    flex: 1;
    border-radius: 35px;
    overflow: hidden;
    margin-top: 10px;
  }

  .map-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export default function Driver() {
  const [activeRoute, setActiveRoute] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  const fetchCurrentRoute = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/route/current');
      const data = await res.json();
      setActiveRoute(data);
    } catch (error) {
      console.error('Failed to fetch current route:', error);
    }
  };

  useEffect(() => {
    fetchCurrentRoute();
  }, []);

  const handleRouteToggle = async () => {
    try {
      setLoadingRoute(true);

      if (activeRoute) {
        const res = await fetch('http://localhost:5000/api/route/end', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to end route');

        setActiveRoute(null);
      } else {
        const res = await fetch('http://localhost:5000/api/route/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to start route');

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
      <Navbar />
      <div className="dashboard-root">
        <aside className="sidebar">
          <div className="sidebar-card">
            <LockStatusCard />
          </div>

          <div className="sidebar-card">
            <TempLastAlert />
          </div>

          <div className="sidebar-card">
            <LastAlert />
          </div>

          <div className="sidebar-card">
            <HumLastAlert />
          </div>

          <div className="sidebar-card">
            <span className="status-label">Sensor states</span>
            <span className="status-value" style={{ color: '#e53e3e' }}>
              Offline
            </span>
          </div>
        </aside>

        <main className="map-container">
          <div className="map-topbar">
            <div className="route-info">
              <h2 className="route-title">Route Tracking</h2>
              <span className="route-id">
                {activeRoute
                  ? `Active Route ID: ${activeRoute.route_id}`
                  : 'No active route'}
              </span>
            </div>

            <div className="route-actions">
              <button
                className={`route-btn ${activeRoute ? 'end' : 'start'}`}
                onClick={handleRouteToggle}
                disabled={loadingRoute}
              >
                {loadingRoute
                  ? 'Please wait...'
                  : activeRoute
                  ? 'End Route'
                  : 'Start Route'}
              </button>
            </div>
          </div>

          <div className="map-wrapper">
            <RouteMap activeRoute={activeRoute} />
          </div>
        </main>
      </div>
    </>
  );
}