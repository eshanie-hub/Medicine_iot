import React from 'react';
import Navbar from '../assets/Navigation';
import TempReport from '../charts/temperature/TempReport';

const reportStyles = `
  .report-root {
    background-color: #f0f4f8;
    height: calc(100vh - 60px); /* Fits exactly below Navbar */
    padding: 15px;
    display: flex;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
  }

  .report-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr; /* 2x2 grid to fill screen */
    gap: 15px;
    width: 100%;
    height: 100%;
  }

  .report-card {
    background: white;
    border-radius: 20px;
    padding: 15px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }

  .card-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
    margin: 0 0 10px 0;
  }

  /* Table Styling */
  .anomaly-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 5px;
    flex: 1;
  }

  .table-header {
    background: #f8fafc;
    font-size: 0.75rem;
    color: #64748b;
    padding: 8px;
    border-radius: 8px;
    text-align: center;
  }

  .table-cell {
    border: 1px solid #f1f5f9;
    border-radius: 8px;
    padding: 8px;
    font-size: 0.8rem;
    text-align: center;
    background: white;
  }

  .detail-box {
    background: #f8fafc;
    border-radius: 8px;
    padding: 5px;
    font-size: 0.75rem;
    line-height: 1.4;
  }

  /* Image/Chart Containers */
  .chart-container {
    flex: 1;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .chart-img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  /* Gauge Component */
  .risk-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .gauge-svg { width: 180px; height: auto; }

  .risk-value {
    font-size: 2.2rem;
    font-weight: 700;
    color: #2d82cc;
    margin-top: -15px;
  }

  .risk-status {
    font-weight: 600;
    color: #1e3a6e;
    text-transform: uppercase;
    font-size: 0.9rem;
  }

  .risk-footer {
    margin-top: 10px;
    font-size: 0.8rem;
    color: #64748b;
  }
`;

export default function Report() {
  return (
    <>
      <style>{reportStyles}</style>
      <Navbar />
      <div className="report-root">
        <div className="report-grid">

          {/* 1. Safety Anomalies */}
          <div className="report-card">
            <h2 className="card-title">Safety anomalies detected</h2>
            <table className="anomaly-table">
              <thead>
                <tr>
                  <th className="table-header">Anomaly Type</th>
                  <th className="table-header">Card ID</th>
                  <th className="table-header">Date/Time</th>
                  <th className="table-header">Details</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="table-cell">High access ▼</td>
                  <td className="table-cell">RF2234</td>
                  <td className="table-cell">2 Feb<br />2:00pm</td>
                  <td className="table-cell">
                    <div className="detail-box">
                      <strong>2</strong> accesses<br />Avg: <strong>15 Min</strong>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="table-cell">Unusual hours ▲</td>
                  <td className="table-cell">RF2344</td>
                  <td className="table-cell">2 Feb</td>
                  <td className="table-cell">
                    <div className="detail-box">
                      <strong>1</strong> access<br />Duration: <strong>15 Min</strong>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 2. Humidity Trend */}
          <div className="report-card">
            <h2 className="card-title">Humidity Trend</h2>
            <div className="chart-container">
              <img
                src="https://i.imgur.com/GisLhOQ.png"
                className="chart-img"
                alt="Humidity Graph"
              />
            </div>
          </div>

          {/* 3. Temperature Trend */}
          <div className="report-card">
            <TempReport />
          </div>

          {/* 4. Transport Risk Level */}
          <div className="report-card">
            <h2 className="card-title">Transport Risk Level</h2>
            <div className="risk-content">
              <svg className="gauge-svg" viewBox="0 0 100 50">
                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                <path d="M 10 50 A 40 40 0 0 1 65 18" fill="none" stroke="#2d82cc" strokeWidth="10" />
              </svg>
              <div className="risk-value">42%</div>
              <div className="risk-status">Moderate Risk</div>
              <div className="risk-footer">
                Final Medicine Box Condition: <br />
                <strong>92% <span style={{ color: '#2d82cc' }}>Safe</span></strong>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}