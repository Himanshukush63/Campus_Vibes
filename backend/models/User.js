// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    image: {
      type: String, // URL of the uploaded image
      default: "",
    },
    aboutMe: {
      type: String,
      default: "",
      trim: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    type: {
      type: String,
      enum: ["student", "faculty"],
      required: true,
    },
    document: {
      type: String, // URL of the uploaded document
      default: "",
    },
    isApproved: {
      type: Boolean,
      default: false, // New users are not approved by default
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Followers list
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Following list
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }], // User's posts
    lastActive: { type: Date, default: Date.now }, // Timestamp of last activity
    isOnline: { type: Boolean, default: false }, // Whether the user is currently online
    profileVisibility: { type: String, enum: ["public", "private"], default: "public" }, // Add this field
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);