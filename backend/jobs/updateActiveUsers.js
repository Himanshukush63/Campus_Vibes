// jobs/updateActiveUsers.js
const cron = require("node-cron")
const UserActivity = require("../models/UserActivity")
const User = require("../models/User")

cron.schedule("*/5 * * * *", async () => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    // Count users active in the last 5 minutes
    const activeUsers = await User.countDocuments({
      lastActive: { $gte: fiveMinutesAgo }
    });

    // Store active user count in database
    await UserActivity.create({ date: new Date(), activeUsers });
  } catch (error) {
    console.error("Error updating active users:", error);
  }
});
