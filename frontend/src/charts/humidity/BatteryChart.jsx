import React, { useEffect, useState, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const pct = payload[0].value;
    const color = pct > 60 ? '#22c55e' : pct > 30 ? '#410cbb' : '#ef4444';
    return (
      <div style={{
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '10px 14px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        fontSize: '0.8rem'
      }}>
        <div style={{ color: '#64748b', marginBottom: 4 }}>{label}</div>
        <div style={{ color, fontWeight: 700, fontSize: '1rem' }}>{pct}%</div>
        <div style={{ color: '#94a3b8', fontSize: '0.72rem' }}>{payload[1]?.value ?? '—'} V</div>
      </div>
    );
  }
  return null;
};

export default function BatteryChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Format timestamp to short time string
  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  // Fetch initial historical data
  useEffect(() => {
    fetch('http://localhost:5000/api/humidity/battery?limit=30')
      .then(res => res.json())
      .then(logs => {
        const formatted = logs.map(log => ({
          time: formatTime(log.timestamp || log.createdAt),
          batt_pct: log.batt_pct,
          batt_v: log.batt_v,
        }));
        setData(formatted);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Real-time update via Socket.IO
  useEffect(() => {
    socket.on('humidityUpdate', (log) => {
      if (log.batt_pct === undefined) return;
      const newPoint = {
        time: formatTime(log.timestamp || log.createdAt),
        batt_pct: log.batt_pct,
        batt_v: log.batt_v,
      };
      setData(prev => {
        const updated = [...prev, newPoint];
        return updated.slice(-30); // Keep last 30 points
      });
    });

    return () => socket.off('humidityUpdate');
  }, []);

  // Color based on battery level
  const latest = data[data.length - 1];
  const lineColor = !latest ? '#2d82cc'
    : latest.batt_pct > 60 ? '#22c55e'
    : latest.batt_pct > 30 ? '#410cbb'
    : '#ef4444';

  return (
    <div style={{ width: '100%', minHeight: 260 }}>
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#94a3b8', fontSize: '0.85rem' }}>
          Loading battery data…
        </div>
      ) : data.length === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#94a3b8', fontSize: '0.85rem' }}>
          No battery data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            {/* Warning reference lines */}
            <ReferenceLine y={30} stroke="#ef4444" strokeDasharray="4 4" strokeOpacity={0.5} />
            <ReferenceLine y={60} stroke="#410cbb" strokeDasharray="4 4" strokeOpacity={0.4} />
            <Line
              type="monotone"
              dataKey="batt_pct"
              stroke={lineColor}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: lineColor, strokeWidth: 0 }}
            />
            {/* Hidden line to pass batt_v into tooltip */}
            <Line type="monotone" dataKey="batt_v" stroke="transparent" dot={false} legendType="none" />
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 4, paddingLeft: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.72rem', color: '#94a3b8' }}>
          <div style={{ width: 20, height: 2, background: '#ef4444', borderRadius: 2 }} />
          Critical (&lt;30%)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.72rem', color: '#94a3b8' }}>
          <div style={{ width: 20, height: 2, background: '#410cbb', borderRadius: 2 }} />
          Low (&lt;60%)
        </div>
      </div>
    </div>
  );
}