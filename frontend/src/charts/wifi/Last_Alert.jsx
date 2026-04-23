import React, { useState, useEffect } from 'react';

const SensorStatusCard = () => {
  const [isOnline, setIsOnline] = useState(true);
  // Track screen size for dynamic icon scaling
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 640 : false);

  const BRAND_BLUE = '#1e40af'; 
  const WARN_ORANGE = '#ea0c0c';

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const updateStatus = (status) => {
    setIsOnline(status);
  };

  // Dynamic icon dimensions based on screen size
  const iconSize = isMobile ? "28" : "35";

  return (
    <div style={styles.card}>
      <div style={styles.textSide}>
        <span style={styles.label}>Sensor states</span>
        <h2 style={{ 
          ...styles.statusText, 
          color: isOnline ? BRAND_BLUE : WARN_ORANGE 
        }}>
          {isOnline ? 'Online' : 'Offline'}
        </h2>
      </div>

      <div style={styles.iconSide}>
        {isOnline ? (
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="#0047AB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.55a11 11 0 0 1 14.08 0" />
            <path d="M1.42 9a16 16 0 0 1 21.16 0" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <line x1="12" y1="20" x2="12.01" y2="20" />
          </svg>
        ) : (
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="#C4C9F4" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="12" cy="17" r="1.2" fill="white"/>
          </svg>
        )}
      </div>
    </div>
  );
};

const styles = {
  card: {
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    fontFamily: "'Poppins', sans-serif",
    width: '100%',
    boxSizing: 'border-box'
  },
  textSide: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1, // Ensures text takes up available space
    minWidth: 0 // Prevents layout breaking on very small screens
  },
  label: { 
    margin: 0, 
    color: '#64748b', 
    // Responsive font: Min 0.75rem, Max 0.9rem
    fontSize: 'clamp(0.75rem, 2.5vw, 0.9rem)', 
    fontWeight: '500',
    whiteSpace: 'nowrap'
  },
  statusText: { 
    // Responsive font: Min 1.1rem, Max 1.4rem
    fontSize: 'clamp(1.1rem, 4vw, 1.4rem)', 
    fontWeight: '700',
    margin: '2px 0 0 0',
    lineHeight: '1.2'
  },
  iconSide: {
    paddingLeft: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0 // Prevents the icon from being squashed
  }
};

export default SensorStatusCard;