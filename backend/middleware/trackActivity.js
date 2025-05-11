// middleware/trackActivity.js
const User = require("../models/User");

const trackActivity = async (req, res, next) => {
  // Only track activity if user is authenticated
  if (req.user && req.user.id) {
    await User.findByIdAndUpdate(req.user._id, { lastActive: Date.now() });
  }
  next(); // Always proceed to next middleware/route
};

module.exports = trackActivity;