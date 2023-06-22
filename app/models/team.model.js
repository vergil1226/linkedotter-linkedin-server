const mongoose = require("mongoose");

const Team = mongoose.model(
  "Team",
  new mongoose.Schema({
    team_name: String,
    team_number: String,
  })
);

module.exports = Team;
