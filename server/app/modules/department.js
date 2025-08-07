const Department = require("../models/Department");
const User = require("../models/User");

module.exports = {
    // Define a route handler function for the "departments" route
    departments: async (req, res) => {
        // Query the database to retrieve a list of departments
        let departments = await Department.find().lean();

        return res.json({success: true, departments});
    },

    // Define a route handler function for the "departmentsJSON" route
    departmentsJSON: async (req, res) => {
        try {
            let departments = await Department.find().lean();

            return res.json({success: true, departments});
        } catch (error) {
            console.error('Error fetching departments:', error); // Server-side error logging
            res.status(500);

            return res.json({success: false, error: "An error occurred"});
        }
    },

    // Handle department form submission
    postDepartment: async (req, res) => {
        let departmentName = req.body.departmentName;

        // Redirect back to department page if department already exists
        let department = await Department.findOne({departmentName: departmentName});

        if(department) {
            return res.json({success: true, message: "Department already exists"});
        }

        // Create new department within database
        await Department.create({
            departmentName: departmentName
        });

        return res.json({success: true, message: "Department added successfully"});
    },

    getDepartmentById: async (req, res) => {
        try{
            const id = req.params.id;
            const department = await Department.findById(id);

            if (!department) {
                return res.json({success: false, message: 'Department not found'});
            }

        } catch (error) {
            console.error('Error fetching department by id: ', error);
            res.status(500);

            return res.json({success: false, message: 'Internal server error'});
        }
    },

    editDepartment: async (req, res) => {
        const { departmentId, departmentName } = req.body;

        // Validate the department name
        if (!departmentName || typeof departmentName !== 'string' || departmentName.trim() === "") {
            return res.json({success: false, message: "Invalid Department Name"});
        }

        // Find the department and update its name
        try {
            await Department.findByIdAndUpdate(departmentId, {
                departmentName: departmentName.trim() // Use the trimmed name for consistency
            });

            return res.json({success: true, message: "Department updated successfully"});
        } catch (err) {
            // Handle possible errors, like a non-existing departmentId
            console.error(err);
            res.status(500);

            return res.json({success: false, message: "An error occurred while updating the department name."});
        }
    },

    deleteDepartment: async (req, res) => {
        const { departmentId } = req.body;

        try {
            await Department.findByIdAndDelete(departmentId);

            return res.json({success: true, message: "Department deleted successfully"});
        } catch (error) {
            console.error(error);
            return res.status(500).send("An error occurred while deleting the department");
        }
    },

    getEmployeesByDepartment: async (req, res) => {
        try {
            const departmentId = req.params.departmentId;
            const employees = await User
                .find({ department: departmentId })
                .populate('department')
                .populate('designation')
                .populate('jobGrade')
                .lean();

            return res.json({success: true, employees});
        } catch (error) {
            console.error('Error fetching employees:', error);
            res.status(500);

            return res.json({success: false, error: "An error occurred"});
        }
    },

    getAllDepartments: async (req, res) => {
        try {
            const departments = await Department.find();
            return res.json({success: true, departments});
        } catch (error) {
            console.error('Error fetching departments:', error);
            return res.status(500).json({success: false, error: "An error occurred"});
        }
    },

}