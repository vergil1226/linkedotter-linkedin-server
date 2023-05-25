const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: String,
    email: String,
    password: String ,
    team: String ,
    user_type:String ,
    date: {
      type:Date,
      default:{}
    }
  })
);

module.exports = User;
