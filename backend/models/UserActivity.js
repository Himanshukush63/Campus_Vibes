// models/UserActivity.js
const mongoose = require("mongoose");

const userActivitySchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true },
  activeUsers: { type: Number, required: true, default: 0 },
  returningUsers: { type: Number, required: true, default: 0 }
});

module.exports = mongoose.model("UserActivity", userActivitySchema);