const mongoose = require("mongoose");

const phantom_link = mongoose.model(
  "phantom_link",
  new mongoose.Schema({
    phantomLink:{ type:String},
    container_id:{type:String}
  })
);

module.exports = phantom_link;