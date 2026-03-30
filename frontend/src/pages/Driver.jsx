import React from 'react';
import Navbar from '../assets/Navigation';
import LastAlert from '../charts/motion/Last_Alert';
import LockStatusCard from '../charts/security/Last_Alert';

const pageStyles = `
  .dashboard-root {
    background-color: #f0f4f8;
    height: calc(100vh - 60px); /* Subtract Navbar height */
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
    flex: 1; /* Stretch to fit screen height */
    display: flex;
    flex-direction: column;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }

  .status-label { font-size: 0.8rem; color: #718096; }
  .status-value { font-size: 1.4rem; font-weight: 700; color: #1e3a6e; }
  .status-sub { font-size: 0.75rem; color: #a0aec0; }
  .fan-btn { font-size: 0.7rem; color: #3182ce; margin-top: 5px; cursor: pointer; }

  /* Vibration Status Colors */
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

  .map-wrapper {
    flex: 1;
    border-radius: 35px;
    overflow: hidden;
    margin-top: 10px;
  }

  .map-wrapper img { width: 100%; height: 100%; object-fit: cover; }
`;

export default function Driver() {
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
            <span className="status-label">Current Temperature</span>
            <span className="status-value" style={{color: '#3182ce'}}>Safe</span>
            <span className="status-sub">5.2 °c</span>
            <span className="fan-btn">❄️ OFF</span>
          </div>
          
          {/*motion card*/}
          <div className="sidebar-card">
            <LastAlert />
          </div>
            
          
          <div className="sidebar-card">
            <span className="status-label">Current Humidity</span>
            <span className="status-value" style={{color: '#3182ce'}}>Safe</span>
            <span className="status-sub">50%</span>
            <span className="fan-btn">❄️ OFF</span>
          </div>
          <div className="sidebar-card">
            <span className="status-label">Sensor states</span>
            <span className="status-value" style={{color: '#e53e3e'}}>Offline</span>
          </div>
        </aside>

        <main className="map-container">
          <h2 style={{margin: 0}}>Route optimization</h2>
          <div className="map-wrapper">
            <img src="https://i.imgur.com/GisLhOQ.png" alt="Route Map" />
          </div>
        </main>
      </div>
    </>
  );
}