// Import the Mongoose library, which allows working with MongoDB
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define a Mongoose schema for the 'User' collection
const UserSchema = new mongoose.Schema({
    employeeId: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true,},
    password: { type: String, required: true },
    name: { type: String },
    phone: { type: String },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
    },
    designation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Designation',
    },
    dateJoined: Date,
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role'
    },
    realRole: String,
    notifications: [{
        info: String,
        read: Boolean,
        date: Date,
    }],
    birthday: Date,
    address: String,
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
    },
    profilePicture: String,
    jobGrade: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobGrade',
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
}, {timestamps: true});


UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});


// Export the Mongoose model for the "User" schema
module.exports = mongoose.model('User', UserSchema);
