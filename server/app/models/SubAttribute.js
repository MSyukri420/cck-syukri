const mongoose = require("mongoose");

// Define a Mongoose schema for SubAttribute
const SubAttributeSchema = new mongoose.Schema({
    // Name of the sub-attribute
    name: {
        type: String,
        required: true,
    },
    // Weight associated with the sub-attribute
    weight: {
        type: Number,
        required: true
    },
    // Reference to the Designation model
    designation: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Designation'
    },
}, {timestamps: true});  // Enable automatic timestamping for createdAt and updatedAt fields

// Create a compound index on the 'name' and 'designation' fields, ensuring uniqueness
SubAttributeSchema.index({ name: 1, designation: 1 }, { unique: true });

// Create and export the SubAttribute model based on the schema
module.exports = mongoose.model("SubAttribute", SubAttributeSchema);
