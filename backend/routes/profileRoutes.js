const express = require("express");
const { getProfile, updateProfile, toggleFollow, followUser, unfollowUser, updateProfileVisibility } = require("../controllers/profileController");
const upload = require("../config/multer");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.put("/update", authMiddleware, upload.single("image"), updateProfile);
router.post("/follow/:userId", authMiddleware, toggleFollow);
router.get("/:userId", getProfile);
router.put("/:userId/visibility", updateProfileVisibility);

// Follow a user
router.post("/follow/:userId", authMiddleware, followUser);
// Unfollow a user
router.post("/unfollow/:userId", authMiddleware, unfollowUser);
module.exports = router;
