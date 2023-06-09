const mongoose = require("mongoose");

const message_thread = mongoose.model(
  "message_thread",
  new mongoose.Schema({
    threadUrl: String,
    jsonUrl: String,
  })
);

module.exports = message_thread;
