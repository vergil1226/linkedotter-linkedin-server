const mongoose = require('mongoose')
const userContainer = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    max: 200,
  },
  agent_id: {
    type: String,
    required: true,
    max: 200,
  },
  container_id: {
    type: String,
    required: true,
  },
},{timestamps: true}
)
module.exports = mongoose.model('user_phantom_container',userContainer)
