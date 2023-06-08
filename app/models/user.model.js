const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: String,
    email: String,
    password: String ,
    team: String ,
    user_type:String ,
    quality_score: Number,
    tta_value: Number,
    date: {
      type:Date,
      default:{}
    }
  })
);

module.exports = User;
