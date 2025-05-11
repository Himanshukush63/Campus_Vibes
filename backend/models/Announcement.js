const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    file: { type: String }, // Stores file path
  },
  { timestamps: true }
);

module.exports = mongoose.model("Announcement", AnnouncementSchema);