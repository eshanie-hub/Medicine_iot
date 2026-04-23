import React, { useEffect, useState, useMemo, useRef } from 'react';
import axios from 'axios';

const analyticsStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@200;400;500;600;700;800&display=swap');

  .analytics-wrap { font-family: 'Poppins', sans-serif; height: 100%; display: flex; flex-direction: column; }

  .analytics-header {
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;
    padding: 0 5px;
  }

  .date-btn {
    background: white; border: 1px solid #f1f5f9; padding: 6px 12px;
    border-radius: 25px; font-size: 0.75rem; color: #64748b; cursor: pointer;
    outline: none; box-shadow: 0 2px 10px rgba(0,0,0,0.03); min-width: 120px;
    display: flex; align-items: center; justify-content: space-between;
    gap: 5px; font-family: 'Poppins', sans-serif;
  }

  .calendar-popup {
    position: absolute; top: calc(100% + 8px); right: 0;
    background: white; border-radius: 16px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.12);
    padding: 12px; z-index: 999; width: 220px;
  }

  /* ... Calendar styles remain the same ... */
  .cal-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
  .cal-nav-btn { background: none; border: none; cursor: pointer; color: #3b82f6; font-size: 0.95rem; padding: 2px 6px; border-radius: 8px; }
  .cal-month-label { font-weight: 700; color: #1e293b; font-size: 0.82rem; font-family: 'Poppins', sans-serif; }
  .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
  .cal-day-name { text-align: center; font-size: 0.62rem; font-weight: 600; color: #94a3b8; padding: 3px 0; }
  .cal-day { text-align: center; padding: 4px 0; border-radius: 50%; font-size: 0.72rem; color: #475569; cursor: pointer; border: none; background: none; width: 100%; }
  .cal-day.selected { background: #3b82f6; color: white; font-weight: 700; }
  .cal-day.today { border: 1.5px solid #3b82f6; color: #3b82f6; }
  .cal-clear { margin-top: 8px; width: 100%; background: #f1f5f9; border: none; border-radius: 10px; padding: 5px; font-size: 0.72rem; color: #64748b; cursor: pointer; font-weight: 600; }

  .analytics-table-wrap {
    flex: 1; overflow-y: auto; background: #f8fafc; border-radius: 20px; padding: 0 8px 12px 8px;
  }

  /* Grid configuration: 1.5fr 1fr 1fr on desktop, 1.2fr 0.8fr 0.6fr on mobile */
  .analytics-table-header, .analytics-category-row {
    display: grid; 
    grid-template-columns: 1.3fr 1fr 0.7fr; 
    padding: 12px 5px;
    align-items: center;
  }

  @media (max-width: 480px) {
    .analytics-table-header, .analytics-category-row {
        grid-template-columns: 1.2fr 0.9fr 0.7fr;
        padding: 10px 2px;
    }
  }

  .analytics-table-header { position: sticky; top: 0; background: #f8fafc; z-index: 10; }

  .analytics-col-label { font-weight: 600; font-size: 0.75rem; color: #334155; text-align: center; }

  .analytics-category-row { border-radius: 12px; margin-bottom: 5px; cursor: pointer; }

  .analytics-cell {
    font-size: 0.78rem; color: #64748b; text-align: center;
    display: flex; align-items: center; justify-content: center; gap: 4px;
    overflow: hidden;
  }

  .detail-expand {
    background: white; border-radius: 12px; margin: 4px 0 12px 0;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05); overflow-x: auto;
  }

  .detail-table-header, .detail-row {
    display: grid; padding: 10px 8px;
  }

  .detail-row { font-size: 0.72rem; }

  .badge {
    padding: 2px 8px; border-radius: 20px; font-size: 0.65rem; font-weight: 600; white-space: nowrap;
  }
  .badge-normal  { background: #f0fff4; color: #38a169; }
  .badge-anomaly { background: #fff5f5; color: #e53e3e; }

  .action-btn {
    background: #ebf8ff; color: #3182ce; padding: 4px 10px; 
    border-radius: 20px; font-size: 0.65rem; font-weight: 600;
  }
`;

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function CalendarPicker({ value, onChange, onClose }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(value ? new Date(value).getFullYear() : today.getFullYear());
  const [viewMonth, setViewMonth] = useState(value ? new Date(value).getMonth() : today.getMonth());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };

  const selectDay = (day) => {
    const s = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(s); onClose();
  };

  const isSelected = (day) => {
    if (!value) return false;
    return `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` === value;
  };
  const isToday = (day) => day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
  const cells = [...Array(firstDay).fill(null), ...[...Array(daysInMonth).keys()].map(i => i + 1)];

  return (
    <div className="calendar-popup">
      <div className="cal-nav">
        <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
        <span className="cal-month-label">{MONTHS[viewMonth]} {viewYear}</span>
        <button className="cal-nav-btn" onClick={nextMonth}>›</button>
      </div>
      <div className="cal-grid">
        {DAYS.map(d => <div key={d} className="cal-day-name">{d}</div>)}
        {cells.map((day, i) =>
          day === null
            ? <div key={`e-${i}`} className="cal-day empty" />
            : <button
              key={day}
              className={`cal-day${isSelected(day) ? ' selected' : ''}${isToday(day) && !isSelected(day) ? ' today' : ''}`}
              onClick={() => selectDay(day)}
            >{day}</button>
        )}
      </div>
      <button className="cal-clear" onClick={() => { onChange(''); onClose(); }}>Clear</button>
    </div>
  );
}

const SecurityAnalytics = () => {
  const [logs, setLogs] = useState([]);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [showCal, setShowCal] = useState(false);
  const calRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/security');
        setLogs(response.data.sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt)));
      } catch (err) { console.error("Error fetching logs:", err); }
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (calRef.current && !calRef.current.contains(e.target)) setShowCal(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return 'Date';
    const [y, m, d] = dateStr.split('-');
    return `${parseInt(d)} ${MONTHS[parseInt(m) - 1].slice(0, 3)} ${y}`;
  };

  const dailyLogs = useMemo(() => {
    return logs.filter(log => new Date(log.receivedAt).toISOString().split('T')[0] === filterDate);
  }, [logs, filterDate]);

  const groupedData = useMemo(() => {
    return dailyLogs.reduce((acc, log) => {
      const type = log.anomaly || "None";
      if (!acc[type]) acc[type] = [];
      acc[type].push(log);
      return acc;
    }, {});
  }, [dailyLogs]);

  const getDuration = (unlockedLog, allLogs) => {
    if (unlockedLog.status !== 'Unlocked') return "---";
    const unlockedTime = new Date(unlockedLog.receivedAt);
    const nextLock = allLogs
      .filter(log => (log.status === 'Locked' || log.status === 'Automatic') && new Date(log.receivedAt) > unlockedTime)
      .sort((a, b) => new Date(a.receivedAt) - new Date(b.receivedAt))[0];
    if (!nextLock) return <span style={{ color: '#e53e3e', fontWeight: 700, fontSize: '0.65rem' }}>Open</span>;
    const totalSeconds = Math.max(0, Math.floor((new Date(nextLock.receivedAt) - unlockedTime) / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  };

  return (
    <div className="analytics-wrap">
      <style>{analyticsStyles}</style>

      <div className="analytics-header">
        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>Security Logs</div>
        <div style={{ position: 'relative', zIndex: 50 }} ref={calRef}>
          <button className="date-btn" onClick={() => setShowCal(v => !v)}>
            <span>{formatDisplayDate(filterDate)}</span>
            <span style={{ color: '#3b82f6', fontSize: '10px' }}>▼</span>
          </button>
          {showCal && (
            <CalendarPicker value={filterDate} onChange={setFilterDate} onClose={() => setShowCal(false)} />
          )}
        </div>
      </div>

      <div className="analytics-table-wrap">
        <div className="analytics-table-header">
          <div className="analytics-col-label">Category</div>
          <div className="analytics-col-label">Count</div>
          <div className="analytics-col-label">View</div>
        </div>

        {Object.keys(groupedData).map((type, rowIndex) => {
          const isUnauth = type === "Unauthorized Access";
          const sessionLogs = isUnauth ? groupedData[type] : groupedData[type].filter(l => l.status === 'Unlocked');
          const isExpanded = expandedGroup === type;
          const isNormal = type === "None";

          return (
            <React.Fragment key={type}>
              <div
                className="analytics-category-row"
                style={{ backgroundColor: rowIndex % 2 !== 0 ? 'white' : 'transparent' }}
                onClick={() => setExpandedGroup(isExpanded ? null : type)}
              >
                <div className="analytics-cell" style={{ justifyContent: 'flex-start', textAlign: 'left' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: isNormal ? '#48bb78' : '#f56565', flexShrink: 0 }} />
                  <span style={{ fontWeight: 600, color: '#2d3748', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {isNormal ? 'Normal' : type}
                  </span>
                </div>

                <div className="analytics-cell">
                  <span className={`badge ${isNormal ? 'badge-normal' : 'badge-anomaly'}`}>
                    {sessionLogs.length}
                  </span>
                </div>

                <div className="analytics-cell">
                  <span className="action-btn">{isExpanded ? 'Hide' : 'Info'}</span>
                </div>
              </div>

              {isExpanded && (
                <div className="detail-expand">
                  <div className="detail-table-header" style={{ gridTemplateColumns: isUnauth ? '1fr 1.2fr' : '0.8fr 1.2fr 1fr', background: '#f1f5f9' }}>
                    {['TIME', 'CARD ID', ...(!isUnauth ? ['DUR.'] : [])].map(h => (
                      <div key={h} style={{ fontWeight: 600, fontSize: '0.6rem', color: '#94a3b8', textAlign: 'center' }}>{h}</div>
                    ))}
                  </div>

                  {sessionLogs.map(log => (
                    <div key={log._id} className="detail-row" style={{ gridTemplateColumns: isUnauth ? '1fr 1.2fr' : '0.8fr 1.2fr 1fr' }}>
                      <div style={{ textAlign: 'center' }}>{new Date(log.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      <div style={{ textAlign: 'center', fontFamily: 'monospace', fontWeight: 600 }}>{log.card_id || '---'}</div>
                      {!isUnauth && <div style={{ textAlign: 'center' }}>{getDuration(log, dailyLogs)}</div>}
                    </div>
                  ))}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default SecurityAnalytics;