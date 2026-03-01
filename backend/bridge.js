require('dotenv').config();
const mqtt = require('mqtt');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const AccessLog = require('./mongodb/security'); 
const securityRoutes = require('./routes/security'); 

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch(err => console.error("mongoDB Connection Error:", err));

// API Routes
app.use('/api/security', securityRoutes);

// HiveMQ MQTT Connection 
const client = mqtt.connect(process.env.MQTT_URL, {
    username: process.env.MQTT_USER,
    password: process.env.MQTT_PASS
});

client.on('connect', () => {
    console.log("Connected to HiveMQ Cloud");
    client.subscribe('test/topic', (err) => {
        if (!err) console.log("Subscribed to 'test/topic'");
    });
});

client.on('message', async (topic, message) => {
    const data = JSON.parse(message.toString());
    
    // If you add a new sensor, you just check the topic here!
    if (topic === 'test/topic') {
        const newLog = new AccessLog(data);
        await newLog.save();
        console.log("💾 RFID Log Saved");
    }
});

app.listen(5000, () => console.log("🚀 Server on port 5000"));