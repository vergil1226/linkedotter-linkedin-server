const mongoose = require("mongoose");

const openAiCheck = mongoose.model(
  "openai_check",
  new mongoose.Schema({
    checkDate: {
      type: Date,
      default: Date.now,
    },
  })
);

module.exports = openAiCheck;
