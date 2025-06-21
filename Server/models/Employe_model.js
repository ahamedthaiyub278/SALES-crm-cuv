const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const employeeSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: false
  },
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: false
  },
  password:{
    type:String,

  },
  role: {
    type: String,
    default: "Sales",
    required: false
  },
  location: {
    type: String,
    default: "Remote",
    required: false
  },
  language: {
    type: String,
    default: "English",
    required: false
  },
  Assigned: {
    type: Number,
    default: 0,
    min: 0,
    required: false
  },
  Closed_leads: {
    type: Number,
    default: 0,
    min: 0,
    required: false
  },
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active",
    required: false
  },
  assignedLeads: [{
    type: Schema.Types.ObjectId,
    ref: 'Lead',
    required: false
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    required: false
  }
});

const EmployeeModel = mongoose.model('Employee', employeeSchema);

module.exports = EmployeeModel;
