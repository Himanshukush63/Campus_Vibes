// routes/chatbotRoutes.js
const express = require("express");
const { processMessage } = require("../controllers/chatbotController");
const authMiddleware = require("../middleware/authMiddleware");
const trackActivity = require("../middleware/trackActivity");

const router = express.Router();

// Process chatbot messages
router.post("/message", authMiddleware, trackActivity, processMessage);

module.exports = router;
