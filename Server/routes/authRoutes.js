const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Employee = require('../models/Employe_model');
const router = express.Router();

const createToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role || 'employee' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};


router.post('/register', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.post('/login', async (req, res) => {
  const { email, password, type } = req.body; 

  try {
    let account;

    if (type === 'employee') {
      account = await Employee.findOne({ email });
    } else {
      account = await User.findOne({ email });
    }

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: account._id, role: account.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, user: account });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post('/register-employee', async (req, res) => {
  try {
    const { name, email, password, role, location, language } = req.body;

    const existing = await Employee.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const employee = new Employee({
      name,
      email,
      password: hashed,
      role: role || 'Sales',
      location,
      language
    });

    await employee.save();
    res.status(201).json({ message: 'Employee registered successfully', employee });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.patch('/update-employee/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const allowedUpdates = ['name', 'email', 'role', 'location', 'language', 'status', 'Assigned', 'Closed_leads'];
    const isValidUpdate = Object.keys(updates).every(update => allowedUpdates.includes(update));

    if (!isValidUpdate) {
      return res.status(400).json({ error: 'Invalid updates!' });
    }

 
    if (updates.email) {
      const existingEmployee = await Employee.findOne({ email: updates.email });
      if (existingEmployee && existingEmployee._id.toString() !== id) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    const employee = await Employee.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ message: 'Employee updated successfully', employee });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;
