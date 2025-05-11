// controllers/userController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { registerSchema, loginSchema } = require("../validators/userValidator");

// Register a new user
const registerUser = async (req, res) => {
  try {
    // Validate request body
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create new user
    const newUser = new User({
      fullName: req.body.fullName,
      email: req.body.email,
      password: hashedPassword,
      image: req.body.image || "",
      aboutMe: req.body.aboutMe || "",
      gender: req.body.gender || "",
      type: req.body.type,
      document: req.body.document || "",
      isApproved: false,
    });

    // Save user to database
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Return response
    res.status(201).json({ token, user: newUser });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    // Validate request body
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Check if user exists
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 🔴 Check if the user is approved
    if (!user.isApproved) {
      return res
        .status(403)
        .json({ message: "Your account is not approved yet." });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Return response
    res.status(200).json({ token, user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// search user
// const searchUsers = async (req, res) => {
//   try {
//     const { query } = req.query;
//     const currentUserId = req.user.id;

//     const users = await User.find({
//       $and: [
//         {
//           $or: [
//             { fullName: { $regex: query, $options: "i" } },
//             { email: { $regex: query, $options: "i" } }
//           ]
//         },
//         { _id: { $ne: currentUserId } } // Exclude current user
//       ]
//     }).select("-password");

//     res.json(users);
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const currentUserId = req.user.id;
    if (!query.trim()) {
      return res.json([]); // ✅ Return empty array if query is empty
    }
    const users = await User.find({
      $and: [
        {
          $or: [
            { fullName: { $regex: query, $options: "i" } },
            { email: { $regex: query, $options: "i" } },
          ],
        },
        { _id: { $ne: currentUserId } }, // ✅ Exclude current user
      ],
    }).select("-password");

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const followUser = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const targetUserId = req.params.userId;

    // Add to current user's following list
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { following: targetUserId },
    });

    // Add to target user's followers list
    await User.findByIdAndUpdate(targetUserId, {
      $addToSet: { followers: currentUserId },
    });

    res.status(200).json({ message: "Followed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSuggestedUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    if (!currentUserId) {
      return res.status(400).json({ message: "Invalid user" });
    }
    // Find users who are not the current user and not already followed
    const suggestedUsers = await User.aggregate([
      {
        $match: {
          _id: { $ne: currentUserId }, // Exclude the current user
          followers: { $nin: [currentUserId] }, // Exclude already followed users
        },
      },
      { $sample: { size: 10 } }, // Randomly pick up to 10 users
      {
        $project: {
          fullName: 1,
          username: 1,
          image: 1,
          followersCount: { $size: "$followers" },
        },
      },
    ]);

    res.status(200).json(suggestedUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isApproved: true }).select("-password");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  searchUsers,
  getAllUsers,
  followUser,
  getSuggestedUsers,
};
