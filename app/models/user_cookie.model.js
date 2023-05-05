const mongoose = require('mongoose')
const user_cookieSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    max: 200,
  },
  cookie_value: {
    type: String,
    required: true,
  },
},{timestamps: true}
)
module.exports = mongoose.model('cookie_data',user_cookieSchema)