const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const leadSchema = new Schema({
  name: String,
  email: String,
  phone: String,
  source: String,
  type: String,
  status: String,
  leadDate: Date,
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'Employee', 
  }
});

module.exports = mongoose.model('Lead', leadSchema);
