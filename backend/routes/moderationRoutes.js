const express = require("express");
const router = express.Router();
const BlockedWord = require("../models/BlockedWord")
// Add a blocked word
router.post("/add", async (req, res) => {
  try {
    const { word } = req.body;
    if (!word) return res.status(400).json({ error: "Word is required" });

    const existingWord = await BlockedWord.findOne({ word });
    if (existingWord) return res.status(400).json({ error: "Word already blocked" });

    const newWord = new BlockedWord({ word });
    await newWord.save();
    res.status(201).json({ message: "Word added", newWord });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all blocked words
router.get("/", async (req, res) => {
  try {
    const words = await BlockedWord.find();
    res.json(words);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a blocked word
router.delete("/:id", async (req, res) => {
  try {
    await BlockedWord.findByIdAndDelete(req.params.id);
    res.json({ message: "Word removed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;