const BlockedWord = require("../models/BlockedWord");

const filterComment = async (req, res, next) => {
  try {
    const words = await BlockedWord.find();
    const blockedWords = words.map((w) => w.word.toLowerCase());

    const comment = req.body.text.toLowerCase();
    if (blockedWords.some((word) => comment.includes(word))) {
      return res.status(400).json({ error: "Your comment contains prohibited words." });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
module.exports = filterComment;