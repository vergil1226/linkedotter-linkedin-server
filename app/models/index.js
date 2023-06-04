const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const db = {};
db.mongoose = mongoose;
db.user = require("./user.model");
db.phantomResponse = require("./response.model");
db.openAiCheck = require("./openai_check.model");
db.userContainer = require("./userContainer.model");
db.cookie = require("./user_cookie.model");
module.exports = db;
