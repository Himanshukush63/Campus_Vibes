// controllers/messageController.js
const Chat = require("../models/Chat");
const Message = require("../models/Message");

// Get all chats for the authenticated user
const getChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const chats = await Chat.find({ participants: userId })
      .populate("participants", "fullName email image")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get messages for a specific chat
const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chat: chatId })
      .populate("sender", "fullName email image")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { chatId, content } = req.body;
    const senderId = req.user.id;

    const newMessage = new Message({
      chat: chatId,
      sender: senderId,
      content,
      readBy: [senderId] // Automatically mark as read by sender
    });

    await newMessage.save();

    // Update the chat's last message
    await Chat.findByIdAndUpdate(chatId, { lastMessage: newMessage._id });

    // Emit the message via WebSocket
    req.app.get("io").to(chatId).emit("new-message", newMessage);

    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


const markMessagesAsRead = async (req, res) => {
  try {
    const { chatId } = req.body;
    const userId = req.user.id;

    // Mark all unread messages in the chat as read
    await Message.updateMany(
      { chat: chatId, readBy: { $ne: userId } },
      { $push: { readBy: userId } }
    );

    res.json({ message: "Messages marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getChats, getMessages, sendMessage, markMessagesAsRead };