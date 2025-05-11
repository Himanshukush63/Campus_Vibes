// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const multer = require("multer");
const path = require("path");
const postRoutes = require("./routes/postRoutes");
const messageRoutes = require("./routes/messageRoutes");
const chatRoutes = require("./routes/chatRoutes");
const { registerUser } = require("./controllers/userController");
const profileRoutes = require("./routes/profileRoutes");
const adminRoutes = require("./routes/admin");
const trafficRoutes = require("./routes/traffic");
const dashboardRoutes = require("./routes/dashboardRoutes");
const analyticsRoutes = require("./routes/analytics");
const trackActivity = require("./middleware/trackActivity");
require("./jobs/updateActiveUsers");
const announcement = require("./routes/announcement");
const notificationRoutes = require("./routes/notificationRoutes");
const Post = require("./models/Post");
const Notification = require("./models/Notification");
// Import routes using require
const moderationRoutes = require("./routes/moderationRoutes");
const groupRoutes = require("./routes/groupRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const followRequestRoutes = require("./routes/followRequestRoutes");

dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL, // Frontend URL
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true, // ✅ Allow credentials (cookies, sessions, auth headers)
  },
});

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(cors()); // Enable CORS

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// WebSocket connection
io.on("connection", (socket) => {
  // Join a group room
  socket.on("join-group", (groupId) => {
    socket.join(groupId);
    console.log(`User ${socket.id} joined group ${groupId}`);
  });

  // Send a group message
  socket.on("send-group-message", async (data) => {
    try {
      const { groupId, senderId, message } = data;

      // Save message to database
      const newMessage = new GroupMessage({
        group: groupId,
        sender: senderId,
        message,
      });
      await newMessage.save();

      // Broadcast message to the group
      io.to(groupId).emit("new-group-message", newMessage);
    } catch (error) {
      console.error("Error sending group message:", error);
    }
  });

  // Handle like event
  socket.on("like-post", async ({ postId, userId, postOwnerId }) => {
    try {
      console.log(
        userId !== postOwnerId,
        userId,
        postOwnerId,
        "::DSsdsds>>>>>>>>>>>>>>>>>>>"
      );

      if (userId !== postOwnerId) {
        console.log(userId, postOwnerId, "::DASda>>>>>>>>>>>>");

        const newNotification = new Notification({
          user: postOwnerId, // Post owner
          fromUser: userId, // The user who liked the post
          type: "like",
          post: postId,
        });

        await newNotification.save();

        io.to(postOwnerId).emit("new-notification", newNotification);
      }
    } catch (error) {
      console.log("Error handling like event:", error);
    }
  });

  // Handle new comment event
  socket.on("new-comment", async ({ postId, comment, userId, postOwnerId }) => {
    try {
      if (userId !== postOwnerId) {
        const newNotification = new Notification({
          user: postOwnerId,
          fromUser: userId,
          type: "comment",
          post: postId,
        });
        await newNotification.save();

        io.to(postOwnerId).emit("new-notification", newNotification);
      }
      // console.log(postId, comment,userId,  postOwnerId, "::><>>????????????????>>>>>>>SADASD")
      // Broadcast the new comment to all clients except the fromUser
      socket.to(postId).emit("new-comment", { postId, comment });
    } catch (err) {
      console.error("Error handling comment:", err);
    }
  });
  // Handle follow/unfollow event
  socket.on("follow-user", async ({ followerId, followingId, isFollowing }) => {
    console.log(
      followerId,
      followingId,
      isFollowing,
      "::wrwrw>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"
    );
    try {
      if (isFollowing) {
        // Send notification only if it's a follow (not unfollow)
        const newNotification = new Notification({
          user: followingId, // The user being followed
          fromUser: followerId, // The user who followed
          type: "follow",
        });

        await newNotification.save();
        io.to(followingId).emit("new-notification", newNotification);
      }
    } catch (error) {
      console.error("Error handling follow event:", error);
    }
  });
  // Handle new post event
  socket.on("new-post", (newPost) => {
    console.log("New post created:", newPost);
    io.emit("new-post", newPost); // Broadcast to all clients
  });

  app.set("io", io);

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });

  socket.on("join-user-room", (userId) => {
    if (!userId) {
      console.error("join-user-room: userId is missing or invalid", userId);
      socket.emit("error", { message: "User ID is required to join a room." });
      return;
    }
    socket.join(userId);
    console.log(`User ${userId} joined their room (socket: ${socket.id})`);
  });

  socket.on("new-chat", (newChat) => {
    if (!newChat || !newChat.recipientUserId || !newChat.chatData) {
      console.error("new-chat: Invalid newChat payload", newChat);
      socket.emit("error", { message: "Invalid chat data. recipientUserId and chatData are required." });
      return;
    }
    const { recipientUserId, chatData } = newChat;
    console.log(`New chat created with recipient: ${recipientUserId} (from socket: ${socket.id})`);
    // Emit to the specific recipient's room
    io.to(recipientUserId).emit("new-chat", chatData);
  });

  // Handle new message event
  socket.on("send-message", async (message) => {
    try {
      // Save the message to the database
      const newMessage = new Message(message);
      await newMessage.save();

      // Update the chat's last message
      await Chat.findByIdAndUpdate(message.chat, {
        lastMessage: newMessage._id,
      });

      // Emit the message to the recipient
      io.to(message.chat).emit("new-message", newMessage);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// File filter for images and videos
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype.startsWith("video/") ||
    file.mimetype === "application/pdf" ||
    file.mimetype === "application/msword" ||
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only images and videos are allowed!"), false);
  }
};
const upload = multer({ storage, fileFilter });

// Serve static files from the 'uploads' folder
app.use("/uploads", express.static("uploads"));

// Update the register route to handle file uploads
// app.post("/api/users/register", upload.single("image"), (req, res) => {
//   // req.file contains the uploaded file
//   const imagePath = req.file ? `/uploads/${req.file.filename}` : "";
//   req.body.image = imagePath; // Add the image path to the request body
//   registerUser(req, res); // Call the registerUser controller
// });
// Update the register route to handle file uploads
app.post(
  "/api/users/register",
  upload.fields([{ name: "image" }, { name: "document" }]),
  (req, res) => {
    // req.files contains uploaded files (image and document)
    const imagePath = req.files["image"]
      ? `/uploads/${req.files["image"][0].filename}`
      : "";
    const documentPath = req.files["document"]
      ? `/uploads/${req.files["document"][0].filename}`
      : "";

    // Add file paths to the request body
    req.body.image = imagePath;
    req.body.document = documentPath;

    registerUser(req, res); // Call the registerUser controller
  }
);

app.use(trackActivity);

// Routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/profile", profileRoutes);

app.use("/api/admin", adminRoutes); // Admin routes
app.use("/api/traffic", trafficRoutes); // Traffic routes
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use("/announcements", announcement);

// Integrate in server.js
app.use("/api/notifications", notificationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/moderation", moderationRoutes); // Content Moderation API
app.use("/api/groups", groupRoutes);
app.use("/api/chatbot", chatbotRoutes); // Chatbot API
app.use("/api/follow-requests", followRequestRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
