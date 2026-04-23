import React, { useState } from 'react';

const SensorStatusCard = () => {
  // Use local state if you want to handle it here, 
  // or use the 'externalStatus' prop if you are sending it from a parent.
  const [isOnline, setIsOnline] = useState(true);
    const BRAND_BLUE = '#1e40af'; 
    const WARN_ORANGE = '#ea0c0c';
  // This function can be called by your external trigger (e.g., an API response)
  const updateStatus = (status) => {
    setIsOnline(status);
  };

  return (
    <div style={styles.card}>
      <div >
        <span style={styles.label}>Sensor states</span>
        <h2 style={{ ...styles.statusText, color: isOnline ? BRAND_BLUE : WARN_ORANGE}}>
          {isOnline ? 'Online' : 'Offline'}
        </h2>
      </div>

      <div style={styles.iconSide}>
        {isOnline ? (
          /* Blue Wifi Symbol */
          <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="#0047AB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.55a11 11 0 0 1 14.08 0" />
            <path d="M1.42 9a16 16 0 0 1 21.16 0" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <line x1="12" y1="20" x2="12.01" y2="20" />
          </svg>
        ) : (
          /* Offline Icon matching image_473221.png */
          <svg width="35" height="35" viewBox="0 0 24 24" fill="#C4C9F4" xmlns="http://www.w3.org/2000/svg">
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
        fontFamily: "'Poppins', sans-serif"
    },
  textSide: {
    display: 'flex',
    flexDirection: 'column',
  },
  
  label: { 
    margin: 0, 
    color: '#64748b', 
    fontSize: '0.9rem', 
    fontWeight: '500' 
},
  statusText: { 
    fontSize: '1.4rem', 
    fontWeight: '700'

},
  iconSide: {
    padding: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};

export default SensorStatusCard;