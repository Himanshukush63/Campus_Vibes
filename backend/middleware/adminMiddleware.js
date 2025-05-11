// middleware/adminMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User")

const adminMiddleware = async (req, res, next) => {
  try {
    // 1. Get token from headers
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ message: "Authorization token missing" });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // 3. Find user in database
    const user = await User.findById(decoded.id).select("role");
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // 4. Check admin role
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    // 5. Attach user to request
    req.user = user;
    next();

  } catch (error) {
    console.error("Admin middleware error:", error);
    return res.status(401).json({ 
      message: "Invalid token",
      error: error.message 
    });
  }
};

module.exports = adminMiddleware;