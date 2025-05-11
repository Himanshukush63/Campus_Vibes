const BlockedWord = require("../models/BlockedWord");
const Notification = require("../models/Notification");

const filterPost = async (req, res, next) => {
  try {
    // Get all blocked words from database
    const words = await BlockedWord.find();
    const blockedWords = words.map((w) => w.word.toLowerCase());
    
    // Check if post content or caption contains blocked words
    const content = req.body.content ? req.body.content.toLowerCase() : "";
    const caption = req.body.caption ? req.body.caption.toLowerCase() : "";
    
    // Check if any blocked word is in the content or caption
    const hasBlockedWord = blockedWords.some(
      (word) => content.includes(word) || caption.includes(word)
    );
    
    if (hasBlockedWord) {
      // Create a warning notification for the user
      const newNotification = new Notification({
        user: req.user.id,
        type: "warning",
        fromUser: req.user.id, // System warning (self-notification)
        read: false,
        message: "Your message violates our community guidelines. Kindly refrain from using offensive words."
      });
      
      await newNotification.save();
      
      // Emit real-time notification if socket.io is available
      if (req.app.get("io")) {
        req.app.get("io").to(req.user.id).emit("notification", newNotification);
      }
      
      // We'll still allow the post but with a warning
      req.hasAbusiveContent = true;
    }
    
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = filterPost;
