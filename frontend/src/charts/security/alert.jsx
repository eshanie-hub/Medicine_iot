// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// function App() {
//   const [logs, setLogs] = useState([]);

//   // Helper function to format timestamp to Sri Lankan Time (Asia/Colombo)
//   const formatSLTime = (timestamp) => {
//     if (!timestamp) return "N/A";
    
//     try {
//       const dateObj = new Date(timestamp);
//       return dateObj.toLocaleString('en-GB', {
//         timeZone: 'Asia/Colombo',
//         hour: '2-digit',
//         minute: '2-digit',
//         second: '2-digit',
//         day: '2-digit',
//         month: 'short',
//         year: 'numeric',
//         hour12: true
//       });
//     } catch (e) {
//       return timestamp; 
//     }
//   };

//   const fetchLogs = async () => {
//     try {
//       const response = await axios.get('http://localhost:5000/api/security');
//       // Sort logs to show the most recent at the top
//       const sortedData = response.data.sort((a, b) => 
//         new Date(b.receivedAt || b.timestamp) - new Date(a.receivedAt || a.timestamp)
//       );
//       setLogs(sortedData);
//     } catch (err) {
//       console.error("Backend not reachable. Ensure bridge.js is running.");
//     }
//   };

//   useEffect(() => {
//     fetchLogs();
//     const interval = setInterval(fetchLogs, 3000); 
//     return () => clearInterval(interval);
//   }, []);

//   // Helper to render the correct status label and style
//   const renderStatus = (status) => {
//     const s = status ? status.toLowerCase() : "";
    
//     if (s.includes('granted') || s.includes('unlocked')) {
//       return <span style={styles.textSuccess}>[ UNLOCKED ]</span>;
//     } else if (s.includes('denied') || s.includes('unauthorized')) {
//       return <span style={styles.textDanger}>[ DENIED ]</span>;
//     } else if (s.includes('locked')) {
//       return <span style={styles.textWarning}>[ LOCKED ]</span>;
//     } else {
//       return <span style={styles.textDefault}>[ {status.toUpperCase()} ]</span>;
//     }
//   };

//   return (
//     <div style={styles.container}>
//       <header style={styles.header}>
//         <h1>SECURITY HUB</h1>
//         <p>Real-time Smart Lock Monitoring (Sri Lanka Time)</p>
//       </header>

//       <div style={styles.card}>
//         <div style={styles.tableHeader}>
//           <span>STATUS</span>
//           <span>CARD ID</span>
//           <span>TIMESTAMP (SLST)</span>
//         </div>
        
//         {logs.map((log) => (
//           <div key={log._id} style={styles.row}>
//             <div style={styles.statusCol}>
//               {renderStatus(log.status)}
//             </div>
//             <div style={styles.idCol}>{log.card_id || "N/A"}</div>
//             <div style={styles.timeCol}>
//               {formatSLTime(log.receivedAt || log.timestamp)}
//             </div>
//           </div>
//         ))}
        
//         {logs.length === 0 && <p style={styles.empty}>Waiting for data from ESP32...</p>}
//       </div>
//     </div>
//   );
// }

// const styles = {
//   container: { 
//     padding: '40px', 
//     backgroundColor: '#0f172a', 
//     minHeight: '100vh', 
//     color: '#f8fafc', 
//     fontFamily: 'monospace' 
//   },
//   header: { 
//     textAlign: 'center', 
//     marginBottom: '40px', 
//     letterSpacing: '2px' 
//   },
//   card: { 
//     maxWidth: '900px', 
//     margin: '0 auto', 
//     backgroundColor: '#1e293b', 
//     borderRadius: '8px', 
//     border: '1px solid #334155', 
//     padding: '10px',
//     boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
//   },
//   tableHeader: { 
//     display: 'grid', 
//     gridTemplateColumns: '1fr 1fr 1.5fr', 
//     padding: '15px', 
//     borderBottom: '2px solid #334155', 
//     fontWeight: 'bold', 
//     color: '#94a3b8', 
//     textAlign: 'center' 
//   },
//   row: { 
//     display: 'grid', 
//     gridTemplateColumns: '1fr 1fr 1.5fr', 
//     padding: '15px', 
//     borderBottom: '1px solid #334155', 
//     alignItems: 'center', 
//     textAlign: 'center' 
//   },
//   textSuccess: { color: '#4ade80', fontWeight: 'bold' },
//   textDanger: { color: '#f87171', fontWeight: 'bold' },
//   textWarning: { color: '#fbbf24', fontWeight: 'bold' }, // Added for "Locked" status
//   textDefault: { color: '#94a3b8', fontWeight: 'bold' },
//   timeCol: { color: '#94a3b8', fontSize: '13px' },
//   idCol: { letterSpacing: '1px' },
//   empty: { textAlign: 'center', padding: '40px', color: '#64748b' }
// };

// export default App;