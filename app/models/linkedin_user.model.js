const mongoose = require("mongoose");

const linkedn_user = mongoose.model(
  "linkedin_user",
  new mongoose.Schema({
    userLink: String,
    company: String,
    jobTitle: String ,
  })
);

module.exports = linkedn_user;
