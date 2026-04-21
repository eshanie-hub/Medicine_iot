import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    ReferenceArea,
    ReferenceLine,
    Tooltip,
} from "recharts";
import { AlertTriangle, X, ClipboardList } from "lucide-react";

const HUMIDITY_API_URL = "http://localhost:5000/api/humidity";
const ROUTES_API_URL = "http://localhost:5000/api/route";
const CURRENT_ROUTE_API_URL = "http://localhost:5000/api/route/current";

const SAFE_MIN = 30; // % RH
const SAFE_MAX = 60; // % RH

// ─── Live clock tick (every second) ─────────────────────────────────
function useTick(intervalMs = 1000) {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), intervalMs);
        return () => clearInterval(id);
    }, [intervalMs]);
    return now;
}

function formatTime(ts) {
    if (!ts) return "";
    return new Date(ts).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "Asia/Colombo",
    });
}

function formatTooltipTime(ts) {
    if (!ts) return "";
    return new Date(ts).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "Asia/Colombo",
    });
}

function formatSLTime(ts) {
    if (!ts) return "N/A";
    return new Date(ts)
        .toLocaleString("en-GB", {
            day: "numeric",
            month: "short",
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
            timeZone: "Asia/Colombo",
        })
        .replace(",", "");
}

function formatRouteLabel(route) {
    if (!route) return "";
    const start = route.start_time
        ? new Date(route.start_time).toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: "Asia/Colombo",
        })
        : "Unknown";
    const statusLabel = route.status?.toLowerCase() === "active" ? "LIVE" : "ENDED";
    return `${route.route_id} (${statusLabel}) - ${start}`;
}

const BUCKET_MS = 60 * 1000;

function getBucketStart(ts, anchorTs = 0) {
    return anchorTs + Math.floor((ts - anchorTs) / BUCKET_MS) * BUCKET_MS;
}

function aggregateLogs(logs, anchorTs = 0) {
    if (!logs || logs.length === 0) return [];

    const grouped = {};
    logs.forEach((item) => {
        const humidity = Number(item.hum);
        if (Number.isNaN(humidity)) return;

        const ts = new Date(item.timestamp || item.createdAt).getTime();
        const bucketStart = getBucketStart(ts, anchorTs);

        if (!grouped[bucketStart]) {
            grouped[bucketStart] = {
                rawTime: new Date(bucketStart).toISOString(),
                values: [],
                items: [],
            };
        }

        grouped[bucketStart].values.push(humidity);
        grouped[bucketStart].items.push(item);
    });

    return Object.values(grouped)
        .sort((a, b) => new Date(a.rawTime) - new Date(b.rawTime))
        .map((group) => {
            const values = group.values;
            const min = Math.min(...values);
            const max = Math.max(...values);
            const avg = values.reduce((sum, v) => sum + v, 0) / values.length;

            // Breach: above SAFE_MAX (high humidity) takes priority, then below SAFE_MIN
            let breachPoint = null;
            if (max > SAFE_MAX) breachPoint = max;
            else if (min < SAFE_MIN) breachPoint = min;

            return {
                rawTime: group.rawTime,
                timeValue: new Date(group.rawTime).getTime(),
                time: formatTime(group.rawTime),
                min: Number(min.toFixed(2)),
                max: Number(max.toFixed(2)),
                avg: Number(avg.toFixed(2)),
                breachPoint,
                _items: group.items,
            };
        });
}

// Calculate time above SAFE_MAX limit (high humidity breach)
function calculateTimeAboveLimitMs(logs, limit = SAFE_MAX) {
    if (!logs || logs.length < 2) return 0;
    let totalMs = 0;
    for (let i = 1; i < logs.length; i++) {
        const prev = logs[i - 1];
        const curr = logs[i];
        const prevVal = Number(prev.hum);
        const currVal = Number(curr.hum);
        if (Number.isNaN(prevVal) || Number.isNaN(currVal)) continue;
        const prevTime = new Date(prev.timestamp || prev.createdAt).getTime();
        const currTime = new Date(curr.timestamp || curr.createdAt).getTime();
        if (prevVal > limit && currVal > limit) {
            totalMs += Math.max(0, currTime - prevTime);
        }
    }
    return totalMs;
}

function groupLogsForModalByMinute(logs, anchorTs = 0) {
    if (!logs || logs.length === 0) return [];

    const grouped = {};
    logs.forEach((log) => {
        const ts = log.timestamp || log.createdAt;
        if (!ts) return;

        const bucketStart = getBucketStart(new Date(ts).getTime(), anchorTs);
        if (!grouped[bucketStart]) grouped[bucketStart] = [];
        grouped[bucketStart].push(log);
    });

    return Object.keys(grouped)
        .sort((a, b) => Number(b) - Number(a))
        .map((key) => {
            const arr = grouped[key];
            const latestLog = arr[arr.length - 1];
            return {
                ...latestLog,
                bucketStartTime: Number(key),
            };
        });
}

function formatMinutesToHoursMins(totalMinutes) {
    if (!totalMinutes || totalMinutes <= 0) return "0m";
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
}

/* ─── Log Modal ──────────────────────────────────────────────────── */
function LogModal({ logs, onClose, title }) {
    if (!logs || logs.length === 0) return null;
    return (
        <div
            style={{
                position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", zIndex: 1000,
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "16px", backdropFilter: "blur(2px)",
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: "white", borderRadius: "18px", padding: "20px 22px",
                    width: "100%", maxWidth: "480px", maxHeight: "80vh",
                    display: "flex", flexDirection: "column",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.22)", fontFamily: "'Poppins', sans-serif",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexShrink: 0 }}>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "#1e293b" }}>Humidity Logs</div>
                        {title && <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "2px" }}>{title}</div>}
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: "#f1f5f9", border: "none", cursor: "pointer", color: "#64748b", padding: "6px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#e2e8f0")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                    >
                        <X size={16} />
                    </button>
                </div>
                <div style={{ marginBottom: "10px", flexShrink: 0 }}>
                    <span style={{ background: "#eff6ff", color: "#2563eb", borderRadius: "6px", padding: "3px 10px", fontSize: "0.7rem", fontWeight: 700 }}>
                        {logs.length} record{logs.length !== 1 ? "s" : ""}
                    </span>
                </div>
                <div style={{ overflowY: "auto", flex: 1 }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
                        <thead style={{ position: "sticky", top: 0, background: "white", zIndex: 1 }}>
                            <tr>
                                {["Time", "Humidity", "Status", "Fan"].map((h) => (
                                    <th key={h} style={{ textAlign: "left", padding: "6px 10px", color: "#94a3b8", fontWeight: 700, borderBottom: "2px solid #f1f5f9", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log, i) => {
                                const val = Number(log.hum);
                                const isHigh = val > SAFE_MAX;
                                const isLow = val < SAFE_MIN;
                                return (
                                    <tr key={log._id || i} style={{ background: i % 2 === 0 ? "white" : "#f8fafc" }}>
                                        <td style={{ padding: "7px 10px", color: "#475569" }}>{formatSLTime(log.bucketStartTime || log.createdAt || log.timestamp)}</td>
                                        <td style={{ padding: "7px 10px" }}>
                                            <span style={{ fontWeight: 700, color: isHigh ? "#dc2626" : isLow ? "#7c3aed" : "#16a34a", background: isHigh ? "#fef2f2" : isLow ? "#f5f3ff" : "#f0fdf4", borderRadius: "5px", padding: "2px 7px", fontSize: "0.77rem" }}>
                                                {log.hum !== null && log.hum !== undefined ? `${log.hum}%` : "N/A"}
                                            </span>
                                        </td>
                                        <td style={{ padding: "7px 10px", fontWeight: 600, fontSize: "0.72rem", color: log.hum_status === "CRITICAL" ? "#dc2626" : log.hum_status === "WARNING" ? "#ea580c" : log.hum_status === "NORMAL" ? "#16a34a" : "#475569" }}>
                                            {log.hum_status || "—"}
                                        </td>
                                        <td style={{ padding: "7px 10px", color: "#64748b" }}>{log.fan || "N/A"}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

/* ─── Custom Tooltip ─────────────────────────────────────────────── */
function CustomTooltip({ active, payload }) {
    if (!active || !payload || !payload.length) return null;
    const rawTime = payload[0]?.payload?.rawTime;
    return (
        <div style={{ borderRadius: 10, border: "1px solid #e2e8f0", boxShadow: "0 6px 18px rgba(0,0,0,0.09)", fontSize: 11, fontFamily: "Poppins, sans-serif", background: "#fff", padding: "7px 11px" }}>
            {rawTime && <div style={{ color: "#64748b", marginBottom: 3 }}>{formatTooltipTime(rawTime)}</div>}
            {payload.map((p) =>
                p.value !== null && p.value !== undefined && p.dataKey !== "breachPoint" ? (
                    <div key={p.dataKey} style={{ color: p.color || "#64748b" }}>
                        {p.name}: <strong>{p.value}%</strong>
                    </div>
                ) : null
            )}
        </div>
    );
}

function CustomYTick({ x, y, payload }) {
    return (
        <text x={x} y={y} dy={4} textAnchor="end" fill="#64748b" fontSize={10} fontWeight={400} fontFamily="Poppins, sans-serif">
            {`${payload.value}%`}
        </text>
    );
}

/* ─── LIVE Badge ─────────────────────────────────────────────────── */
function LiveBadge() {
    const [blink, setBlink] = useState(true);
    useEffect(() => {
        const id = setInterval(() => setBlink((b) => !b), 900);
        return () => clearInterval(id);
    }, []);
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: "4px",
            background: "#fef2f2", border: "1.5px solid #fca5a5",
            borderRadius: "6px", padding: "2px 7px",
            fontSize: "0.65rem", fontWeight: 800, color: "#dc2626",
            letterSpacing: "0.08em", textTransform: "uppercase",
            fontFamily: "'Poppins', sans-serif",
        }}>
            <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "#dc2626",
                opacity: blink ? 1 : 0.2,
                transition: "opacity 0.4s ease",
                flexShrink: 0,
            }} />
            LIVE
        </span>
    );
}

/* ─── Main Component ─────────────────────────────────────────────── */
export default function HumidityReport() {
    const [logs, setLogs] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [selectedRouteId, setSelectedRouteId] = useState("");
    const [loading, setLoading] = useState(true);
    const [modalLogs, setModalLogs] = useState(null);
    const [modalTitle, setModalTitle] = useState("");

    // Live clock — ticks every second
    const nowMs = useTick(1000);

    // ── Routes polling (every 10 s) ──────────────────────────────────
    useEffect(() => {
        let mounted = true;
        const fetchRoutes = async () => {
            try {
                const [routesRes, currentRes] = await Promise.all([
                    fetch(ROUTES_API_URL),
                    fetch(CURRENT_ROUTE_API_URL),
                ]);
                const routesData = await routesRes.json();
                const currentData = await currentRes.json();
                if (!mounted) return;
                const allRoutes = Array.isArray(routesData)
                    ? routesData.sort((a, b) => new Date(b.start_time || b.createdAt) - new Date(a.start_time || a.createdAt))
                    : [];
                setRoutes(allRoutes);
                if (currentData?.route_id) {
                    setSelectedRouteId((prev) => prev || currentData.route_id);
                } else if (allRoutes.length > 0) {
                    setSelectedRouteId((prev) => prev || allRoutes[0].route_id);
                }
            } catch (error) {
                console.error("Failed to fetch routes:", error);
            }
        };
        fetchRoutes();
        const interval = setInterval(fetchRoutes, 10000);
        return () => { mounted = false; clearInterval(interval); };
    }, []);

    const selectedRoute = useMemo(
        () => routes.find((r) => r.route_id === selectedRouteId) || null,
        [routes, selectedRouteId]
    );

    const routeAnchorTs = useMemo(() => {
        return selectedRoute?.start_time
            ? new Date(selectedRoute.start_time).getTime()
            : 0;
    }, [selectedRoute]);

    const isActive = !selectedRoute || selectedRoute?.status?.toLowerCase() === "active";

    // ── Humidity log polling ─────────────────────────────────────────
    const initialFetchDone = useRef(false);

    useEffect(() => {
        let mounted = true;
        initialFetchDone.current = false;

        const fetchLogs = async (isBackground = false) => {
            try {
                if (!selectedRouteId) { setLogs([]); setLoading(false); return; }
                if (!isBackground) setLoading(true);

                const res = await fetch(`${HUMIDITY_API_URL}?route_id=${encodeURIComponent(selectedRouteId)}`);
                const data = await res.json();
                if (!mounted) return;

                const clean = Array.isArray(data)
                    ? data
                        .filter((item) => item.hum !== null && item.hum !== undefined)
                        .sort((a, b) => new Date(a.timestamp || a.createdAt) - new Date(b.timestamp || b.createdAt))
                    : [];
                setLogs(clean);
            } catch (error) {
                console.error("Failed to fetch humidity logs:", error);
            } finally {
                if (mounted) {
                    setLoading(false);
                    initialFetchDone.current = true;
                }
            }
        };

        fetchLogs(false);
        const interval = setInterval(() => { if (mounted) fetchLogs(true); }, 10000);
        return () => { mounted = false; clearInterval(interval); };
    }, [selectedRouteId, selectedRoute?.status]);

    const chartData = useMemo(
        () => aggregateLogs(logs, routeAnchorTs),
        [logs, routeAnchorTs]
    );

    // X-axis domain pinned to route start/end times
    const xDomain = useMemo(() => {
        if (!selectedRoute?.start_time) {
            if (chartData.length > 0) {
                return [chartData[0].timeValue, chartData[chartData.length - 1].timeValue];
            }
            return ["dataMin", "dataMax"];
        }
        const startMs = new Date(selectedRoute.start_time).getTime();
        let endMs;
        if (isActive) {
            endMs = nowMs;
        } else if (selectedRoute.end_time) {
            endMs = new Date(selectedRoute.end_time).getTime();
        } else {
            endMs = chartData.length > 0
                ? chartData[chartData.length - 1].timeValue
                : startMs + 60000;
        }
        return [startMs, endMs];
    }, [selectedRoute, isActive, nowMs, chartData]);

    // Time above limit (high humidity > SAFE_MAX)
    const timeAboveLimitMs = useMemo(() => {
        if (logs.length === 0) return 0;

        if (!isActive) {
            return calculateTimeAboveLimitMs(logs, SAFE_MAX);
        }

        const baseMs = calculateTimeAboveLimitMs(logs, SAFE_MAX);
        const lastLog = logs[logs.length - 1];
        const lastVal = Number(lastLog.hum);
        let tailMs = 0;
        if (lastVal > SAFE_MAX) {
            const lastLogTime = new Date(lastLog.timestamp || lastLog.createdAt).getTime();
            tailMs = Math.max(0, nowMs - lastLogTime);
        }
        return baseMs + tailMs;
    }, [logs, isActive, nowMs]);

    const timeAboveLimitMinutes = Math.floor(timeAboveLimitMs / 60000);

    // Y-axis range — humidity 0–100%
    const yMin = 0;

    const yMax = 100;

    const yTicks = useMemo(() => {
        const base = [];
        for (let v = Math.ceil(yMin / 10) * 10; v <= yMax; v += 10) base.push(v);
        const filtered = base.filter(
            (v) => (Math.abs(v - SAFE_MIN) > 5 || v === SAFE_MIN) && (Math.abs(v - SAFE_MAX) > 5 || v === SAFE_MAX)
        );
        const set = new Set([...filtered, SAFE_MIN, SAFE_MAX]);
        return Array.from(set).sort((a, b) => a - b);
    }, [yMin, yMax]);

    const openFullLogsModal = () => {
        setModalLogs(groupLogsForModalByMinute(logs, routeAnchorTs));
        setModalTitle(selectedRoute ? `${selectedRoute.route_id} — Full trip` : "");
    };

    return (
        <>
            {modalLogs && <LogModal logs={modalLogs} title={modalTitle} onClose={() => setModalLogs(null)} />}

            <div style={styles.wrapper}>
                {/* Header Row */}
                <div style={styles.headerRow}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <h2 style={styles.title}>Humidity Trend</h2>
                            {isActive && selectedRouteId && <LiveBadge />}
                            {logs.length > 0 && (
                                <button
                                    onClick={openFullLogsModal}
                                    style={styles.viewLogsBtn}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = "#2563eb"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#2563eb"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.color = "#2563eb"; e.currentTarget.style.borderColor = "#bfdbfe"; }}
                                >
                                    <ClipboardList size={12} />
                                    View Logs
                                </button>
                            )}
                        </div>
                        <div style={styles.routeText}>
                            {selectedRoute ? selectedRoute.route_id : "No route selected"}
                        </div>
                    </div>

                    {/* Time Above Limit card */}
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "stretch", flexShrink: 0 }}>
                        <div style={styles.timeAboveCard}>
                            <div style={styles.timeAboveHeader}>
                                <AlertTriangle size={11} color="#e11d48" style={{ marginRight: 4 }} />
                                <span style={styles.cardLabelRed}>Time Above Safe Zone</span>
                            </div>
                            <div style={styles.timeAboveValue}>
                                {formatMinutesToHoursMins(timeAboveLimitMinutes)}
                            </div>
                            {selectedRoute && !isActive && selectedRoute.start_time && selectedRoute.end_time && (
                                <div style={styles.cardSubLabelRed}>
                                    {(() => {
                                        const routeTotalMs = new Date(selectedRoute.end_time).getTime() - new Date(selectedRoute.start_time).getTime();
                                        if (routeTotalMs <= 0) return null;
                                        const pct = Math.round((timeAboveLimitMs / routeTotalMs) * 100);
                                        return `${pct}% of trip`;
                                    })()}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Route Selector */}
                <div style={styles.topControlsRow}>
                    <select
                        value={selectedRouteId}
                        onChange={(e) => setSelectedRouteId(e.target.value)}
                        style={styles.select}
                    >
                        <option value="">Select Route</option>
                        {routes.map((route) => (
                            <option key={route.route_id} value={route.route_id}>
                                {formatRouteLabel(route)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Chart */}
                <div style={styles.chartWrap}>
                    {loading ? (
                        <div style={styles.stateText}>Loading chart...</div>
                    ) : !selectedRouteId ? (
                        <div style={styles.stateText}>Select a route to view humidity data.</div>
                    ) : chartData.length === 0 ? (
                        <div style={styles.stateText}>No humidity logs found for this route.</div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 6, right: 8, left: 0, bottom: 4 }}>
                                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                                {/* Low humidity zone */}
                                <ReferenceArea y1={yMin} y2={SAFE_MIN} fill="#fecaca" fillOpacity={0.55} />
                                {/* Safe humidity zone */}
                                <ReferenceArea y1={SAFE_MIN} y2={SAFE_MAX} fill="#bbf7d0" fillOpacity={0.75} />
                                {/* High humidity zone */}
                                <ReferenceArea y1={SAFE_MAX} y2={yMax} fill="#c7d2fe" fillOpacity={0.8} />
                                <ReferenceLine y={SAFE_MIN} stroke="#16a34a" strokeDasharray="6 3" strokeWidth={1.5} />
                                <ReferenceLine y={SAFE_MAX} stroke="#16a34a" strokeDasharray="6 3" strokeWidth={1.5} />
                                <XAxis
                                    dataKey="timeValue"
                                    type="number"
                                    scale="time"
                                    domain={xDomain}
                                    tickFormatter={(value) => formatTime(value)}
                                    tick={{ fontSize: 10, fill: "#64748b", fontFamily: "Poppins, sans-serif" }}
                                    axisLine={false}
                                    tickLine={false}
                                    minTickGap={30}
                                    label={{ value: "Time", position: "insideBottom", offset: -2, fontSize: 10, fill: "#94a3b8", fontFamily: "Poppins, sans-serif" }}
                                />
                                <YAxis
                                    domain={[yMin, yMax]}
                                    ticks={yTicks}
                                    tick={<CustomYTick />}
                                    axisLine={false}
                                    tickLine={false}
                                    width={60}
                                    minTickGap={0}
                                    interval={0}
                                    label={{ value: "Relative Humidity (%)", angle: -90, position: "insideLeft", offset: 12, fontSize: 10, fill: "#94a3b8", fontFamily: "Poppins, sans-serif", dy: 60 }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Line
                                    type="monotone"
                                    dataKey="avg"
                                    stroke="#2563eb"
                                    strokeWidth={2.5}
                                    dot={{ r: 2, fill: "#2563eb", strokeWidth: 0 }}
                                    activeDot={{ r: 3.5 }}
                                    isAnimationActive={false}
                                    name="Average"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="breachPoint"
                                    stroke="transparent"
                                    dot={{ r: 3.5, fill: "#ef4444", stroke: "#ffffff", strokeWidth: 1.5 }}
                                    activeDot={{ r: 4.5, fill: "#dc2626" }}
                                    isAnimationActive={false}
                                    connectNulls={false}
                                    name="Breach"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Legend */}
                <div style={styles.legendRow}>
                    {[
                        { bg: "#bbf7d0", border: "#86efac", label: "Safe (30–60%)" },
                        { bg: "#fecaca", border: "#fca5a5", label: "Low Humidity" },
                        { bg: "#c7d2fe", border: "#a5b4fc", label: "High Humidity" },
                    ].map(({ bg, border, label }) => (
                        <div key={label} style={styles.legendItem}>
                            <span style={{ ...styles.legendBox, background: bg, border: `1px solid ${border}` }} />
                            <span>{label}</span>
                        </div>
                    ))}
                    <div style={styles.legendItem}>
                        <span style={{ ...styles.legendLine, borderColor: "#2563eb" }} />
                        <span>Avg</span>
                    </div>
                    <div style={styles.legendItem}>
                        <span style={styles.legendDot} />
                        <span>Critical</span>
                    </div>
                </div>
            </div>
        </>
    );
}

const styles = {
    wrapper: {
        width: "100%", height: "100%", display: "flex", flexDirection: "column",
        fontFamily: "'Poppins', sans-serif", padding: "2px 0",
        boxSizing: "border-box", overflow: "hidden",
    },
    headerRow: {
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        gap: "8px", marginBottom: "8px", flexWrap: "wrap",
    },
    title: {
        margin: 0, fontSize: "1rem", fontWeight: 700, color: "#1e293b",
        letterSpacing: "-0.01em", whiteSpace: "nowrap",
    },
    routeText: {
        marginTop: "2px", fontSize: "0.72rem", color: "#64748b", fontWeight: 500,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "200px",
    },
    viewLogsBtn: {
        display: "inline-flex", alignItems: "center", gap: "4px",
        padding: "3px 9px", border: "1.5px solid #bfdbfe", background: "#f8fafc",
        color: "#2563eb", borderRadius: "7px", fontSize: "0.7rem", fontWeight: 700,
        cursor: "pointer", fontFamily: "'Poppins', sans-serif",
        transition: "all 0.15s ease", whiteSpace: "nowrap",
    },
    timeAboveCard: {
        background: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)",
        border: "1.5px solid #fda4af", borderRadius: "12px", padding: "8px 13px",
        minWidth: "120px", boxShadow: "0 2px 10px rgba(239,68,68,0.08)",
    },
    timeAboveHeader: { display: "flex", alignItems: "center", marginBottom: "2px" },
    cardLabelRed: {
        fontSize: "0.65rem", fontWeight: 700, color: "#be123c",
        textTransform: "uppercase", letterSpacing: "0.05em",
    },
    cardSubLabelRed: {
        fontSize: "0.62rem", fontWeight: 600, color: "#e11d48", marginTop: "2px",
    },
    timeAboveValue: {
        fontSize: "1.25rem", fontWeight: 800, color: "#111827", lineHeight: 1.1,
        fontVariantNumeric: "tabular-nums",
    },
    topControlsRow: {
        display: "flex", justifyContent: "space-between", alignItems: "center",
        gap: "8px", flexWrap: "wrap", marginBottom: "8px",
    },
    select: {
        border: "1px solid #dbe3ef", background: "#f8fafc", color: "#334155",
        borderRadius: "9px", padding: "6px 10px", fontSize: "0.75rem", fontWeight: 500,
        minWidth: "200px", maxWidth: "100%", fontFamily: "'Poppins', sans-serif",
        outline: "none", cursor: "pointer", flex: 1,
    },
    chartWrap: { width: "100%", flex: 1, minHeight: 0, height: "320px", marginTop: "2px" },
    stateText: {
        height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
        color: "#94a3b8", fontSize: "0.82rem", textAlign: "center", padding: "0 12px",
    },
    legendRow: {
        marginTop: "7px", display: "flex", flexWrap: "wrap",
        gap: "8px 12px", alignItems: "center", flexShrink: 0,
    },
    legendItem: {
        display: "flex", alignItems: "center", gap: "5px",
        fontSize: "0.67rem", color: "#64748b", fontWeight: 500,
    },
    legendBox: { width: "12px", height: "9px", borderRadius: "2px", display: "inline-block", flexShrink: 0 },
    legendLine: { width: "16px", borderTop: "2.5px solid", display: "inline-block", flexShrink: 0 },
    legendDot: {
        width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444",
        border: "1.5px solid #fff", boxShadow: "0 0 0 1px #ef4444",
        display: "inline-block", flexShrink: 0,
    },
};