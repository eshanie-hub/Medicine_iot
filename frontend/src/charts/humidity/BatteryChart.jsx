import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

// ─────────────────────────────────────────────────────────────
// 🔋 Voltage → Percentage (REALISTIC for 9V battery)
// ─────────────────────────────────────────────────────────────
function voltageToPercentage(v) {
  if (!isFinite(v)) return 0;

  const pct = (v / 9) * 100;
  return Math.max(0, Math.min(100, Math.round(pct)));
}

// ─────────────────────────────────────────────────────────────
// 🎨 Color helper
// ─────────────────────────────────────────────────────────────
function batteryColor(pct) {
  if (pct > 60) return '#22c55e';
  if (pct > 30) return '#410cbb';
  return '#ef4444';
}

// ─────────────────────────────────────────────────────────────
// 🕒 Time formatter
// ─────────────────────────────────────────────────────────────
function formatTime(ts) {
  return new Date(ts).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

// ─────────────────────────────────────────────────────────────
// 🔄 Convert log → chart point (WITH FILTER)
// ─────────────────────────────────────────────────────────────
function logToDataPoint(log) {
  const raw = Number(log.batt_v || 0);
  let voltage = raw > 100 ? raw / 1000 : raw;

  // 🚨 FILTER BAD SENSOR VALUES
  if (voltage < 5 || voltage > 10) return null;

  return {
    time: formatTime(log.timestamp || log.createdAt),
    batt_v: parseFloat(voltage.toFixed(3)),
    batt_pct: voltageToPercentage(voltage)
  };
}

// ─────────────────────────────────────────────────────────────
// 📉 Smart smoothing (ignores bad values)
// ─────────────────────────────────────────────────────────────
function smoothData(data, windowSize = 5) {
  return data.map((point, i) => {
    const start = Math.max(0, i - windowSize + 1);
    const slice = data.slice(start, i + 1);

    const valid = slice.filter(p => p.batt_pct > 0);

    if (!valid.length) return point;

    const avgPct = Math.round(
      valid.reduce((s, p) => s + p.batt_pct, 0) / valid.length
    );

    const avgV =
      valid.reduce((s, p) => s + p.batt_v, 0) / valid.length;

    return {
      ...point,
      batt_pct: avgPct,
      batt_v: parseFloat(avgV.toFixed(2))
    };
  });
}

// ─────────────────────────────────────────────────────────────
// 💬 Tooltip
// ─────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  const pct = payload[0]?.value ?? 0;
  const voltage = payload[1]?.value ?? '—';
  const color = batteryColor(pct);

  return (
    <div style={{
      background: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: 10,
      padding: '10px 14px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      fontSize: '0.8rem'
    }}>
      <div style={{ color: '#64748b', marginBottom: 4 }}>{label}</div>
      <div style={{ color, fontWeight: 700, fontSize: '1rem' }}>
        {pct}%
      </div>
      <div style={{ color: '#94a3b8', fontSize: '0.72rem' }}>
        {typeof voltage === 'number' ? voltage.toFixed(2) : voltage} V
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// 🚀 MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function BatteryChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Load initial data
  useEffect(() => {
    fetch('http://localhost:5000/api/humidity/battery?limit=30')
      .then(res => res.json())
      .then(logs => {
        const cleaned = logs
          .map(logToDataPoint)
          .filter(Boolean);

        setData(smoothData(cleaned));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // ── Live updates
  useEffect(() => {
    socket.on('humidityUpdate', (log) => {
      if (log.batt_v === undefined) return;

      const point = logToDataPoint(log);
      if (!point) return;

      setData(prev => {
        const updated = [...prev, point];
        return smoothData(updated.slice(-30));
      });
    });

    return () => socket.off('humidityUpdate');
  }, []);

  // ── Use RAW latest for display (NOT smoothed!)
  const latest = data.length ? data[data.length - 1] : null;
  const displayVoltage = latest?.batt_v ?? 0;
  const displayPct = voltageToPercentage(displayVoltage);
  const lineColor = batteryColor(displayPct);

  return (
    <div style={{ width: '100%', minHeight: 260 }}>

      {/* HEADER */}
      <div style={{ marginBottom: 10 }}>
        {/* <div style={{ fontSize: 18, fontWeight: 600 }}>
          Battery Health Analytics
        </div>
        <div style={{ fontSize: 13, color: '#64748b' }}>
          Last 30 readings · live
        </div> */}

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 8
        }}>
          <div>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              Voltage
            </div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>
              {displayVoltage.toFixed(2)} V
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              Battery %
            </div>
            <div style={{
              fontSize: 22,
              fontWeight: 700,
              color: batteryColor(displayPct)
            }}>
              {displayPct}%
            </div>
          </div>
        </div>
      </div>

      {/* STATES */}
      {loading && <div style={centeredStyle}>Loading…</div>}
      {!loading && data.length === 0 && (
        <div style={centeredStyle}>No data</div>
      )}

      {/* CHART */}
      {!loading && data.length > 0 && (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />

            <XAxis dataKey="time" />

            <YAxis
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />

            <Tooltip content={<CustomTooltip />} />

            <ReferenceLine y={30} stroke="#ef4444" strokeDasharray="4 4" />
            <ReferenceLine y={60} stroke="#410cbb" strokeDasharray="4 4" />

            <Line
              type="monotone"
              dataKey="batt_pct"
              stroke={lineColor}
              strokeWidth={2.5}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="batt_v"
              stroke="transparent"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* LEGEND */}
      <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
        <LegendItem color="#ef4444" label="Critical (<30%)" />
        <LegendItem color="#410cbb" label="Low (<60%)" />
        <LegendItem color="#22c55e" label="Healthy (≥60%)" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function LegendItem({ color, label }) {
  return (
    <div style={{ display: 'flex', gap: 6, fontSize: 12 }}>
      <div style={{ width: 20, height: 2, background: color }} />
      {label}
    </div>
  );
}

const centeredStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '200px',
  color: '#94a3b8'
};