exports.commentOwner = async (req, res, next) => {
    try {
      const post = await Post.findOne({ "comments._id": req.params.commentId });
      const comment = post.comments.id(req.params.commentId);
      
      if (!comment.user.equals(req.user._id)) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      next();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };