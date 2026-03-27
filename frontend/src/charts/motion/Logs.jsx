import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const logStyles = `
  .logs-container {
    height: 100%; display: flex; flex-direction: column;
    font-family: 'Poppins', sans-serif;
  }
  .logs-header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 20px;
  }
  .dropdown-group { display: flex; gap: 12px; }
  
  .filter-select {
    background: white; border: 1px solid #f1f5f9;
    padding: 10px 20px; border-radius: 25px;
    font-size: 0.9rem; color: #64748b; cursor: pointer;
    outline: none; box-shadow: 0 2px 10px rgba(0,0,0,0.03);
    appearance: none; min-width: 140px;
  }

  .date-btn {
    background: white; border: 1px solid #f1f5f9;
    padding: 10px 20px; border-radius: 25px;
    font-size: 0.9rem; color: #64748b; cursor: pointer;
    outline: none; box-shadow: 0 2px 10px rgba(0,0,0,0.03);
    min-width: 140px; display: flex; align-items: center;
    justify-content: space-between; gap: 10px;
  }

  .calendar-popup {
    position: absolute; top: calc(100% + 8px); right: 0;
    background: white; border-radius: 20px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.12);
    padding: 16px; z-index: 100; width: 280px;
  }
  .cal-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .cal-nav-btn { background: none; border: none; cursor: pointer; color: #3b82f6; font-size: 1.1rem; padding: 4px 8px; border-radius: 8px; }
  .cal-month-label { font-weight: 700; color: #1e293b; font-size: 0.95rem; }
  .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
  .cal-day-name { text-align: center; font-size: 0.72rem; font-weight: 600; color: #94a3b8; padding: 4px 0; }
  .cal-day { text-align: center; padding: 6px 0; border-radius: 50%; font-size: 0.82rem; color: #475569; cursor: pointer; border: none; background: none; }
  .cal-day:hover { background: #eff6ff; color: #3b82f6; }
  .cal-day.selected { background: #3b82f6; color: white; font-weight: 700; }
  .cal-day.today { border: 1.5px solid #3b82f6; color: #3b82f6; font-weight: 600; }

  .scroll-wrapper {
    flex: 1; overflow-y: auto; 
    background: #f8fafc; border-radius: 25px;
    padding: 0 15px 15px 15px;
  }
  .logs-grid-header {
    display: grid; grid-template-columns: 1.2fr 1fr 1fr 1fr;
    padding: 20px 0; position: sticky; top: 0; 
    background: #f8fafc; z-index: 10;
  }
  .column-label { font-weight: 600; font-size: 0.9rem; color: #334155; text-align: center; }
  .log-row {
    display: grid; grid-template-columns: 1.2fr 1fr 1fr 1fr;
    padding: 14px 0; border-radius: 15px; margin-bottom: 6px;
    background: transparent; align-items: center;
  }
  .log-row:nth-child(even) { background-color: white; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
  .log-entry { font-size: 0.85rem; color: #64748b; text-align: center; }
  
  /* Status Color Updated to Black/Dark Gray */
  .status-text {
    font-weight: 700;
    color: #475569';
    font-size: 0.85rem;
  }
`;

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function CalendarPicker({ value, onChange, onClose }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(value ? new Date(value).getFullYear() : today.getFullYear());
  const [viewMonth, setViewMonth] = useState(value ? new Date(value).getMonth() : today.getMonth());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = [...Array(firstDay).fill(null), ...Array(daysInMonth).keys().map(i => i + 1)];

  return (
    <div className="calendar-popup">
      <div className="cal-nav">
        <button className="cal-nav-btn" onClick={() => viewMonth === 0 ? (setViewMonth(11), setViewYear(v => v - 1)) : setViewMonth(v => v - 1)}>‹</button>
        <span className="cal-month-label">{MONTHS[viewMonth]} {viewYear}</span>
        <button className="cal-nav-btn" onClick={() => viewMonth === 11 ? (setViewMonth(0), setViewYear(v => v + 1)) : setViewMonth(v => v + 1)}>›</button>
      </div>
      <div className="cal-grid">
        {DAYS.map(d => <div key={d} className="cal-day-name">{d}</div>)}
        {cells.map((day, i) => day === null ? <div key={i} className="cal-day empty" /> : (
          <button key={i} className={`cal-day ${value === `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}` ? 'selected' : ''}`}
            onClick={() => { onChange(`${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`); onClose(); }}>
            {day}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function MotionLogs() {
  const [logs, setLogs] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showCal, setShowCal] = useState(false);
  const calRef = useRef(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/motion'); 
        setLogs(response.data.sort((a, b) => new Date(b.time) - new Date(a.time)));
      } catch (error) {
        console.error("Error fetching motion logs:", error);
      }
    };
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (ts) => {
    return new Date(ts).toLocaleString('en-GB', {
      day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Colombo'
    }).replace(',', '');
  };

  const filteredLogs = logs.filter(log => {
    const logDate = new Date(log.time).toISOString().split('T')[0];
    const matchesDate = filterDate === '' || logDate === filterDate;
    const matchesStatus = filterStatus === '' || log.status === filterStatus;
    return matchesDate && matchesStatus;
  });

  return (
    <div className="logs-container">
      <style>{logStyles}</style>

      <div className="logs-header">
        <h2 style={{margin: 0, fontWeight: 800, color: '#1e293b'}}>Logs</h2>
        <div className="dropdown-group">
          
          <div style={{position: 'relative'}}>
            <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All Status</option>
              <option value="Stable">Stable</option>
              <option value="Moderate Vibration">Moderate Vibration</option>
              <option value="High Vibration">High Vibration</option>
              <option value="Critical Shock">Critical Shock</option>
            </select>
          </div>

          <div style={{position: 'relative'}} ref={calRef}>
            <button className="date-btn" onClick={() => setShowCal(!showCal)}>
              <span>{filterDate || 'Select Date'}</span>
              <span style={{color: '#3b82f6'}}>▼</span>
            </button>
            {showCal && <CalendarPicker value={filterDate} onChange={setFilterDate} onClose={() => setShowCal(false)} />}
          </div>
        </div>
      </div>

      <div className="scroll-wrapper">
        <div className="logs-grid-header">
          <div className="column-label">Time</div>
          <div className="column-label">Net G</div>
          <div className="column-label">Total G</div>
          <div className="column-label">Status</div>
        </div>

        <div className="logs-body">
          {filteredLogs.map((log) => (
            <div key={log._id} className="log-row">
              <div className="log-entry">{formatTime(log.time)}</div>
              <div className="log-entry" style={{fontWeight: 700}}>{log.net_g.toFixed(2)}g</div>
              <div className="log-entry">{log.total_g.toFixed(2)}g</div>
              <div className="log-entry">
                <span className="status-text">
                  {log.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}