// routes/notificationRoutes.js
const express = require("express");
const Notification = require("../models/Notification");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// Get user notifications
router.get("/:userId", authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .populate("fromUser", "fullName image")
      .populate("post", "caption")
      .sort({ createdAt: -1 });

    // Construct a readable message
    const formattedNotifications = notifications.map((notification) => {
      let message;
      
      // For warning type, use the message field directly
      if (notification.type === "warning") {
        message = notification.message || "Your post contains inappropriate content.";
      } else {
        // For other notification types
        message = `${notification.fromUser?.fullName} `;
        if (notification.type === "like") {
          message += `liked your post "${notification.post?.caption}".`;
        } else if (notification.type === "comment") {
          message += `commented on your post "${notification.post?.caption}".`;
        } else if (notification.type === "follow") {
          message += `started following you.`;
        } else if (notification.type === "unfollow") {
          message += `unfollowed you.`;
        }
      }
      
      return {
        ...notification._doc,
        message,
      };
    });

    res.json(formattedNotifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Mark notification as read
router.put("/:id/read", authMiddleware, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
