const express = require('express');
const Employe_model = require('../models/Employe_model');


const employee_get = async (req, res) => {
    try {
        const get_employee = await Employe_model.find({});
        res.status(200).json({
            message: "Employees fetched successfully",
            data: get_employee
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching employees", error });
    }
};


const employee_post = async (req, res) => {
    try {
        const data = req.body;
        const create_employee = await Employe_model.create(data);
        res.status(200).json({
            message: "Employee created successfully",
            data: create_employee
        });
    } catch (error) {
        res.status(500).json({ message: "Error creating employee", error });
    }
};


const employee_patch = async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const updated_employee = await Employe_model.updateOne({ _id: id }, { $set: data });

        res.status(200).json({
            message: "Employee updated successfully",
            data: updated_employee
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating employee", error });
    }
};

// DELETE an employee by ID
const employee_delete = async (req, res) => {
    try {
        const id = req.params.id;
        const deleted_employee = await Employe_model.deleteOne({ _id: id });

        res.status(200).json({
            message: "Employee deleted successfully",
            data: deleted_employee
        });
    } catch (error) {
        res.status(500).json({ message: "Error deleting employee", error });
    }
};

module.exports = {
    employee_get,
    employee_post,
    employee_patch,
    employee_delete
};
