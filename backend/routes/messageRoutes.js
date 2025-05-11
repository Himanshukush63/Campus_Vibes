// routes/messageRoutes.js
const express = require("express");
const { getChats, getMessages, sendMessage, markMessagesAsRead } = require("../controllers/messageController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get all chats for the authenticated user
router.get("/chats", authMiddleware, getChats);

// Get messages for a specific chat
router.get("/messages/:chatId", authMiddleware, getMessages);

// Send a message
router.post("/send", authMiddleware, sendMessage);

// mark message read
router.post("/mark-as-read", authMiddleware, markMessagesAsRead);

module.exports = router;