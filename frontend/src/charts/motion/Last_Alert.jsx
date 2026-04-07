import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

// 1. Define the WebSocket URL correctly
// Ensure this matches your Node.js server port exactly (5000)
const socket = io('http://localhost:5000', {
  transports: ['websocket'], // Forces WebSocket for faster, more stable connection
  autoConnect: true
});

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

  // 2. Initial Fetch: Gets the last known state so the UI isn't empty on refresh
  const fetchInitialData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/motion/latest');
      if (response.data) {
        setMotionData({
          status: response.data.status || 'Stable',
          serverTimestamp: response.data.time || response.data.createdAt,
          isOnline: true
        });
      }
    } catch (err) {
      console.error("Initial fetch failed:", err);
      setMotionData(prev => ({ ...prev, isOnline: false }));
    }
  };

  useEffect(() => {
    fetchInitialData();

    // 3. Socket Event Listeners
    socket.on('connect', () => {
      console.log("WebSocket Connected!");
      setMotionData(prev => ({ ...prev, isOnline: true }));
    });

    socket.on('connect_error', () => {
      console.error("WebSocket Connection Error");
      setMotionData(prev => ({ ...prev, isOnline: false }));
    });

    // This must match the 'io.emit' name in your backend bridge.js
    socket.on('vibrationData', (newData) => {
      console.log("Real-time Vibration Received:", newData);
      setMotionData({
        status: newData.status || 'Active',
        serverTimestamp: newData.time || new Date(),
        isOnline: true
      });
    });

    // Cleanup listeners when component unmounts
    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('vibrationData');
    };
  }, []);

  // 4. Time Update Logic (keeps the "Updated: X sec ago" current)
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setDisplayTime(getTimeAgo(motionData.serverTimestamp));
    }, 1000);
    return () => clearInterval(timeInterval);
  }, [motionData.serverTimestamp]);

  const getStatusClass = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('critical') || s.includes('high')) return 'status-critical';
    if (s.includes('moderate')) return 'status-warning';
    return 'status-stable';
  };

  return (
    <>
      <span className="status-label">Vibration</span>
      <span className={`status-value ${getStatusClass(motionData.status)}`}>
        {motionData.status}
      </span>
      <span className="status-sub">
        Updated: {displayTime}
        {!motionData.isOnline && <span style={{color: 'red', fontSize: '10px'}}> (Offline)</span>}
      </span>
    </>
  );
};

export default LastAlert;