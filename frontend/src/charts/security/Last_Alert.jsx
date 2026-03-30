import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

export default function LockStatusCard() {
    const [status, setStatus] = useState("Loading...");
    const [lastTimeDisplay, setLastTimeDisplay] = useState("");

    // Helper function to format time/date
    const formatTimestamp = (ts) => {
        if (!ts) return "";
        const eventDate = new Date(ts);
        const now = new Date();
        const diffInMs = now - eventDate;
        const twentyFourHoursInMs = 24 * 60 * 60 * 1000;

        if (diffInMs > twentyFourHoursInMs) {
            // More than 24 hours: Show Date (e.g., 25 Mar 2026)
            return eventDate.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        } else {
            // Less than 24 hours: Show Time (e.g., 4:15 PM)
            return eventDate.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        }
    };

    useEffect(() => {
        // Fetch current state on mount
        fetch('http://localhost:5000/api/security')
            .then(res => res.json())
            .then(data => {
                if (data.length > 0) {
                    const latest = data[0];
                    setStatus(latest.status);
                    setLastTimeDisplay(formatTimestamp(latest.timestamp || latest.receivedAt));
                }
            })
            .catch(err => console.error("Fetch error:", err));

        // Listen for live updates
        socket.on('lockUpdate', (data) => {
            setStatus(data.status);
            // On a live update, it's always "now", so it will show time
            setLastTimeDisplay(formatTimestamp(new Date()));
        });

        return () => socket.off('lockUpdate');
    }, []);

    const isLocked = status === "Locked" || status === "Close";

    return (
        <div style={styles.card}>
            <div>
                <p style={styles.title}>Security Lock</p>
                <h1 style={{...styles.status, color: isLocked ? '#1e40af' : '#ea580c'}}>
                    {status}
                </h1>
                <p style={styles.time}>Updated: {lastTimeDisplay}</p>
            </div>
            <div style={{...styles.iconBox}}>
                <span style={{fontSize: '30px'}}>{isLocked ? '🔒' : '🔓'}</span>
            </div>
        </div>
    );
}

const styles = {
    card: {
        // background: 'white', padding: '20px', borderRadius: '15px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        // boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '20px',
        fontFamily: "'Poppins', sans-serif"
    },
    title: { margin: 0, color: '#64748b', fontSize: '0.9rem', fontWeight: '500' },
    status: { fontSize: '1.4rem', fontWeight: '700', color: '#1e3a6e' },
    time: { margin: 0, color: '#94a3b8', fontSize: '0.8rem' },
    iconBox: { padding: '15px', borderRadius: '12px' }
}; 