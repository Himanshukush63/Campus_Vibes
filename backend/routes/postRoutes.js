const express = require("express");
const {
  createPost,
  getPosts,
  deletePost,
  likePost,
  addComment,
  getComments,
} = require("../controllers/postController");
const upload = require("../config/multer");
const authMiddleware = require("../middleware/authMiddleware");
const Post = require("../models/Post");
const filterComment = require("../middleware/filterComments");
const filterPost = require("../middleware/filterPosts");
const router = express.Router();

router.post("/", authMiddleware, upload.single("file"), filterPost, createPost);
// Get Posts
router.get("/", getPosts);

// Delete Posts
router.delete("/:postId", authMiddleware, deletePost);

// Like routes
router.post("/:postId/like", authMiddleware, likePost);
// router.get('/:postId/likes', authMiddleware, getLikes);

// Comment routes
router.post("/:postId/comments", authMiddleware, filterComment, addComment);
router.get("/:postId/comments", authMiddleware, getComments);

// admin
// Fetch all posts (for admin)
router.get("/admin", async (req, res) => {
  try {
    const posts = await Post.find({}).populate("user", "fullName email"); // Populate user details
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching posts" });
  }
});

// Approve a post
router.put("/admin/:id/approve", async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error approving post" });
  }
});

// Reject a post
router.put("/admin/:id/reject", async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error rejecting post" });
  }
});

module.exports = router;
