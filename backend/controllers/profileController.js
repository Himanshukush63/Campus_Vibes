const User = require("../models/User");
const Post = require("../models/Post");

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate("followers", "fullName image")
      .populate("following", "fullName image")
      .populate({
        path: "posts",
        match: { status: "approved" } // Filter only approved posts
      });

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// exports.getProfile = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const currentUserId = req.user?.id; // Assuming you have authentication middleware

//     const user = await User.findById(userId)
//       .populate("followers", "fullName image")
//       .populate("following", "fullName image")
//       .populate({
//         path: "posts",
//         match: { status: "approved" }, // Filter only approved posts
//       });

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Check profile visibility
//     if (user.profileVisibility === "private" && userId !== currentUserId) {
//       const isFollower = user.followers.some(
//         (follower) => follower._id.toString() === currentUserId
//       );

//       if (!isFollower) {
//         // If private and not a follower, return the profile without posts
//         return res.json({
//           ...user.toObject(),
//           posts: [], // Hide posts for non-followers
//         });
//       }
//     }

//     // If public or follower, return the profile with posts
//     res.json(user);
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// };


exports.updateProfileVisibility = async (req, res) => {
  try {
    const { userId } = req.params;
    const { profileVisibility } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { profileVisibility },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { fullName, aboutMe } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : req.body.image;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { fullName, aboutMe, image },
      { new: true }
    );

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Follow/Unfollow user
exports.toggleFollow = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = await User.findById(req.user.id);
    const targetUser = await User.findById(userId);

    if (!targetUser) return res.status(404).json({ message: "User not found" });

    const isFollowing = currentUser.following.includes(userId);
    if (isFollowing) {
      currentUser.following.pull(userId);
      targetUser.followers.pull(req.user.id);
    } else {
      currentUser.following.push(userId);
      targetUser.followers.push(req.user.id);
    }

    await currentUser.save();
    await targetUser.save();

    res.json({ message: isFollowing ? "Unfollowed" : "Followed" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


// Follow a user
exports.followUser = async (req, res) => {
  try {
    const { userId } = req.params; // User to follow
    const currentUserId = req.user.id; // Current logged-in user

    // Prevent self-follow
    if (userId === currentUserId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    // Add to following list
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { following: userId }, // Avoid duplicates
    });

    // Add to follower list
    await User.findByIdAndUpdate(userId, {
      $addToSet: { followers: currentUserId }, // Avoid duplicates
    });

    res.json({ message: "User followed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Unfollow a user
exports.unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params; // User to unfollow
    const currentUserId = req.user.id; // Current logged-in user

    // Remove from following list
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { following: userId },
    });

    // Remove from follower list
    await User.findByIdAndUpdate(userId, {
      $pull: { followers: currentUserId },
    });

    res.json({ message: "User unfollowed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};