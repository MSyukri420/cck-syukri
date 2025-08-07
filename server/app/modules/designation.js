const Designation = require("../models/Designation");
const Department = require("../models/Department");
const User = require("../models/User");

module.exports = {
    // Define an asynchronous function named getDesignations, which takes req (request) and res (response) as parameters.
    getDesignations: async (req, res) => {
        try {
            // Use the Designation model to find all designations and populate the 'department' field with related department information. 
            let designations = await Designation.find().populate('department')
            // Convert the result to plain JavaScript objects.
            .lean();

            // Use the Department model to find all departments.
            let departments = await Department.find()
            // Convert the result to plain JavaScript objects.
            .lean();

            // Send a JSON response containing the array of designations and departments.
            return res.json({ success: true, designations, departments });
        } catch (error) {
            // Handle errors that occur during the execution of the try block. Log the error and send a 500 Internal Server Error response.
            console.error('Error fetching designations: ', error);
            res.status(500);

            return res.json({ success: false, message: 'Internal server error' });
        }
    },
    // Define an asynchronous function named postDesignation, which takes req (request) and res (response) as parameters.
    postDesignation: async (req, res) => {
        let name = req.body.name;
        let departmentId = req.body.department;
        let isLead = req.body.isLead;

        // Check if a lead already exists in the department
        if (isLead) {
            const existingLead = await Designation.findOne({ department: departmentId, isLead: true });
            if (existingLead) {
                return res.json({ success: false, message: 'Leader already exists in this department' });
            }
        }
        let existingDesignation = await Designation.findOne({ name: name, department: departmentId });

        if (existingDesignation) {
            return res.json({ success: false, message: 'Designation already exists' });
        }

        await Designation.create({
            name: name,
            department: departmentId,
            isLead: isLead
        });

        return res.json({ success: true, message: 'Designation added successfully' });
    },

    // Define an asynchronous function named getDesignationById, which takes req (request) and res (response) as parameters.
    getDesignationById: async (req, res) => {
        try {
            // Extract the 'id' parameter from the request parameters.
            const id = req.params.id;

            // Use the Designation model to find a designation by its ID, populating the 'department' field with related department information.
            const designation = await Designation.findById(id).populate('department');

            // If no designation is found with the given ID, send a 400 Bad Request response with an error message.
            if (!designation) {
                return res.json({ success: false, message: 'Designation not found' });
            }

            return res.json({ success: true, designation: designation.toObject() });
        } catch (error) {
            // Handle errors that occur during the execution of the try block. Log the error and send a 500 Internal Server Error response.
            console.error('Error fetching designation by id: ', error);
            res.status(500);

            return res.json({ success: false, message: 'Internal server error' });
        }
    },

    // Define an asynchronous function named editDesignation, which takes req (request) and res (response) as parameters.
    editDesignation: async (req, res) => {
        const { designationId, name, departmentId, isLead } = req.body;

        // Check if a lead already exists in the department
        if (isLead) {
            const existingLead = await Designation.findOne({ department: departmentId, isLead: true });
            if (existingLead && existingLead._id.toString() !== designationId) {
                return res.json({ success: false, message: 'Leader already exists in this department' });
            }
        }

        if (!name || typeof name !== 'string' || name.trim() === "") {
            return res.json({ success: false, message: 'Invalid Designation Name' });
        }

        try {
            await Designation.findByIdAndUpdate(designationId, {
                name: name.trim(),
                department: departmentId,
                isLead: isLead
            });

            return res.json({ success: true, message: 'Designation updated successfully' });
        } catch (err) {
            console.error(err);
            res.status(500);

            return res.json({ success: false, message: 'Internal server error' });
        }
    },

    // Define an asynchronous function named deleteDesignation, which takes req (request) and res (response) as parameters.
    deleteDesignation: async (req, res) => {
        // Destructure value from the request body: designationId.
        const { designationId } = req.body;
        try {
            // Use the Designation model to find and delete the designation by its ID.
            await Designation.findByIdAndDelete(designationId);

            return res.json({ success: true, message: 'Designation deleted successfully' });
        } catch (error) {
            // Handle errors that occur during the update process. Log the error and send a 500 Internal Server Error response with an error message.
            console.error(error);
            res.status(500);

            return res.json({ success: false, message: 'Internal server error' });
        }
    },
    // Define an asynchronous function named getUsersByDesignation that takes request (req) and response (res) objects as parameters
    getUsersByDesignation: async (req, res) => {
        try {
            // Extract the designationId from the parameters of the incoming request (req.params)
            const designationId = req.params.designationId;

            // Use the User model to find all users whose designation matches the specified designationId and convert the results to plain JavaScript objects
            let users = await User.find({
                designation: designationId
            })
            .populate('department')
            .lean();

            // If the client is a React application, send a JSON response containing the array of users
            return res.json({ success: true, users });
        
        // If an error occurs during the execution of the try block, catch the error
        } catch(error) {
            // Log the error message to the console
            console.error("Error fetching employee names by designation:", error);
            // Set the HTTP status code to 500 (Internal Server Error)
            res.status(500);

            // If the client is a React application, send a JSON response with an error message
            return res.json({ success: false, message: "An error occurred while fetching performance appraisals." });
        }
    },
    getAllDesignations: async (req, res) => {
        try {
            const designations = await Designation.find();
            return res.json({success: true, designations});
        } catch (error) {
            console.error('Error fetching designations:', error);
            return res.status(500).json({success: false, error: "An error occurred"});
        }
    },

}