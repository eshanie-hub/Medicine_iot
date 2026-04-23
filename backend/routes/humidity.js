const express = require("express");
const router = express.Router();
const HumidityLog = require("../mongodb/humidity");

// Get all humidity logs
router.get("/", async (req, res) => {
  try {
    const { route_id } = req.query;

    const filter = {};
    if (route_id) {
      filter.route_id = route_id;
    }

    const logs = await HumidityLog.find(filter).sort({ createdAt: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch humidity logs",
      error: error.message,
    });
  }
});

// Get latest humidity log
router.get("/latest", async (req, res) => {
  try {
    const { route_id } = req.query;

    const filter = {};
    if (route_id) {
      filter.route_id = route_id;
    }

    const latestLog = await HumidityLog.findOne(filter).sort({ createdAt: -1 });
    res.json(latestLog);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch latest humidity log",
      error: error.message,
    });
  }
});

// GET /api/humidity/battery?limit=50
router.get('/battery', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const logs = await HumidityLog.find(
      {},  // ← no filter, fetch all
      { batt_v: 1, batt_pct: 1, timestamp: 1, createdAt: 1, box_id: 1 }
    )
    .sort({ createdAt: -1 })
    .limit(limit);

    res.json(logs.reverse());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;