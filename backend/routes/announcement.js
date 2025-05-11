const express = require("express");
const multer = require("multer");
const Announcement = require("../models/Announcement");
const upload = require("../config/multer");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create Announcement (Faculty Only)
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { title, description } = req.body;
    const file = req.file ? req.file.filename : null;

    const newAnnouncement = new Announcement({ title, description, file });

    await newAnnouncement.save();
    res.status(201).json({ message: "Announcement posted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error posting announcement" });
  }
});

// Get All Announcements
router.get("/", async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: "Error fetching announcements" });
  }
});

// Delete Announcement (Faculty Only)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: "Announcement deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting announcement" });
  }
});

module.exports = router;