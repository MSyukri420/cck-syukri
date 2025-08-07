const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
    departmentName: {
        type: String,
        required: true,
        unique: true
    }
}, {timestamps: true});

module.exports = mongoose.model('Department', DepartmentSchema);