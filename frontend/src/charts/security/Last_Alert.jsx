import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Lock, LockKeyholeOpen, AlertTriangle } from 'lucide-react';

const socket = io('http://localhost:5000');

const BRAND_BLUE = '#1e40af'; 
const WARN_ORANGE = '#ea0c0c';

export default function LockStatusCard() {
    const [status, setStatus] = useState("Loading...");
    const [lastTimeDisplay, setLastTimeDisplay] = useState("");

    // Detect if screen is small for dynamic icon sizing
    const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', handleResize);
        
        // Fetch logic
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

        socket.on('lockUpdate', (data) => {
            setStatus(data.status);
            setLastTimeDisplay(formatTimestamp(new Date()));
        });

        return () => {
            socket.off('lockUpdate');
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const formatTimestamp = (ts) => {
        if (!ts) return "";
        const eventDate = new Date(ts);
        const now = new Date();
        const diffInMs = now - eventDate;
        if (diffInMs > 86400000) {
            return eventDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        }
        return eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const isLocked = status === "Locked" || status === "Close";
    const isDenied = status === "Denied" || status === "Access Denied";
    
    const renderIcon = () => {
        const iconProps = {
            size: isMobile ? 24 : 32, // Shrink icon on mobile
            color: BRAND_BLUE,
            strokeWidth: 2
        };
        if (isDenied) return <AlertTriangle {...iconProps} />;
        if (isLocked) return <Lock {...iconProps} />;
        return <LockKeyholeOpen {...iconProps} />;
    };

    return (
        <div style={styles.card}>
            <div style={styles.textSide}>
                <p style={styles.title}>Security Lock</p>
                <h1 style={{
                    ...styles.status, 
                    color: isDenied ? WARN_ORANGE : (isLocked ? BRAND_BLUE : WARN_ORANGE)
                }}>
                    {status}
                </h1>
                <p style={styles.time}>Updated: {lastTimeDisplay}</p>
            </div>
            
            <div style={styles.iconContainer}>
                {renderIcon()}
            </div>
        </div>
    );
}

const styles = {
    card: {
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        fontFamily: "'Poppins', sans-serif",
        width: '100%',
        boxSizing: 'border-box',
        padding: '4px 0' // Slight breathing room
    },
    textSide: {
        flex: 1,
        minWidth: 0 // Prevents text overflow issues in flex
    },
    title: { 
        margin: 0, 
        color: '#64748b', 
        fontSize: 'clamp(0.75rem, 2vw, 0.9rem)', // Scales between 0.75rem and 0.9rem
        fontWeight: '500',
        whiteSpace: 'nowrap'
    },
    status: { 
        fontSize: 'clamp(1.1rem, 4vw, 1.4rem)', // Scales between 1.1rem and 1.4rem
        fontWeight: '700',
        margin: '2px 0',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
    },
    time: { 
        margin: 0, 
        color: '#94a3b8', 
        fontSize: 'clamp(0.65rem, 1.5vw, 0.8rem)', 
        whiteSpace: 'nowrap'
    },
    iconContainer: { 
        paddingLeft: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0 // Icon won't get squished
    }
};