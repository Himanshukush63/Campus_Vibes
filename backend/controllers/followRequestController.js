// controllers/followRequestController.js
const FollowRequest = require("../models/FollowRequest");
const User = require("../models/User");

// Send a follow request
exports.sendFollowRequest = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Authentication required." });
    }
    const from = req.user._id;
    const to = req.params.userId;
    if (!to) {
      return res.status(400).json({ message: "Target userId is required." });
    }
    if (from.toString() === to.toString()) {
      return res.status(400).json({ message: "Cannot send follow request to yourself." });
    }
    // Check if already following
    const user = await User.findById(from);
    if (!user) {
      return res.status(404).json({ message: "Requesting user not found." });
    }
    if (user.following.includes(to)) {
      return res.status(400).json({ message: "Already following this user." });
    }
    // Check if request already exists
    const existing = await FollowRequest.findOne({ from, to, status: "pending" });
    if (existing) {
      return res.status(400).json({ message: "Follow request already sent." });
    }
    // Create follow request
    const request = new FollowRequest({ from, to });
    await request.save();
    res.status(201).json({ message: "Follow request sent.", request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Accept a follow request
exports.acceptFollowRequest = async (req, res) => {
  try {
    const requestId = req.params.requestId;
    const request = await FollowRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found." });
    if (request.to.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized." });
    }
    request.status = "accepted";
    await request.save();
    // Add follower/following
    await User.findByIdAndUpdate(request.from, { $addToSet: { following: request.to } });
    await User.findByIdAndUpdate(request.to, { $addToSet: { followers: request.from } });
    res.json({ message: "Follow request accepted." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reject a follow request
exports.rejectFollowRequest = async (req, res) => {
  try {
    const requestId = req.params.requestId;
    const request = await FollowRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found." });
    if (request.to.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized." });
    }
    request.status = "rejected";
    await request.save();
    res.json({ message: "Follow request rejected." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all follow requests for the current user
exports.getFollowRequests = async (req, res) => {
  try {
    const requests = await FollowRequest.find({ to: req.user._id, status: "pending" }).populate("from", "fullName image");
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
