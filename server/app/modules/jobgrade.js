const jobgrade = require("../models/JobGrade");
const department = require("../models/Department");
const designation = require("../models/Designation");
const User = require("../models/User");
const {t} = require("../i18n");

module.exports = {
    getJobgradeById: async (req, res) => {
        try {
            const jobGradeId = req.params.id;
            const jobGrade = await jobgrade.findById(jobGradeId).populate('department').populate('designation').lean();

            return res.json({success: true, jobGrade});
        } catch (error) {
            console.error('Error fetching job grade:', error);
            res.status(500);

            return res.json({success: false, message: "Internal server error"});
        }
    },

    getDesignationsByDepartment: async (req, res) => {
        try {
            const departmentId = req.params.departmentId;
            const designations = await designation.find({ department: departmentId });

            return res.json({success: true, designations});
        } catch (error) {
            console.error('Error fetching designations: ', error);
            res.status(500);

            return res.json({success: false, message: "Internal server error"});
        }
    },

    filterJobGradesByDepartment: async (req, res) => {
        try {
            const departmentId = req.query.departmentId;

            // Check if departmentId is valid
            if (!departmentId || departmentId === "null") {
                return res.status(400).json({success: false, message: "Invalid department ID"});
            }

            let jobGrades = await jobgrade
                .find({ department: departmentId })
                .populate('designation')
                .populate('department').exec();

            return res.json({success: true, jobGrades});
        } catch (error) {
            console.error('Error fetching job grades: ', error);
            res.status(500);

            return res.json({success: false, message: "Internal server error"});
        }
    },

    getJobgrades: async (req, res) => {
        try {
            let jobgrades = await jobgrade.find().populate('department').populate('designation').lean();
            let departments = await department.find().lean();
            let designations = await designation.find().lean();

            //generate range of grades
            const grades = Array.from({ length: 20 }, (_, i) => i + 1);

            return res.json({success: true, jobgrades, departments, designations, grades, });
        } catch (error) {
            console.error('Error fetching jobgrades: ', error);
            res.status(500);

            return res.json({success: false, message: "Internal server error"});
        }
    },
    postJobgrade: async (req, res) => {
        const { jobGradeName, department: departmentId, designation: designationId, percentageCarry } = req.body;

        try {
            // Check if a job grade with the same designation and department already exists
            const existingJobGrade = await jobgrade.findOne({ designation: designationId, department: departmentId });

            if (existingJobGrade) {
                return res.json({success: false, message: "A job grade already exists for this designation in this department."});
            }

            // Create a new job grade if it doesn't exist
            await jobgrade.create({ jobGradeName, department: departmentId, designation: designationId, percentageCarry });

            return res.json({success: true, message: "Job grade created successfully."});
        } catch (error) {
            console.error('Error creating jobgrade: ', error);
            res.status(500);
            return res.json({success: false, message: "Internal server error"});
        }
    },

    checkJobGradeExists: async (req, res) => {
        try {
            const jobGradeName = req.params.jobGradeName;
            const existingJobGrade = await jobgrade.findOne({ jobGradeName: jobGradeName });

            if (existingJobGrade) {
                return res.json({ exists: true });
            } else {
                return res.json({ exists: false });
            }
        } catch (error) {
            console.error('Error checking if job grade exists:', error);
            return res.status(500).json({success: false, message: 'Internal Server Error' });
        }
    },

    deleteJobgrade: async (req, res) => {
        try {
            const jobGradeId = req.body.jobGradeId;

            // Employees need a job grade to be appraised, so refuse while any still have this one
            const employees = await User.countDocuments({ jobGrade: jobGradeId });
            if (employees > 0) {
                return res.json({ success: false, message: t(req, "jobGradeInUse", { employees }) });
            }

            await jobgrade.deleteOne({ _id: jobGradeId });
            res.json({ success: true, message: "Job grade deleted successfully." });
        } catch (error) {
            console.error('Error deleting jobgrade:', error);
            res.status(500).json({success: false, message: 'Internal Server Error' });
        }
    },

    updateJobgrade: async (req, res) => {
        const { jobGradeId } = req.params;
        const { jobGradeName, department, designation, percentageCarry } = req.body;

        try {
            await jobgrade.findByIdAndUpdate(jobGradeId, {
                jobGradeName,
                department,
                designation,
                percentageCarry
            });

            return res.json({success: true, message: "Job grade updated successfully."});
        } catch (error) {
            console.error('Error updating job grade:', error);

            res.status(500);
            return res.json({success: false, message: "Internal server error"});
        }
    },

    getAllJobGrades: async (req, res) => {
        try {
            const jobGrades = await jobgrade.find();
            return res.json({success: true, jobGrades});
        } catch (error) {
            console.error('Error fetching job grades:', error);
            return res.status(500).json({success: false, error: "An error occurred"});
        }
    },
}