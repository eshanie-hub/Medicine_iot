require('dotenv').config();
const mqtt = require('mqtt');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const AccessLog = require('./mongodb/security'); 
const securityRoutes = require('./routes/security'); 
const authRoutes = require('./routes/authRoutes');
const MotionLog = require('./mongodb/motion');
const motionRoutes = require('./routes/motion');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch(err => console.error("mongoDB Connection Error:", err));

// API Routes
app.use('/api/security', securityRoutes);
app.use('/api/auth', authRoutes)
app.use('/api/motion',motionRoutes)

// HiveMQ MQTT Connection 
const client = mqtt.connect(process.env.MQTT_URL, {
    username: process.env.MQTT_USER,
    password: process.env.MQTT_PASS
});

client.on('connect', () => {
    console.log("Connected to HiveMQ Cloud");
    client.subscribe('sensor/security', (err) => {
        if (!err) console.log("Subscribed to 'sensor/security'");
    });
    client.subscribe('sensor/motion', (err) => {
        if (!err) console.log("Subscribed to 'sensor/motion'");
    });
});

client.on('message', async (topic, message) => {
    const data = JSON.parse(message.toString());
    
    // If you add a new sensor, you just check the topic here!
    if (topic === 'sensor/security') {
        const newLog = new AccessLog(data);
        await newLog.save();
        console.log(" RFID Log Saved");
    }
    else if (topic === 'sensor/motion') {
            
            const newMotionLog = new MotionLog(data); 
            await newMotionLog.save();
            console.log(" Vibration Data Saved");
        }
});

app.listen(5000, () => console.log(" Server on port 5000"));