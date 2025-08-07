const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const SurveyResponseSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    campaign: {
        type: Schema.Types.ObjectId,
        ref: 'Survey',
        required: true
    },
    responses: [{
        question: {
            type: String,
            required: true
        },
        rating: {
            type: Number,
            required: true
        }
    }],
    completed: {
        type: Boolean,
        default: false
    },
    pdf: {
        type: String,
        default: null
    }
});

module.exports = mongoose.model('SurveyResponse', SurveyResponseSchema);