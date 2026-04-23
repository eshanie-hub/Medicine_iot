import React from 'react';
import Navbar from '../assets/Navigation';
import TempReport from '../charts/temperature/TempReport';
import Chatbot from './Chatbot';
import Security from '../charts/security/Report';
import MotionReport from '../charts/motion/MotionReport';
import HumidityReport from '../charts/humidity/HumidityReport';

const reportStyles = `
  /* 1. Ensure the base HTML allows scrolling on mobile */
  html, body {
    margin: 0;
    padding: 0;
    height: 100%;
    /* Remove 'overflow: hidden' to allow global scrolling on mobile */
    overflow-y: auto; 
    background-color: #f0f4f8;
  }

  .report-root {
    background-color: #f0f4f8;
    /* Use min-height so it grows with the cards */
    min-height: calc(100vh - 60px); 
    width: 100%;
    padding: 15px;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
  }

  .report-grid {
    display: grid;
    grid-template-columns: 1fr; /* Stack vertically by default */
    gap: 20px;
    width: 100%;
    max-width: 1400px;
  }

  .report-card {
    background: white;
    border-radius: 20px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    display: flex;
    flex-direction: column;
    /* Give cards a fixed height on mobile so charts render properly */
    height: 450px; 
    min-height: 450px;
    overflow: hidden;
  }

  /* Desktop View - 1024px and up */
  @media (min-width: 1024px) {
    html, body {
      overflow: hidden; /* Lock scroll on desktop for a dashboard feel */
    }

    .report-root {
      height: calc(100vh - 60px);
      justify-content: center;
      overflow: hidden;
    }

    .report-grid {
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
      height: 100%;
      gap: 15px;
    }

    .report-card {
      height: 100%; /* Let grid control height on desktop */
      min-height: 0;
    }
  }

  .card-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
    margin: 0 0 10px 0;
  }
`;

export default function Report() {
  return (
    <>
      <style>{reportStyles}</style>
      <Navbar />
      <div className="report-root">
        <div className="report-grid">

          <div className="report-card">
            <Security />
          </div>

          <div className="report-card">
            <HumidityReport />
          </div>

          <div className="report-card">
            <TempReport />
          </div>

          <div className="report-card">
            <MotionReport />
          </div>

        </div>
        <Chatbot />
      </div>
    </>
  );
}