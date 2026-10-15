const mongoose = require('mongoose');

// Attempt counters for login and password-reset limits. Kept in MongoDB so they survive restarts
// and are shared by every copy of the server; MongoDB deletes each counter once its window ends.
const RateLimitSchema = new mongoose.Schema({
    _id: String,
    count: {type: Number, default: 0},
    expiresAt: {type: Date, required: true},
});

RateLimitSchema.index({expiresAt: 1}, {expireAfterSeconds: 0});

module.exports = mongoose.model('RateLimit', RateLimitSchema);
