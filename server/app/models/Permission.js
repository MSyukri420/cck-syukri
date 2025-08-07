const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    group: {
        type: String,
        default: null,
    },
    exclusive: {
        type: Boolean,
        required: true,
        default: false 
    },
    module: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('Permission', permissionSchema);