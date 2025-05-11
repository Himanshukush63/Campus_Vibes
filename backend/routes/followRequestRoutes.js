// routes/followRequestRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const followRequestController = require("../controllers/followRequestController");

// Send follow request
router.post("/:userId", authMiddleware, followRequestController.sendFollowRequest);
// Accept follow request
router.post("/accept/:requestId", authMiddleware, followRequestController.acceptFollowRequest);
// Reject follow request
router.post("/reject/:requestId", authMiddleware, followRequestController.rejectFollowRequest);
// Get all follow requests for current user
router.get("/", authMiddleware, followRequestController.getFollowRequests);

module.exports = router;
