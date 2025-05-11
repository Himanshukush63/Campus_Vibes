// routes/userRoutes.js
const express = require("express");
const { registerUser, loginUser, searchUsers, getSuggestedUsers, logoutUser, getAllUsers, followUser } = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");
const trackActivity = require("../middleware/trackActivity");

const router = express.Router();

// Ping endpoint to track activity
router.post("/ping", authMiddleware, async (req, res) => {
    if (req.user) {
        await User.findByIdAndUpdate(req.user.id, { lastActive: Date.now() });
    }
    res.status(200).json({ message: "Ping received" });
});

// Register route
router.post("/register", registerUser);

// Login route
router.post("/login", loginUser);

// Search users
router.get("/search", authMiddleware, searchUsers);

//suggested
router.get("/suggested", authMiddleware, trackActivity, getSuggestedUsers);

// Get all users
router.get("/all", authMiddleware, trackActivity, getAllUsers);

// Follow/unfollow user
router.post("/:userId/follow", authMiddleware, trackActivity, followUser);

module.exports = router;