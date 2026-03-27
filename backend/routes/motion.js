const express = require('express');
const router = express.Router();
const MotionLog = require('../mongodb/motion');


router.get('/latest', async (req, res) => {
    try {
        const latestLog = await MotionLog.findOne().sort({ time: -1 });
        if (!latestLog) {
            return res.status(404).json({ message: "No sensor data found" });
        }
        res.json(latestLog);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.get('/', async (req, res) => {
    try {
        
        const logs = await MotionLog.find().sort({ time: -1 }).limit(50);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

