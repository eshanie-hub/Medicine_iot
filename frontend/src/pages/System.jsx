import React from 'react';
import Navbar from '../assets/Navigation';

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
    grid-template-columns: repeat(5, 1fr);
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
    overflow-y: auto; /* Allows scrolling inside cards only */
  }

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
          {['Security Lock', 'Temperature', 'Vibration', 'Humidity', 'Wifi'].map(s => (
            <div className="sensor-box" key={s}>
              <span style={{fontSize: '0.8rem', color: '#64748b'}}>{s}</span>
              <span style={{fontSize: '1.3rem', fontWeight: 700, color: '#2d82cc'}}>Active</span>
            </div>
          ))}
        </div>

        <div className="bottom-split">
          <div className="panel">
            <h3>Logs</h3>
            <table className="log-table">
              <tbody>
                {Array(6).fill(0).map((_, i) => (
                  <tr key={i}><td>2 Feb 2.00pm</td><td>RF2234</td><td>Locked open</td></tr>
                ))}
              </tbody>
            </table>
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