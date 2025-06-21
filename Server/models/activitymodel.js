const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  activity_string: {
    type: String,
    required: true
  },
  activity: {
    type: [String], 
    default: []
  }
},{timestamps:Date});

module.exports = mongoose.model('Activity', activitySchema);
