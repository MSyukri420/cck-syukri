// Import the Mongoose library
const mongoose = require("mongoose");

// Define a Mongoose schema for the "Attribute" model
const AttributeSchema = new mongoose.Schema({
    // Define a field "category" with the type String
    // It is required and should be one of the specified enum values: ["Know-How", "Problem-Solving", "Accountability"]
    category: {
        type: String,
        required: true,
        enum: ["Know-How", "Problem-Solving", "Accountability"]
    },
    // Define a field "name" with the type String
    // It is required
    name: {
        type: String,
        required: true,
    },
    // Define a field "percentageCarry" with the type Number
    // It is required
    percentageCarry: {
        type: Number,
    },
    // Define a field "subAttributes" as an array of ObjectIds
    // It references the 'SubAttribute' model
    subAttributes: [{
        name: {
            type: String,
            required: true,
        },
        // Weight associated with the sub-attribute
        weight: {
            type: Number,
            required: true
        },
    }],
    // Define a field "designation" with the type ObjectId
    // It references the 'Designation' model
    designation: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Designation'
    },
    jobGrade: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobGrade'
    },
}, {timestamps: true}); // Enable timestamps to automatically track createdAt and updatedAt fields

// Export the Mongoose model named 'Attribute' with the defined schema
module.exports = mongoose.model('Attribute', AttributeSchema);
