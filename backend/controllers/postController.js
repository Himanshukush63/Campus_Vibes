// controllers/postController.js
const Post = require("../models/Post");
const User = require("../models/User");

const createPost = async (req, res) => {

  try {
    const { caption, type } = req.body;
    const userId = req.user.id;

    let content = "";

    if (type === "text") {
      content = req.body.content;
    } else if (type === "image" || type === "video" || type === "document") {
      if (!req.file) {
        return res
          .status(400)
          .json({ message: "File is required for image/video/document posts" });
      }
      content = `/uploads/${req.file.filename}`;
    }

    const newPost = new Post({
      user: userId,
      type,
      caption,
      content,
    });

    await newPost.save();

    // Add post to user's posts array
    await User.findByIdAndUpdate(userId, { $push: { posts: newPost._id } });

    // Populate user details for the new post
    const populatedPost = await Post.findById(newPost._id).populate({
      path: "user",
      select: "fullName email image",
    });

    // Emit WebSocket event
    req.app.get("io").emit("new-post", populatedPost);

    // Check if post had abusive content (set by filterPosts middleware)
    if (req.hasAbusiveContent) {
      res
        .status(201)
        .json({ 
          message: "Post created successfully, but a warning has been issued for inappropriate content.", 
          post: populatedPost,
          warning: true
        });
    } else {
      res
        .status(201)
        .json({ message: "Post created successfully", post: populatedPost });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all pending posts with pagination
const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get posts with user details
    const posts = await Post.find({ status: "approved" })
      .populate({
        path: "user",
        select: "fullName email image profileVisibility",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Post.countDocuments({ status: "approved" });

    res.json({
      posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    // Find the post
    const post = await Post.findById(postId);

    // Check if the post exists and belongs to the user
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this post" });
    }

    // Delete the post
    await Post.findByIdAndDelete(postId);

    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// like controller to emit events
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const userId = req.user.id;
    const index = post.likes.indexOf(userId);

    if (index === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(index, 1);
    }

    await post.save();
    
    // Emit real-time update
    req.app.get('io').emit(`post:${post._id}:like`, post.likes);
    
    res.json({ likes: post.likes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const newComment = {
      user: req.user.id,
      text: req.body.text,
    };

    post.comments.push(newComment);
    await post.save();

    // Populate user details for real-time emission
    const populatedComment = await Post.populate(post, {
      path: 'comments.user',
      select: 'fullName image'
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.emit(`post:${req.params.postId}:comment`, populatedComment.comments.slice(-1)[0]);

    res.status(201).json(populatedComment.comments.slice(-1)[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getComments = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .select('comments')
      .populate('comments.user', 'fullName image');

    if (!post) return res.status(404).json({ message: 'Post not found' });

    res.json(post.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add similar controllers for update/delete comments

module.exports = { createPost, getPosts, deletePost, likePost, addComment, getComments };
