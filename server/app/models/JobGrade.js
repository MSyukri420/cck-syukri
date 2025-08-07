const mongoose = require('mongoose');

const JobGradeSchema = new mongoose.Schema({
    jobGradeName: {
        type: String,
        required: true
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    designation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Designation',
        required: true
    },
    percentageCarry: {
        knowHow: {
            type: Number,
            required: true
        },
        problemSolving: {
            type: Number,
            required: true
        },
        accountability: {
            type: Number,
            required: true
        }
    },
}, {timestamps: true});

JobGradeSchema.index({ jobGradeName: 1, designation: 1 }, { unique: true });

module.exports = mongoose.model('JobGrade', JobGradeSchema);
