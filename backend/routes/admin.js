// routes/admin.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const adminMiddleware = require("../middleware/adminMiddleware");

// Get all users with pagination (Admin only)
router.get("/users", adminMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find({}, { password: 0 }) // Exclude passwords
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);

    res.json({
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
});

// Delete a user
router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, message: "Error deleting user" });
  }
});

// Approve or Decline User
router.put("/users/:userId/approval", async (req, res) => {
  try {
    const { status } = req.body; // Expect status: true (approve) or false (decline)
    
    if (status !== true && status !== false) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isApproved: status },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: `User has been ${status ? "approved" : "declined"}`, user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


module.exports = router;