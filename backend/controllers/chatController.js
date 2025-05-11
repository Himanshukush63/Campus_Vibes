const Chat = require("../models/Chat");

const startChat = async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.user.id;

    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [currentUserId, userId] }
    });

    if (!chat) {
      // Create new chat if it doesn't exist
      chat = new Chat({
        participants: [currentUserId, userId]
      });

      await chat.save();
    }

    // Populate participant details
    const populatedChat = await Chat.findById(chat._id)
      .populate("participants", "fullName email image")
      .populate("lastMessage");

    // Emit event via WebSocket to notify the recipient
    const io = req.app.get("io"); // Get io instance
    io.to(userId).emit("new-chat", populatedChat); // Notify recipient

    res.status(201).json(populatedChat);
  } catch (err) {
    console.error("Error starting chat:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { startChat };
