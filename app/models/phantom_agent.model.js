const mongoose = require("mongoose");

const phantom_agent = mongoose.model(
  "phantom_agent",
  new mongoose.Schema({
    agent_id: String,
    date: Date,
  })
);

module.exports = phantom_agent;
