const express = require('express');
const Employee = require('../models/Employe_model');
const auth = require('../middlewares/authMiddleware');
const router = express.Router();

router.use(auth);


router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find().populate('assignedLeads');
    res.json(employees);
  } catch (err) {
    console.error(' Error in /api/employees:', err); 
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate('assignedLeads');
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json(employee);
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID' });
  }
});


router.post('/', async (req, res) => {
  try {
    const emp = new Employee(req.body);
    await emp.save();
    res.status(201).json(emp);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.patch('/:id', async (req, res) => {
  try {
    const updatedEmp = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedEmp) return res.status(404).json({ error: 'Employee not found' });
    res.status(200).json({ message: 'Employee updated', data: updatedEmp });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Employee.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Employee not found' });
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
