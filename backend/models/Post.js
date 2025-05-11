// models/Post.js
const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "image", "video", "document"],
      required: true,
    },
    caption: {
      type: String,
      trim: true,
    },
    content: {
      type: String, // URL for image/video, text for text posts
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        text: {
          type: String,
          required: true,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);
postSchema.virtual("author", {
  ref: "User",
  localField: "user",
  foreignField: "_id",
  justOne: true,
});

postSchema.virtual("author", {
  ref: "User",
  localField: "user",
  foreignField: "_id",
  justOne: true,
});
postSchema.set("toJSON", { virtuals: true });
postSchema.set("toObject", { virtuals: true });
module.exports = mongoose.model("Post", postSchema);
