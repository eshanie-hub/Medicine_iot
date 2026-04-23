const { GoogleGenerativeAI } = require("@google/generative-ai");
const AccessLog = require('../mongodb/security');
const MotionLog = require('../mongodb/motion');
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
        if (anomaly) query.anomaly = anomaly; // Handle the anomaly field from your screenshot
        if (receivedAt) query.receivedAt = new Date(receivedAt); // Convert string back to Date object
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

        const total  = logs.length;
        const latest = logs[0];
        const counts = { stable: 0, moderate: 0, high: 0, critical: 0 };

        logs.forEach(l => {
            if (l.ml_class === 'Stable')             counts.stable++;
            if (l.ml_class === 'Moderate Vibration') counts.moderate++;
            if (l.ml_class === 'High Vibration')     counts.high++;
            if (l.ml_class === 'Critical Shock')     counts.critical++;
        });

        const verdict = counts.critical > 0 || (latest.rolling_risk >= 70)
            ? 'Compromised'
            : counts.high > 2 || (latest.rolling_risk >= 40)
            ? 'Use with Caution'
            : 'Safe';

        return {
            current_ml_class:     latest.ml_class,
            current_ml_conf:      latest.ml_conf,
            current_risk_score:   latest.risk_score,
            current_rolling_risk: latest.rolling_risk,
            medicine_verdict:     verdict,
            total_readings:       total,
            stable_pct:           Math.round((counts.stable   / total) * 100),
            moderate_count:       counts.moderate,
            high_count:           counts.high,
            critical_count:       counts.critical,
            worst_event:          counts.critical > 0 ? 'Critical Shock'
                                : counts.high     > 0 ? 'High Vibration'
                                : counts.moderate > 0 ? 'Moderate Vibration'
                                : 'Stable'
        };
    }
};

exports.handleChat = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const { message } = req.body;
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-lite",
            systemInstruction: `You are the MediPORT Assistant. Use the following project specifications to answer user queries accurately.
            
            PROJECT CONTEXT:
            ${JSON.stringify(dataDictionary, null, 2)}
            Current Date: ${today}.
            
            RULES:
            - To find the "Current Security State," call 'getSecurityLogs' with limit: 1. The 'status' of that log is the current state.
            - "Unauthorized Access", "Unusual Hours" and "Normal" are considered security anomalies.
            - If a user asks "What is the current lock state?", fetch the latest log and report its status (e.g., "Locked", "Unlocked", or "Denied").
            - Always call the right tool before answering.
            - Logs table questions (history, g-force, date, past readings) → getMotionLogs
            - Current / latest / recent status → getCurrentStatus
            - Risk chart, gauge, medicine condition, AI class, verdict → getRiskChart
            - Security / RFID / access → getSecurityLogs
            - Risk levels: 0-29% Low, 30-69% Moderate, 70-100% High
            - If critical shock found, always recommend immediate inspection.`
        });

        // Initialize chat with function tool definitions
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
                        description: "Fetch motion logs table data. Use for history, past readings, g-force values, date filtering.",
                        parameters: {
                            type: "OBJECT",
                            properties: {
                                status: { type: "string", enum: ["Stable", "Moderate Vibration", "High Vibration", "Critical Shock"] },
                                date:   { type: "string", description: "Date in YYYY-MM-DD format" },
                                limit:  { type: "number" }
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
                    }
                ]
            }]
        });


        const result = await chat.sendMessage(message);
        const response = result.response;
        const call = response.functionCalls()?.[0];

        if (call) {
            // Execute the MongoDB query
            const toolData = await functions[call.name](call.args);

            // Send tool result back to Gemini for final interpretation
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