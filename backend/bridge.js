require('dotenv').config();
const mqtt = require('mqtt');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const AccessLog = require('./mongodb/security'); 
const securityRoutes = require('./routes/security'); 
const authRoutes = require('./routes/authRoutes');
const MotionLog = require('./mongodb/motion');
const motionRoutes = require('./routes/motion');

const app = express();
const server = http.createServer(app); // Create the HTTP server
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

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

io.on("connection", (socket) => {
  console.log(`New Web Client Connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log("Client Disconnected");
  });
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
let sessionTotalEnergy = 0;
client.on('message', async (topic, message) => {
    const data = JSON.parse(message.toString());
    
    // If you add a new sensor, you just check the topic here!
    if (topic === 'sensor/security') {
        const newLog = new AccessLog(data);
        await newLog.save();
        console.log(" RFID Log Saved");
    }
    else if (topic === 'sensor/motion') {
            sessionTotalEnergy += data.net_g || 0;

            const motionData = {
                    ...data,
                    cumulative_energy: sessionTotalEnergy,
                    time: new Date() // Ensure we have a timestamp
                };
                
            const newMotionLog = new MotionLog(data); 
            await newMotionLog.save();
            io.emit('vibrationData', motionData);

            console.log(`Vibration Saved & Emitted (Total Stress: ${sessionTotalEnergy.toFixed(2)})`);
        }
});

app.listen(5000, () => console.log(" Server on port 5000"));