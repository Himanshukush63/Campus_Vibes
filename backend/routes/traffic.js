// routes/traffic.js
const express = require("express");
const Traffic = require("../models/Traffic");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Record a visit
router.post("/record-visit", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day

    // Find or create today's traffic record
    let traffic = await Traffic.findOne({ date: today });
    if (!traffic) {
      traffic = new Traffic({ date: today });
    }

    traffic.visits += 1;
    await traffic.save();

    res.status(200).json({ message: "Visit recorded", traffic });
  } catch (error) {
    res.status(500).json({ message: "Error recording visit", error: error.message });
  }
});

// Get traffic data for the last 30 days
router.get("/traffic-data", async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const trafficData = await Traffic.find({ date: { $gte: thirtyDaysAgo } }).sort({ date: 1 });

    res.status(200).json(trafficData);
  } catch (error) {
    res.status(500).json({ message: "Error fetching traffic data", error: error.message });
  }
});

module.exports = router;