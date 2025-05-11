// routes/chatRoutes.js
const express = require("express");
const router = express.Router();
const { startChat } = require("../controllers/chatController");
const authMiddleware = require("../middleware/authMiddleware");

// Start new chat
router.post("/start", authMiddleware, startChat);

module.exports = router;