const express = require("express");
const router = express.Router();
const Group = require("../models/Group");
const GroupMessage = require("../models/GroupMessage");
const authMiddleware = require("../middleware/authMiddleware");
const mongoose = require("mongoose");

// Create a new group
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;

    const group = new Group({
      name,
      description,
      createdBy: req.user.id,
      isPublic,
      members: [{ user: req.user.id, role: "admin" }], // Creator is the admin
    });

    await group.save();
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Join a group
router.post("/:groupId/join", authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is already a member
    const isMember = group.members.some(
      (member) => member.user && member.user.equals(req.user.id)
    );
    if (isMember) {
      return res.status(400).json({ message: "Already a member" });
    }

    group.members.push({ user: req.user.id, role: "member" });
    await group.save();

    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get all public groups
router.get("/", authMiddleware, async (req, res) => {
  try {
    const groups = await Group.find({ isPublic: true });
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get joined groups
router.get("/joined", authMiddleware, async (req, res) => {
  try {
    const groups = await Group.find({ "members.user": req.user.id });
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get group messages
router.get("/:groupId/messages", authMiddleware, async (req, res) => {
  try {
    const messages = await GroupMessage.find({ group: req.params.groupId })
      .populate("sender", "fullName image")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Send a message to a group
router.post("/:groupId/messages", authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;

    const newMessage = new GroupMessage({
      group: req.params.groupId,
      sender: req.user.id,
      message,
    });

    const savedMessage = await newMessage.save();
    // Populate sender details before emitting
    const populatedMessage = await GroupMessage.findById(
      savedMessage._id
    ).populate("sender", "fullName image");

    // Emit the message to the group room
    req.app
      .get("io")
      .to(req.params.groupId)
      .emit("new-group-message", populatedMessage);
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
