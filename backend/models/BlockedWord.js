const mongoose = require("mongoose");

const BlockedWordSchema = new mongoose.Schema({
  word: { type: String, required: true, unique: true },
});

module.exports = mongoose.model("BlockedWord", BlockedWordSchema);