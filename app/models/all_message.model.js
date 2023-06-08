const mongoose = require("mongoose");

const all_message = mongoose.model(
  "all_message",
  new mongoose.Schema({
    conversationUrl: String,
    author: String,
    firstName: String,
    lastName: String,
    date: Date,
    profileUrl: String,
    headline: String,
    imgUrl: String,
    connectionDegree: String,
    url: String,
    message: String,
    timestamp: Date,
    user_id: String,
  })
);

module.exports = all_message;
