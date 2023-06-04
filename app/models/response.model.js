const mongoose = require("mongoose");

const phantomResponse = new mongoose.Schema(
  {
    message: { type: String },
    lastMessageFromUrl: { type: String },
    firstnameFrom: { type: String },
    lastnameFrom: { type: String },
    isLastMessageFromMe: { type: Boolean },
    readStatus: { type: Boolean },
    lastMessageDate: { type: Date },
    container_id: { type: String },
    user_id: { type: String },
    isInterested: { type: Boolean },
    openAIChecked: { type: Boolean },
  },
  { timestamps: true }
);

module.exports = mongoose.model("phantom_response_messages", phantomResponse);
