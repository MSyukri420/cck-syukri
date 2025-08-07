const mongoose = require('mongoose');

const DesignationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    },
    isLead: {
        type: Boolean,
        default: false
    }
}, {timestamps: true});


DesignationSchema.index({ name: 1, department: 1 }, { unique: true });

module.exports = mongoose.model('Designation', DesignationSchema);