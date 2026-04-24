import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';

const BRAND_BLUE  = '#3182ce';
const WARN_RED    = '#ea0c0c';
const WARN_ORANGE = '#d97706';

export default function LastAlert() {
  const [motionData, setMotionData] = useState({
    status: 'Waiting...',
    serverTimestamp: null,
    isOnline: false
  });
  const [displayTime, setDisplayTime] = useState('No Data');

  const getTimeAgo = (date) => {
    if (!date) return 'No Data';
    const formattedDate = typeof date === 'string' ? date.replace(' ', 'T') : date;
    const parsedDate = new Date(formattedDate);
    if (isNaN(parsedDate)) return 'Invalid Date';
    const seconds = Math.floor((new Date() - parsedDate) / 1000);
    if (seconds < 0)  return 'Just now';
    if (seconds < 60) return `${seconds} sec ago`;
    const minutes = Math.floor(seconds / 60);
    return minutes < 60 ? `${minutes} min ago` : `${Math.floor(minutes / 60)} hours ago`;
  };

  useEffect(() => {
    setMotionData({ status: 'Stable', serverTimestamp: new Date().toISOString(), isOnline: true });
  }, []);

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setDisplayTime(getTimeAgo(motionData.serverTimestamp));
    }, 1000);
    return () => clearInterval(timeInterval);
  }, [motionData.serverTimestamp]);

  const getStatusColor = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('critical') || s.includes('high')) return WARN_RED;
    if (s.includes('moderate')) return WARN_ORANGE;
    return BRAND_BLUE;
  };

  const statusColor = getStatusColor(motionData.status);

  return (
    <>
      <style>{`
        .last-alert-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: 'Poppins', sans-serif;
          gap: 12px;
          flex-wrap: nowrap;
          min-width: 0;
          width: 100%;
          height: 100%;
          box-sizing: border-box;
        }
        .last-alert-text {
          flex: 1;
          min-width: 0;
        }
        .last-alert-title {
          margin: 0 0 6px;
          color: #64748b;
          font-size: 1rem;
          font-weight: 500;
          line-height: 1.3;
        }
        .last-alert-status {
          margin: 0 0 6px;
          font-size: 1.6rem;
          font-weight: 700;
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .last-alert-time {
          margin: 0;
          color: #94a3b8;
          font-size: 0.85rem;
          line-height: 1.3;
        }
        .last-alert-icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>

      <div className="last-alert-card">
        <div className="last-alert-text">
          <p className="last-alert-title">Vibration</p>
          <h1 className="last-alert-status" style={{ color: statusColor }}>
            {motionData.status}
          </h1>
          <p className="last-alert-time">
            Updated: {displayTime}
            {!motionData.isOnline && (
              <span style={{ color: 'red', fontSize: '10px' }}> (Offline)</span>
            )}
          </p>
        </div>

        <div className="last-alert-icon">
          <Activity size={36} color={statusColor} strokeWidth={2} />
        </div>
      </div>
    </>
  );
}