const mongoose = require('mongoose');

const PerformanceAppraisalSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    employeeSelect: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    employeeDetails: {
        name: String,
        employeeId: String,
        designation: String,
        department: String,
        jobGrade: String,
        dateOfJoining: Date,
    },
    timePeriod: {
        type: String,
    },
    appraisalDate: {
        type: String,
    },
    attributePercentageCarry: {
        KnowHow: Number,
        ProblemSolving: Number,
        Accountability: Number,
    },
    appraisalData: [{
        attributeName: String,
        attributeType: {
            type: String,
            enum: ["Know-How", "Problem-Solving", "Accountability"]
        },
        subAttributes: [{
            name: String,
            weight: Number,
            marksGiven: Number,
        }],
    }],
    appraiserComments: {
        message: String,
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        timestamp: Date,
    },
    surveyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Survey',
    },
    employeeComment: {
        message: String,
        timestamp: Date,
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    supervisor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    pdf: {
        type: String,
    }
}, { timestamps: true });

module.exports = mongoose.model('PerformanceAppraisal', PerformanceAppraisalSchema);