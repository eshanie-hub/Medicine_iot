import React from 'react';
import Navbar from '../assets/Navigation';
import Logs from '../charts/security/Logs';
import LastAlert from '../charts/motion/Last_Alert';

const systemStyles = `
  .system-root {
    height: calc(100vh - 60px);
    padding: 15px;
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .sensor-row {
    display: grid;
    grid-template-columns: repeat(5, 1fr); /* UI Kept exactly the same */
    gap: 15px;
    height: 120px;
  }

  .sensor-box {
    background: white;
    border-radius: 15px;
    padding: 15px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }

  .status-label { font-size: 0.8rem; color: #64748b; }
  .status-value { font-size: 1.4rem; font-weight: 700; color: #1e3a6e; }
  .status-sub { font-size: 0.75rem; color: #a0aec0; }
  .fan-btn { font-size: 0.7rem; color: #3182ce; margin-top: 5px; cursor: pointer; }


  .bottom-split {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    gap: 15px;
    min-height: 0;
  }

  .panel {
    background: white;
    border-radius: 15px;
    padding: 20px;
    overflow-y: auto;
  }
      /* Vibration Status Colors */
  .status-critical { color: #e53e3e !important; font-weight: 800; }
  .status-warning { color: #dd6b20 !important; }
  .status-stable { color: #3182ce!important; font-weight: 700; }

  .log-table { width: 100%; border-collapse: collapse; text-align: left; }
  .log-table td { padding: 10px 5px; border-bottom: 1px solid #f1f5f9; font-size: 0.85rem; }
`;

export default function System() {
  return (
    <>
      <style>{systemStyles}</style>
      <Navbar />
      <div className="system-root">
        <div className="sensor-row">
          
          {/* Card 1: Security */}
          <div className="sensor-box">
            <span style={{fontSize: '0.8rem', color: '#64748b'}}>Security Lock</span>
            <span style={{fontSize: '1.3rem', fontWeight: 700, color: '#2d82cc'}}>Active</span>
          </div>

          {/* Card 2: Temperature */}
          <div className="sensor-box">
            <span style={{fontSize: '0.8rem', color: '#64748b'}}>Temperature</span>
            <span style={{fontSize: '1.3rem', fontWeight: 700, color: '#2d82cc'}}>Active</span>
          </div>

          {/* Card 3: Vibration  */}
          <div className="sensor-box">
            <LastAlert />
          </div>

          {/* Card 4: Humidity */}
          <div className="sensor-box">
            <span style={{fontSize: '0.8rem', color: '#64748b'}}>Humidity</span>
            <span style={{fontSize: '1.3rem', fontWeight: 700, color: '#2d82cc'}}>Active</span>
          </div>

          {/* Card 5: Wifi */}
          <div className="sensor-box">
            <span style={{fontSize: '0.8rem', color: '#64748b'}}>Wifi</span>
            <span style={{fontSize: '1.3rem', fontWeight: 700, color: '#2d82cc'}}>Active</span>
          </div>

        </div>

        <div className="bottom-split">
          <div className="panel">
            <Logs/>
          </div>
          <div className="panel">
            <h3>Sensor Live status line chart</h3>
            <img src="https://i.imgur.com/GisLhOQ.png" style={{width: '100%', borderRadius: '10px'}} alt="Chart" />
          </div>
        </div>
      </div>
    </>
  );
}