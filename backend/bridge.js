require("dotenv").config();
const mqtt = require("mqtt");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const AccessLog = require("./mongodb/security");
const securityRoutes = require("./routes/security");
const authRoutes = require("./routes/authRoutes");
const MotionLog = require("./mongodb/motion");
const motionRoutes = require("./routes/motion");
const RouteSession = require("./mongodb/routeSession");

const TemperatureLog = require("./mongodb/temperature");
const HumidityLog = require("./mongodb/humidity");
const temperatureRoutes = require("./routes/temperature");
const humidityRoutes = require("./routes/humidity");
const routeSessionRoutes = require("./routes/routeSession");
const chatRoutes = require('./routes/chat');

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
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("mongoDB Connection Error:", err));

// API Routes
app.use("/api/security", securityRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/motion", motionRoutes);
app.use("/api/temperature", temperatureRoutes);
app.use("/api/humidity", humidityRoutes);
app.use("/api/route", routeSessionRoutes);
app.use('/api/chat', chatRoutes);

// HiveMQ MQTT Connection 
const client = mqtt.connect(process.env.MQTT_URL, {
  username: process.env.MQTT_USER,
  password: process.env.MQTT_PASS,
});

// WebSocket Connection Handler
io.on("connection", (socket) => {
  console.log(`New Web Client Connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log("Client Disconnected");
  });
});

client.on("connect", () => {
  console.log("Connected to HiveMQ Cloud");

  client.subscribe("sensor/security", (err) => {
    if (!err) console.log("Subscribed to 'sensor/security'");
  });

  client.subscribe("sensor/motion", (err) => {
    if (!err) console.log("Subscribed to 'sensor/motion'");
  });

  client.subscribe("sensor/temperature", (err) => {
    if (!err) console.log("Subscribed to 'sensor/temperature'");
  });

  client.subscribe("sensor/humidity", (err) => {
    if (!err) console.log("Subscribed to 'sensor/humidity'");
  });
});

client.on("message", async (topic, message) => {
  try {
    const data = JSON.parse(message.toString());

    // If you add a new sensor, you just check the topic here!
    if (topic === "sensor/security") {
      const newLog = new AccessLog(data);
      await newLog.save();
      console.log("RFID Log Saved");

      // webSocket
      io.emit("lockUpdate", {
        status: data.status,
        timestamp: new Date().toISOString(),
        card_id: data.card_id,
      });
    } 
    
    else if (topic === "sensor/motion") {
      const newMotionLog = new MotionLog(data);
      await newMotionLog.save();
      console.log("Vibration Data Saved");
    } 
    
    else if (topic === "sensor/temperature") {
      const activeRoute = await RouteSession.findOne({ status: "ACTIVE" }).sort({
        createdAt: -1,
      });

      const newTempLog = new TemperatureLog({
        ...data,
        route_id: activeRoute ? activeRoute.route_id : null,
      });

      await newTempLog.save();
      

      io.emit("temperatureUpdate", {
        ...data,
        route_id: activeRoute ? activeRoute.route_id : null,
      });
    } 
    
    else if (topic === "sensor/humidity") {
      const activeRoute = await RouteSession.findOne({ status: "ACTIVE" }).sort({
        createdAt: -1,
      });

      const newHumidityLog = new HumidityLog({
        ...data,
        route_id: activeRoute ? activeRoute.route_id : null,
      });

      await newHumidityLog.save();
     

      io.emit("humidityUpdate", {
        ...data,
        route_id: activeRoute ? activeRoute.route_id : null,
      });
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

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));