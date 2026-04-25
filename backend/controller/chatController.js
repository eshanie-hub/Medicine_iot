const { GoogleGenerativeAI } = require("@google/generative-ai");
const AccessLog = require('../mongodb/security');
const MotionLog = require('../mongodb/motion');
const TemperatureLog = require("../mongodb/temperature");
const HumidityLog = require("../mongodb/humidity");
const fs = require('fs');
const path = require('path');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 1. Load and Parse the JSON Data Dictionary
let dataDictionary = {};
try {
    const rawData = fs.readFileSync(path.join(__dirname, '../resources/data_dictionary.json'), 'utf-8');
    dataDictionary = JSON.parse(rawData);
} catch (e) {
    console.error("Error loading data dictionary JSON:", e.message);
}

const functions = {
    getSecurityLogs: async ({ status, card_id, anomaly, receivedAt, limit = 200 }) => {
        const query = {};
        if (status) query.status = status;
        if (card_id) query.card_id = card_id;
        if (anomaly) query.anomaly = anomaly;
        if (receivedAt) query.receivedAt = new Date(receivedAt);
        return await AccessLog.find(query).sort({ receivedAt: -1 }).limit(limit);
    },

    getMotionLogs: async ({ status, date, limit = 50 }) => {
        const query = {};
        if (status) query.status = status;
        if (date) {
            const start = new Date(date);
            const end = new Date(date);
            end.setDate(end.getDate() + 1);
            query.time = { $gte: start.toISOString(), $lt: end.toISOString() };
        }
        return await MotionLog.find(query).sort({ time: -1 }).limit(limit);
    },

    getCurrentStatus: async () => {
        return await MotionLog.findOne({}).sort({ time: -1 });
    },

    getRiskChart: async () => {
        const logs = await MotionLog.find({}).sort({ time: -1 }).limit(200);
        if (!logs.length) return { error: "No data" };

        const total = logs.length;
        const latest = logs[0];
        const counts = { stable: 0, moderate: 0, high: 0, critical: 0 };

        logs.forEach(l => {
            if (l.ml_class === 'Stable') counts.stable++;
            if (l.ml_class === 'Moderate Vibration') counts.moderate++;
            if (l.ml_class === 'High Vibration') counts.high++;
            if (l.ml_class === 'Critical Shock') counts.critical++;
        });

        const verdict = counts.critical > 0 || (latest.rolling_risk >= 70)
            ? 'Compromised'
            : counts.high > 2 || (latest.rolling_risk >= 40)
                ? 'Use with Caution'
                : 'Safe';

        return {
            current_ml_class: latest.ml_class,
            current_ml_conf: latest.ml_conf,
            current_risk_score: latest.risk_score,
            current_rolling_risk: latest.rolling_risk,
            medicine_verdict: verdict,
            total_readings: total,
            stable_pct: Math.round((counts.stable / total) * 100),
            moderate_count: counts.moderate,
            high_count: counts.high,
            critical_count: counts.critical,
            worst_event: counts.critical > 0 ? 'Critical Shock'
                : counts.high > 0 ? 'High Vibration'
                    : counts.moderate > 0 ? 'Moderate Vibration'
                        : 'Stable'
        };
    },

    // =========================
    // TEMPERATURE TOOLS
    // =========================
    getTemperatureLogs: async ({
        route_id,
        temp_status,
        fan,
        alert,
        threshold_breach,
        date,
        limit = 100,
    }) => {
        const query = {};

        if (route_id) query.route_id = route_id;
        if (temp_status) query.temp_status = temp_status;
        if (fan) query.fan = fan;
        if (typeof alert === "boolean") query.alert = alert;
        if (typeof threshold_breach === "boolean") query.threshold_breach = threshold_breach;

        if (date) {
            const start = new Date(`${date}T00:00:00.000Z`);
            const end = new Date(`${date}T23:59:59.999Z`);

            query.timestamp = {
                $gte: start.toISOString(),
                $lte: end.toISOString(),
            };
        }

        return await TemperatureLog.find(query).sort({ createdAt: -1 }).limit(limit);
    },

    getCurrentTemperature: async ({ route_id }) => {
        const query = {};
        if (route_id) query.route_id = route_id;

        return await TemperatureLog.findOne(query).sort({ createdAt: -1 });
    },

    getTemperatureSummary: async ({ route_id, date }) => {
        const query = {};

        if (route_id) query.route_id = route_id;

        if (date) {
            const start = new Date(`${date}T00:00:00.000Z`);
            const end = new Date(`${date}T23:59:59.999Z`);

            query.timestamp = {
                $gte: start.toISOString(),
                $lte: end.toISOString(),
            };
        }

        const logs = await TemperatureLog.find(query)
            .sort({ createdAt: -1 })
            .limit(300);

        if (!logs.length) return { error: "No temperature data" };

        const latest = logs[0];

        let high = 0, low = 0, normal = 0, error = 0;
        let alertCount = 0;
        let breachCount = 0;
        let fanOnCount = 0;

        let minTemp = Infinity;
        let maxTemp = -Infinity;
        let sumTemp = 0;
        let validCount = 0;

        logs.forEach(l => {
            const t = Number(l.temp);

            if (l.temp_status === "HIGH") high++;
            else if (l.temp_status === "LOW") low++;
            else if (l.temp_status === "NORMAL") normal++;
            else if (l.temp_status === "T-ERR") error++;

            if (l.alert) alertCount++;
            if (l.threshold_breach) breachCount++;
            if (l.fan === "ON") fanOnCount++;

            if (!isNaN(t)) {
                minTemp = Math.min(minTemp, t);
                maxTemp = Math.max(maxTemp, t);
                sumTemp += t;
                validCount++;
            }
        });

        const avgTemp = validCount ? Number((sumTemp / validCount).toFixed(2)) : null;

        let verdict = "Safe";
        if (high > 0 || low > 0 || breachCount > 0) verdict = "Attention Needed";
        if (error > 0) verdict = "Sensor Issue";

        return {
            latest_temp: latest.temp,
            latest_status: latest.temp_status,
            latest_timestamp: latest.timestamp,
            latest_ml_class: latest.ml_class,
            latest_ml_conf: latest.ml_conf,
            fan: latest.fan,

            total: logs.length,
            normal_count: normal,
            low_count: low,
            high_count: high,
            error_count: error,
            alert_count: alertCount,
            threshold_breach_count: breachCount,
            fan_on_count: fanOnCount,

            min_temp: validCount ? minTemp : null,
            max_temp: validCount ? maxTemp : null,
            avg_temp: avgTemp,

            safe_min: 2,
            safe_max: 8,

            verdict
        };
    },

    getTemperatureAnomalies: async ({ route_id, date, limit = 50 }) => {
        const query = {
            $or: [
                { temp_status: { $in: ["LOW", "HIGH", "T-ERR", "CRITICAL"] } },
                { threshold_breach: true },
                { alert: true }
            ]
        };

        if (route_id) query.route_id = route_id;

        if (date) {
            const start = new Date(`${date}T00:00:00.000Z`);
            const end = new Date(`${date}T23:59:59.999Z`);

            query.timestamp = {
                $gte: start.toISOString(),
                $lte: end.toISOString(),
            };
        }

        return await TemperatureLog.find(query)
            .sort({ createdAt: -1 })
            .limit(limit);
    },
    // =========================
    // HUMIDITY TOOLS
    // =========================

    getHumidityLogs: async ({
        route_id,
        hum_status,
        fan,
        date,
        limit = 100,
    }) => {
        const query = {};

        if (route_id) query.route_id = route_id;
        if (hum_status) query.hum_status = hum_status;
        if (fan) query.fan = fan;

        if (date) {
            const start = new Date(`${date}T00:00:00.000Z`);
            const end = new Date(`${date}T23:59:59.999Z`);

            query.timestamp = {
                $gte: start.toISOString(),
                $lte: end.toISOString(),
            };
        }

        return await HumidityLog.find(query).sort({ createdAt: -1 }).limit(limit);
    },

    getCurrentHumidity: async ({ route_id }) => {
        const query = {};
        if (route_id) query.route_id = route_id;

        return await HumidityLog.findOne(query).sort({ createdAt: -1 });
    },

    getHumiditySummary: async ({ route_id, date }) => {
        const query = {};

        if (route_id) query.route_id = route_id;

        if (date) {
            const start = new Date(`${date}T00:00:00.000Z`);
            const end = new Date(`${date}T23:59:59.999Z`);

            query.timestamp = {
                $gte: start.toISOString(),
                $lte: end.toISOString(),
            };
        }

        const logs = await HumidityLog.find(query)
            .sort({ createdAt: -1 })
            .limit(300);

        if (!logs.length) return { error: "No humidity data" };

        const latest = logs[0];

        let high = 0, low = 0, normal = 0, critical = 0;

        let minHum = Infinity;
        let maxHum = -Infinity;
        let sumHum = 0;
        let validCount = 0;

        logs.forEach(l => {
            const h = Number(l.hum);

            if (l.hum_status === "HIGH") high++;
            else if (l.hum_status === "LOW") low++;
            else if (l.hum_status === "NORMAL") normal++;
            else if (l.hum_status === "CRITICAL") critical++;

            if (!isNaN(h)) {
                minHum = Math.min(minHum, h);
                maxHum = Math.max(maxHum, h);
                sumHum += h;
                validCount++;
            }
        });

        const avgHum = validCount ? Number((sumHum / validCount).toFixed(2)) : null;

        let verdict = "Safe";
        if (high > 0 || low > 0 || critical > 0) verdict = "Attention Needed";

        return {
            latest_humidity: latest.hum,
            latest_status: latest.hum_status,
            latest_timestamp: latest.timestamp,
            fan: latest.fan,

            total: logs.length,
            normal_count: normal,
            low_count: low,
            high_count: high,
            critical_count: critical,

            min_humidity: validCount ? minHum : null,
            max_humidity: validCount ? maxHum : null,
            avg_humidity: avgHum,

            safe_min: latest.hum_min ?? 30,
            safe_max: latest.hum_max ?? 60,

            verdict
        };
    },

    getHumidityAnomalies: async ({ route_id, date, limit = 50 }) => {
        const query = {
            hum_status: { $in: ["LOW", "HIGH", "CRITICAL", "H-ERR"] }
        };

        if (route_id) query.route_id = route_id;

        if (date) {
            const start = new Date(`${date}T00:00:00.000Z`);
            const end = new Date(`${date}T23:59:59.999Z`);

            query.timestamp = {
                $gte: start.toISOString(),
                $lte: end.toISOString(),
            };
        }

        return await HumidityLog.find(query)
            .sort({ createdAt: -1 })
            .limit(limit);
    },
};

exports.handleChat = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const { message } = req.body;

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: `You are the MediPORT Assistant. Use the following project specifications to answer user queries accurately.

PROJECT CONTEXT:
${JSON.stringify(dataDictionary, null, 2)}
Current Date: ${today}.

GENERAL RULES:
- Always call the right tool before answering live data questions.
- Do not invent values.
- Answer as a dashboard assistant, not just a database bot.
- Keep answers concise, clear, and useful.
- When relevant, explain results in user-friendly language.
- For UI guidance questions, always refer to visible dashboard sections.

SECURITY RULES:
- To find the "Current Security State," call 'getSecurityLogs' with limit: 1. The 'status' of that log is the current state.
- "Unauthorized Access", "Unusual Hours" and "Normal" are considered security anomalies.
- If a user asks "What is the current lock state?", fetch the latest log and report its status (e.g., "Locked", "Unlocked", or "Denied").
- Security / RFID / access → getSecurityLogs

MOTION RULES:
- Logs table questions (history, g-force, date, past readings) → getMotionLogs
- Current / latest / recent status → getCurrentStatus
- Risk chart, gauge, medicine condition, AI class, verdict → getRiskChart
- Risk levels: 0-29% Low, 30-69% Moderate, 70-100% High
- If critical shock found, always recommend immediate inspection.

TEMPERATURE RULES:
- Safe range is 2°C to 8°C.
- NORMAL = safe
- LOW = below 2°C
- HIGH = above 8°C
- CRITICAL = severe unsafe temperature condition
- T-ERR = sensor error
- threshold_breach = safety violation
- alert = critical event
- fan ON = cooling is active
- ml_class and ml_conf are TinyML outputs for temperature condition analysis.

- Current temperature / latest reading → getCurrentTemperature
- Temperature history / logs / route-based questions → getTemperatureLogs
- Temperature trends / summary / comparisons / dashboard explanations → getTemperatureSummary
- Temperature anomalies / out-of-range / alerts / threshold breaches → getTemperatureAnomalies

- When answering temperature trend questions, explain using:
  latest value, latest status, min/max/avg temperature, abnormal counts, breaches, alerts, and fan activity.
- If HIGH, LOW, or CRITICAL → clearly mention cold-chain risk.
- If T-ERR → mention sensor issue.
- If threshold_breach or alert is true → mention that a safety/anomaly event occurred.
- If fan is ON during abnormal temperature, explain that the cooling system is trying to respond.

HUMIDITY RULES:
- Safe humidity range is hum_min to hum_max (default 30%–60%).
- NORMAL = safe
- LOW = below safe range
- HIGH = above safe range
- CRITICAL = severe unsafe humidity condition
- H-ERR = sensor error
- fan ON = system reacting to abnormal condition

- Current humidity → getCurrentHumidity
- Humidity history → getHumidityLogs
- Humidity trends → getHumiditySummary
- Humidity anomalies → getHumidityAnomalies

- When explaining humidity trends:
  include latest value, min/max/avg humidity, abnormal counts, and fan activity.
- If HIGH/LOW/CRITICAL → mention environmental risk to medicine.
- If H-ERR → mention sensor issue.

DASHBOARD GUIDANCE RULES:
- When users ask where to find information, always refer to the UI layout.
- Temperature data can be found in:
  • the "Temperature" card on the left panel (current value, current status, and fan state)
  • the main dashboard area (trend visualization / route-based display)
  • the logs/history section (detailed past readings and anomalies)
- When explaining temperature trends:
  • mention the Temperature card on the left for current status
  • mention the main panel for visual trend understanding
  • mention the logs/history for detailed past readings
- Avoid generic answers like "temperature summary".
- Always map answers to visible dashboard components.
- Use phrases like:
  • "You can find this in..."
  • "Check the ... section on the dashboard"
  • "Look at the ... card / chart"

TOP-LEVEL ANSWER STYLE:
- For dashboard guidance answers, structure the response in 2–3 short sentences:
  1. Where it is in the dashboard
  2. What it shows
  3. How to interpret it
- Match the tone of this example style:
  "The security lock state can be found in the 'Security Alert' card, located in the top-left corner of the dashboard. It indicates the current security state and the last opened time of the medicine box."`
        });

        const chat = model.startChat({
            tools: [{
                functionDeclarations: [
                    {
                        name: "getSecurityLogs",
                        description: "Fetch RFID access logs. Use this for questions about box openings, unauthorized access, or specific dates/times using the receivedAt parameter.",
                        parameters: {
                            type: "OBJECT",
                            properties: {
                                status: { type: "string", enum: ["Unlocked", "Locked", "Denied"] },
                                card_id: { type: "string" },
                                anomaly: { type: "string", enum: ["None", "Unauthorized Access", "Unusual Hours"] },
                                receivedAt: {
                                    type: "string",
                                    description: "Filter by a specific date or timestamp in ISO 8601 format. If the user says 'today', use the current date string."
                                },
                                limit: { type: "number" }
                            }
                        }
                    },
                    {
                        name: "getMotionLogs",
                        description: "Fetch motion logs table data. Use this for questions about vibration status level on specific dates/time using.",
                        parameters: {
                            type: "OBJECT",
                            properties: {
                                status: { type: "string", enum: ["Stable", "Moderate Vibration", "High Vibration", "Critical Shock"] },
                                date: { type: "string", description: "Date in YYYY-MM-DD format" },
                                limit: { type: "number" }
                            }
                        }
                    },
                    {
                        name: "getCurrentStatus",
                        description: "Get the latest single vibration reading. Use for current, recent, or now questions.",
                        parameters: { type: "OBJECT", properties: {} }
                    },
                    {
                        name: "getRiskChart",
                        description: "Get transport risk chart data. Use for gauge, rolling risk, medicine verdict, ml_class, AI confidence, overall trip safety questions.",
                        parameters: { type: "OBJECT", properties: {} }
                    },

                    // =========================
                    // TEMPERATURE TOOLS
                    // =========================
                    {
                        name: "getTemperatureLogs",
                        description: "Fetch temperature history logs",
                        parameters: {
                            type: "OBJECT",
                            properties: {
                                route_id: { type: "string" },
                                temp_status: { type: "string" },
                                fan: { type: "string" },
                                alert: { type: "boolean" },
                                threshold_breach: { type: "boolean" },
                                date: { type: "string", description: "YYYY-MM-DD" },
                                limit: { type: "number" }
                            }
                        }
                    },
                    {
                        name: "getCurrentTemperature",
                        description: "Get latest temperature reading",
                        parameters: {
                            type: "OBJECT",
                            properties: {
                                route_id: { type: "string" }
                            }
                        }
                    },
                    {
                        name: "getTemperatureSummary",
                        description: "Get temperature trend summary",
                        parameters: {
                            type: "OBJECT",
                            properties: {
                                route_id: { type: "string" },
                                date: { type: "string", description: "YYYY-MM-DD" }
                            }
                        }
                    },
                    {
                        name: "getTemperatureAnomalies",
                        description: "Get abnormal temperature events",
                        parameters: {
                            type: "OBJECT",
                            properties: {
                                route_id: { type: "string" },
                                date: { type: "string", description: "YYYY-MM-DD" },
                                limit: { type: "number" }
                            }
                        }
                    },

                    // =========================
                    // HUMIDITY TOOLS
                    // =========================
                    {
                        name: "getHumidityLogs",
                        description: "Fetch humidity logs",
                        parameters: {
                            type: "OBJECT",
                            properties: {
                                route_id: { type: "string" },
                                hum_status: { type: "string" },
                                fan: { type: "string" },
                                date: { type: "string" },
                                limit: { type: "number" }
                            }
                        }
                    },
                    {
                        name: "getCurrentHumidity",
                        description: "Get latest humidity reading",
                        parameters: {
                            type: "OBJECT",
                            properties: {
                                route_id: { type: "string" }
                            }
                        }
                    },
                    {
                        name: "getHumiditySummary",
                        description: "Get humidity trend summary",
                        parameters: {
                            type: "OBJECT",
                            properties: {
                                route_id: { type: "string" },
                                date: { type: "string" }
                            }
                        }
                    },
                    {
                        name: "getHumidityAnomalies",
                        description: "Get abnormal humidity readings",
                        parameters: {
                            type: "OBJECT",
                            properties: {
                                route_id: { type: "string" },
                                date: { type: "string" },
                                limit: { type: "number" }
                            }
                        }
                    }
                ]
            }]
        });

        const result = await chat.sendMessage(message);
        const response = result.response;
        const call = response.functionCalls()?.[0];

        if (call) {
            const toolData = await functions[call.name](call.args);

            const finalResult = await chat.sendMessage([{
                functionResponse: {
                    name: call.name,
                    response: { content: toolData }
                }
            }]);

            return res.json({ reply: finalResult.response.text() });
        }

        res.json({ reply: response.text() });
    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ error: "Failed to process chat request" });
    }
};