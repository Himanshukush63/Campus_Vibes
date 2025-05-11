// models/Traffic.js
const mongoose = require("mongoose");

const trafficSchema = new mongoose.Schema({
  date: { type: Date, required: true, default: Date.now },
  visits: { type: Number, required: true, default: 0 },
});

module.exports = mongoose.model("Traffic", trafficSchema);
