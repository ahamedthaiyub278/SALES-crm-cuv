const express = require('express');
const Lead = require('../models/Lead');
const Employee = require('../models/Employe_model');
const auth = require('../middlewares/authMiddleware');
const router = express.Router();

router.use(auth);


let lastAssignedIndex = 0;


router.post('/bulk-upload', async (req, res) => {
  try {
    const { leads } = req.body;

    if (!Array.isArray(leads) || leads.length === 0) {
      return res.status(400).json({ message: "No leads provided" });
    }

    const employees = await Employee.find();
    if (employees.length === 0) {
      return res.status(400).json({ message: "No employees to assign leads" });
    }

    const assignedLeads = leads.map((lead) => {
    const assignedEmployee = employees[lastAssignedIndex];
    lastAssignedIndex = (lastAssignedIndex + 1) % employees.length;

      return {
        ...lead,
        assignedTo: assignedEmployee._id,
        status: "Unassigned",
        scheduledCalls: [],
        leadDate: new Date(),
      };
    });

    const insertedLeads = await Lead.insertMany(assignedLeads, { ordered: false });
    res.status(201).json({ message: "Leads uploaded and assigned", data: insertedLeads });

  } catch (error) {
    console.error("Upload failed:", error);
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const lead = new Lead(req.body);
    await lead.save();
    res.status(201).json(lead);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.get('/', async (req, res) => {
  try {
    const leads = await Lead.find().populate('assignedTo');
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.patch('/:id', async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(lead);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    await Lead.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lead deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
