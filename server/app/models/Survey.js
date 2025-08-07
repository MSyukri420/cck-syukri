const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const SurveySchema = new Schema({
    campaignName: {
        type: String,
        required: true
    },
    campaignDescription: {
        type: String,
        required: true
    },
    campaignStartDate: {
        type: Date,
        required: true
    },
    campaignEndDate: {
        type: Date,
        required: true
    },
    employees: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    questions: [{
        question: {
            type: String,
            required: true
        },
        low: {
            type: String,
            required: true
        },
        high: {
            type: String,
            required: true
        }
    }],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {timestamps: true});

module.exports = mongoose.model('Survey', SurveySchema);