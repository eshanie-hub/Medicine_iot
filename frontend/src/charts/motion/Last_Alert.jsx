import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LastAlert = () => {
  const [motionData, setMotionData] = useState({
    status: 'Waiting...',
    serverTimestamp: null,
    isOnline: false
  });
  const [displayTime, setDisplayTime] = useState('No Data');

  const getTimeAgo = (date) => {
    if (!date) return 'No Data';
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 0) return "0 sec ago";
    if (seconds < 60) return `${seconds} sec ago`;
    const minutes = Math.floor(seconds / 60);
    return minutes < 60 ? `${minutes} min ago` : `${Math.floor(minutes / 60)} hours ago`;
  };

  const fetchMotionData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/motion/latest');
      if (response.data) {
        setMotionData({
          status: response.data.status,
          serverTimestamp: response.data.createdAt,
          isOnline: true
        });
      }
    } catch (err) {
      setMotionData(prev => ({ ...prev, isOnline: false }));
    }
  };

  const getStatusClass = (status) => {
    if (status?.includes('Critical') || status?.includes('High')) return 'status-critical';
    if (status?.includes('Moderate')) return 'status-warning';
    return 'status-stable';
  };

  useEffect(() => {
    fetchMotionData();
    const interval = setInterval(fetchMotionData, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setDisplayTime(getTimeAgo(motionData.serverTimestamp));
    }, 1000);
    return () => clearInterval(timeInterval);
  }, [motionData.serverTimestamp]);

  return (
    <>
      <span className="status-label">Vibration</span>
      <span className={`status-value ${getStatusClass(motionData.status)}`}>
        {motionData.status}
      </span>
      <span className="status-sub">Updated: {displayTime}</span>
    </>
  );
};

export default LastAlert;