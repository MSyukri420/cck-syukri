const mongoose = require('mongoose');

const ApiKeySchema = new mongoose.Schema({
    key: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date
    }
});

ApiKeySchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('ApiKey', ApiKeySchema);