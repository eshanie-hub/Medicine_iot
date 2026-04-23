import React, { useState } from 'react';
import Navbar from '../assets/Navigation';
import SecurityLogs from '../charts/security/Logs';
import LastAlert from '../charts/motion/Last_Alert';
import MotionLogs from '../charts/motion/Logs';
import LockStatusCard from '../charts/security/Last_Alert';
import TempLastAlert from '../charts/temperature/Last_Alert';
import HumLastAlert from '../charts/humidity/Last_Alert';
import TemperatureLogs from '../charts/temperature/Logs';
import HumidityLogs from '../charts/humidity/Logs';
import BatteryChart from '../charts/humidity/BatteryChart';
import BatteryCard from '../charts/humidity/BatteryCard';
import Chatbot from './Chatbot';
import Wifi from '../charts/wifi/Last_Alert';

const systemStyles = `
  html, body, #root {
    /* Allow page to grow naturally */
    height: auto;
    min-height: 100%;
    margin: 0;
    padding: 0;
    background-color: #f8fafc;
    /* This is key: let the browser handle the main vertical scroll */
    overflow-y: visible !important; 
    overflow-x: hidden;
  }

  .system-root {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 12px;
    width: 100%;
    box-sizing: border-box;
    /* min-height ensures background covers full screen, but doesn't trap scroll */
    min-height: 100vh;
  }

  .sensor-row {
    display: grid;
    grid-template-columns: 1fr; 
    gap: 12px;
    width: 100%;
  }

  @media (min-width: 640px) {
    .sensor-row { grid-template-columns: repeat(2, 1fr); gap: 14px; }
  }

  @media (min-width: 1024px) {
    .sensor-row { grid-template-columns: repeat(5, 1fr); gap: 16px; }
  }

  .sensor-box {
    background: white;
    border-radius: 14px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    min-height: 100px;
    box-sizing: border-box;
  }

  .bottom-split {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
  }

  @media (min-width: 1024px) {
    .bottom-split {
      flex-direction: row;
      gap: 20px;
      /* Equal height logs and charts on desktop */
      align-items: stretch; 
    }
    .bottom-split .panel {
      flex: 1;              /* each takes 50% */
      min-width: 0;         /* prevents overflow issues */
    }
  }

  .panel {
    background: white;
    border-radius: 14px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
  }

  /* ── DUAL SCROLL LOGIC ── */
  .panel-logs {
    /* Fixed height forces the log-container to use its own scrollbar */
    height: 500px; 
    overflow: hidden; 
  }

  @media (max-width: 1023px) {
    .panel-logs {
      /* Slightly shorter on mobile so it doesn't take the whole screen */
      height: 500px; 
      margin-bottom: 8px;
    }
  }

  .log-container {
    width: 100%;
    /* This allows the logs to scroll within the 500px panel */
    overflow-y: auto; 
    overflow-x: auto; 
    flex-grow: 1;
    padding-right: 4px;
    /* Ensures scrolling is smooth on mobile */
    -webkit-overflow-scrolling: touch; 
  }

  /* Custom Scrollbar */
  .log-container::-webkit-scrollbar { width: 6px; height: 6px; }
  .log-container::-webkit-scrollbar-track { background: #f1f5f9; }
  .log-container::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

  /* ── Tab Header ── */
  .tab-header {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
    border-bottom: 1px solid #f1f5f9;
    padding-bottom: 12px;
    overflow-x: auto;
    white-space: nowrap;
    flex-shrink: 0; 
  }

  .tab-btn {
    padding: 8px 16px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    background: white;
    color: #64748b;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .tab-btn.active {
    background: #2d82cc;
    color: white;
    border-color: #2d82cc;
  }

  .panel-title { font-size: 1.1rem; font-weight: 700; margin-bottom: 14px; color: #1e3a6e; }
  .chart-img { width: 100%; height: auto; border-radius: 10px; }
`;

export default function System() {
  const [activeLog, setActiveLog] = useState('Security');

  const renderLogTable = () => {
    switch (activeLog) {
      case 'Security': return <SecurityLogs />;
      case 'Motion': return <MotionLogs />;
      case 'Temperature': return <TemperatureLogs />;
      case 'Humidity': return <HumidityLogs />;
      default: return null;
    }
  };

  return (
    <>
      <style>{systemStyles}</style>
      <Navbar />
      <div className="system-root">
        <div className="sensor-row">
          <div className="sensor-box"><LockStatusCard /></div>
          <div className="sensor-box"><TempLastAlert /></div>
          <div className="sensor-box"><LastAlert /></div>
          <div className="sensor-box"><HumLastAlert /></div>
          <div className="sensor-box"><Wifi /></div>
        </div>

        <div className="bottom-split">
          <div className="panel panel-logs">
            <div className="tab-header">
              {['Security', 'Motion', 'Temperature', 'Humidity'].map((type) => (
                <button
                  key={type}
                  className={`tab-btn ${activeLog === type ? 'active' : ''}`}
                  onClick={() => setActiveLog(type)}
                >
                  {type}
                </button>
              ))}
            </div>
            <div className="log-container">
              {renderLogTable()}
            </div>
          </div>

          {/* Right: Battery time-series chart */}
          <div className="panel">
            <div className="battery-header" style={{ marginBottom: "10px" }}>
              <h1 className="panel-title" style={{ margin: 0 }}>🔋 Battery Health Analytics</h1>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Last 30 readings · Live
              </span>
            </div>

            {/* 🔋 NEW Battery Summary */}
            <BatteryCard />

            {/* 📈 Chart */}
            <div style={{ flex: 1 }}>
              <BatteryChart />
            </div>
          </div>

        </div>
        <Chatbot />
      </div>
    </>
  );
}