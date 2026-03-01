import React from 'react'

const alert = () => {
  return (
    <div>alert</div>
  )
}

export default alert

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
//       return timestamp; // Fallback to raw string if conversion fails
//     }
//   };

//   const fetchLogs = async () => {
//     try {
//       const response = await axios.get('http://localhost:5000/api/security');
//       setLogs(response.data);
//     } catch (err) {
//       console.error("Backend not reachable. Ensure bridge.js is running.");
//     }
//   };

//   useEffect(() => {
//     fetchLogs();
//     const interval = setInterval(fetchLogs, 3000); 
//     return () => clearInterval(interval);
//   }, []);

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
//               {log.status === 'Granted' ? 
//                 <span style={styles.textSuccess}>[ GRANTED ]</span> : 
//                 <span style={styles.textDanger}>[ DENIED ]</span>
//               }
//             </div>
//             <div style={styles.idCol}>{log.card_id}</div>
//             {/* Using the Sri Lankan Time helper function here */}
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
//   timeCol: { color: '#94a3b8', fontSize: '13px' },
//   idCol: { letterSpacing: '1px' },
//   empty: { textAlign: 'center', padding: '40px', color: '#64748b' }
// };

// export default App;