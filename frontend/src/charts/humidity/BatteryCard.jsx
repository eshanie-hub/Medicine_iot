import React, { useEffect, useState } from "react";
import axios from "axios";

export default function BatteryCard() {
  const [battery, setBattery] = useState(null);

  useEffect(() => {
    const fetchBattery = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/humidity/battery?limit=1");
        if (res.data.length > 0) {
          setBattery(res.data[0]);
        }
      } catch (err) {
        console.error("Battery fetch error:", err);
      }
    };

    fetchBattery();
    const interval = setInterval(fetchBattery, 5000); // live update

    return () => clearInterval(interval);
  }, []);

  if (!battery) return <div>Loading...</div>;

  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "12px"
    }}>
      <div>
        <div style={{ fontSize: "0.8rem", color: "#64748b" }}>Voltage</div>
        <div style={{ fontSize: "1.2rem", fontWeight: "700" }}>
          {battery.batt_v?.toFixed(2)} V
        </div>
      </div>

      <div>
        <div style={{ fontSize: "0.8rem", color: "#64748b" }}>Battery %</div>
        <div style={{
          fontSize: "1.2rem",
          fontWeight: "700",
          color:
            battery.batt_pct > 50 ? "#22c55e" :
            battery.batt_pct > 20 ? "#f59e0b" : "#ef4444"
        }}>
          {battery.batt_pct}%
        </div>
      </div>
    </div>
  );
}