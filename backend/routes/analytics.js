const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const UserActivity = require("../models/UserActivity");

// Get user activity data
router.get("/user-activity", authMiddleware, async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const activityData = await UserActivity.find({
      date: { $gte: sixMonthsAgo }
    }).sort({ date: 1 });

    // Calculate averages
    const totalActive = activityData.reduce((acc, curr) => acc + curr.activeUsers, 0);
    const averageActive = Math.round(totalActive / activityData.length) || 0;

    res.json({
      activityData,
      currentActive: activityData[activityData.length - 1]?.activeUsers || 0,
      previousActive: activityData[activityData.length - 2]?.activeUsers || 0,
      averageActive
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching activity data", error: error.message });
  }
});

module.exports = router;