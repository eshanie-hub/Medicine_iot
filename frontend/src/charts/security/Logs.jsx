import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const logStyles = `
  .logs-container {
    /* Use a fixed or relative height to enable internal scrolling */
    height: 100%; 
    display: flex; 
    flex-direction: column;
    font-family: 'Poppins', sans-serif;
    overflow: hidden; /* Prevents container from expanding */
  }
  
  .logs-header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 15px;
    gap: 15px;
    flex-shrink: 0; /* Header won't shrink when logs grow */
  }

  @media (max-width: 640px) {
    .logs-header { flex-direction: column; align-items: flex-start; }
    .dropdown-group { width: 100%; flex-direction: column; }
    .filter-select, .date-btn { width: 100%; min-width: unset; }
  }

  .dropdown-group { display: flex; gap: 12px; }
  
  .filter-select, .date-btn {
    background: white; border: 1px solid #f1f5f9;
    padding: 10px 20px; border-radius: 25px;
    font-size: 0.9rem; color: #64748b; cursor: pointer;
    box-shadow: 0 2px 10px rgba(0,0,0,0.03); min-width: 140px;
  }

  /* Scrollable Area */
  .scroll-wrapper {
    flex: 1; 
    overflow-y: auto; 
    overflow-x: hidden;
    background: #f8fafc; 
    border-radius: 18px;
    padding: 0 10px;
    /* Custom Scrollbar */
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 transparent;
  }

  .scroll-wrapper::-webkit-scrollbar { width: 6px; }
  .scroll-wrapper::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

  /* Grid Layout */
  .logs-grid-header, .log-row {
    display: grid; 
    grid-template-columns: 1.2fr 1fr 1fr;
    gap: 8px;
    align-items: center;
  }

  @media (min-width: 768px) {
    .logs-grid-header, .log-row { grid-template-columns: 1fr 1fr 1fr; }
  }

  /* Fixed Header inside scroll area */
  .logs-grid-header {
    padding: 15px 0; 
    position: sticky; 
    top: 0; 
    background: #f8fafc; 
    z-index: 10;
    border-bottom: 1px solid #e2e8f0;
  }

  .column-label {
    font-weight: 700; font-size: 0.85rem; color: #1e293b; text-align: center;
  }

  .log-row {
    padding: 12px 0; border-bottom: 1px solid #f1f5f9;
    background: transparent;
    transition: background 0.2s;
  }

  .log-row:hover { background: rgba(255,255,255,0.5); }

  .log-entry {
    font-size: 0.8rem; color: #64748b; text-align: center;
    word-break: break-word;
  }

  .status-badge {
    font-weight: 600;
    font-size: 0.75rem;
    padding: 4px 8px;
    border-radius: 6px;
    display: inline-block;
  }

  /* Original Calendar Styles (unchanged) */
  .calendar-popup { position: absolute; top: calc(100% + 8px); right: 0; background: white; border-radius: 20px; box-shadow: 0 8px 30px rgba(0,0,0,0.12); padding: 16px; z-index: 100; width: 280px; }
  .cal-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .cal-month-label { font-weight: 700; color: #1e293b; font-size: 0.95rem; }
  .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
  .cal-day { text-align: center; padding: 6px 0; border-radius: 50%; font-size: 0.82rem; cursor: pointer; border: none; background: none; }
  .cal-day.selected { background: #3b82f6; color: white; }
`;

// ... [CalendarPicker and logic remain exactly as your original code] ...

export default function SecurityLogs() {
  const [logs, setLogs] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [filterCard, setFilterCard] = useState('');
  const [showCal, setShowCal] = useState(false);
  const calRef = useRef(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/security');
        setLogs(response.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      } catch (e) { console.error(e); }
    };
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatSLTime = (ts) => {
    if (!ts) return "—";
    const date = new Date(ts);
    return date.toLocaleString('en-GB', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  const filteredLogs = logs.filter(log => {
    const logDate = new Date(log.receivedAt || log.timestamp).toISOString().split('T')[0];
    return (filterDate === '' || logDate === filterDate) && (filterCard === '' || log.card_id === filterCard);
  });

  return (
    <div className="logs-container">
      <style>{logStyles}</style>

      <div className="logs-header">
        <h3 style={{margin: 0, fontWeight: 700, color: '#1e293b'}}>Activity</h3>
        <div className="dropdown-group">
          <select className="filter-select" value={filterCard} onChange={(e) => setFilterCard(e.target.value)}>
            <option value="">All Cards</option>
            {[...new Set(logs.map(l => l.card_id).filter(Boolean))].map(id => <option key={id} value={id}>{id}</option>)}
          </select>

          <div style={{position: 'relative'}} ref={calRef}>
            <button className="date-btn" onClick={() => setShowCal(!showCal)}>
              <span>{filterDate ? filterDate : 'Date'}</span>
              <span style={{color: '#3b82f6', fontSize: '0.7rem'}}>▼</span>
            </button>
            {showCal && (
              <CalendarPicker
                value={filterDate}
                onChange={setFilterDate}
                onClose={() => setShowCal(false)}
              />
            )}
          </div>
        </div>
      </div>

      <div className="scroll-wrapper">
        <div className="logs-grid-header">
          <div className="column-label">Time</div>
          <div className="column-label">Card</div>
          <div className="column-label">Status</div>
        </div>

        <div className="logs-body">
          {filteredLogs.map((log) => (
            <div key={log._id} className="log-row">
              <div className="log-entry">{formatSLTime(log.receivedAt || log.timestamp)}</div>
              <div className="log-entry">{log.card_id || "—"}</div>
              <div className="log-entry" style={{
                color: log.status?.toLowerCase().includes('denied') ? '#ef4444' : '#10b981',
                fontWeight: 600
              }}>
                {log.status || "N/A"}
              </div>
            </div>
          ))}
          {filteredLogs.length === 0 && (
            <div style={{textAlign: 'center', padding: '40px', color: '#94a3b8'}}>No logs found</div>
          )}
        </div>
      </div>
    </div>
  );
}