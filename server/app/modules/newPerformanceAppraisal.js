const User = require("../models/User");
const Attribute = require("../models/Attribute");
const PerformanceAppraisal = require("../models/PerformanceAppraisal");
const Designation = require("../models/Designation");
const Department = require("../models/Department");
const {getNewPerformanceAppraisalStats, createAppraisalPdf, createEmailTemplate, sendMail, notifyUser} = require("../functions");
const path = require("path");
const fs = require("fs");

module.exports = {
    getEmployeeNames: async function (req, res) {
        try {
            let employees = await User
                .find({}, "name _id role")
                .populate("role")
                .lean();

            return res.status(200).json({success: true, employees: employees.filter(employee => !(employee.role.name === "Admin" || employee.role.name === "Super Admin") && employee._id.toString() !== res.locals.user._id.toString())});
        } catch (e) {
            return res.status(500).json({success: false, message: "Error getting employees."})
        }
    },
    getEmployeeDetails: async function (req, res) {
        try {
            const {employeeId} = req.params;

            const employee = await User
                .findById(employeeId, {password: 0})
                .populate("role")
                .populate("department")
                .populate("designation")
                .populate("jobGrade");

            // Get appraisal input data
            const attributes = await Attribute.find({
                designation: employee.designation._id,
                jobGrade: employee.jobGrade._id
            });

            return res.status(200).json({success: true, employee, attributes});
        } catch (e) {
            console.error(e);
            return res.status(500).json({success: false, message: "Error getting employee details."})
        }
    },
    createDesignation: async function (req, res) {
        try {
            const {designationName, departmentId, lead} = req.body;

            // Check if designation already exists
            const designationExists = await Designation.findOne({name: designationName});

            if (designationExists) {
                return res.status(400).json({success: false, message: "Designation already exists."});
            }

            const designation = new Designation({
                name: designationName,
                department: departmentId,
            });

            await designation.save();

            if(lead) {
                const department = await Department.findById(departmentId);

                if(department.leadDesignation) {
                    return res.status(400).json({success: false, message: "Department already has a lead designation."});
                }

                department.leadDesignation = designation._id;
                await department.save();
            }

            return res.status(200).json({success: true, message: "Designation created successfully."});
        } catch (e) {
            return res.status(500).json({success: false, message: "Error creating designation."})
        }
    },
    createAttribute: async function (req, res) {
        try {
            const {
                category,
                name,
                designation,
                jobGrade,
                subAttributes
            } = req.body;

            // Check if subattributes weight sum is 100
            const totalWeight = subAttributes.reduce((acc, curr) => parseInt(acc) + parseInt(curr.weight), 0);

            if (totalWeight !== 100) {
                return res.status(400).json({success: false, message: "Sub-attributes weight sum should be 100."});
            }

            // Sub-attribute: {name: String, weight: Number}
            const attribute = new Attribute({
                category,
                name,
                designation,
                jobGrade,
                subAttributes
            });

            await attribute.save();

            return res.status(200).json({success: true, message: "Attribute created successfully."});
        } catch (e) {
            return res.status(500).json({success: false, message: "Error creating attribute."})
        }
    },
    getAppraisalInfo: async function(req, res) {
        try {
            const {performanceAppraisalId} = req.params;

            let appraisal = await PerformanceAppraisal
                .findById(performanceAppraisalId)
                .populate("reviewedBy", "-password")
                .populate("appraiserComments.user", "-password")
                .populate("supervisor", "-password")
                .populate("surveyId")
                .lean();

            // Process stats
            appraisal = Object.assign(appraisal, {stats: getNewPerformanceAppraisalStats(appraisal)});

            return res.status(200).json({success: true, appraisal});
        } catch (e) {
            console.error(e);
            return res.status(500).json({success: false, message: "Error getting appraisal info."})
        }
    },
    getAppraisals: async function (req, res) {
        const { employeeId } = req.params;
    
        try {
            // Check if user has permission for own department or all
            let onlyOwnDepartment = res.locals.userPermissions.some(permission =>
                ['own_department'].includes(permission.name)
            );
    
            let appraisals;
            let userData = await User.findOne({ employeeId: res.locals.user.employeeId }, { password: 0 })
                .populate('department', 'departmentName')
                .populate('designation', 'name')
                .populate('role', 'name')
                .populate('jobGrade', 'jobGradeName')
                .lean();
    
            if (employeeId) {
                // Fetch appraisals for the specific employee
                if (onlyOwnDepartment) {
                    appraisals = await PerformanceAppraisal.find({
                        "employeeDetails.employeeId": employeeId,
                        "employeeDetails.department": userData.department.departmentName
                    });
                } else {
                    appraisals = await PerformanceAppraisal.find({
                        "employeeDetails.employeeId": employeeId
                    });
                }
            } else {
                // Fetch appraisals for the whole department or all appraisals
                if (onlyOwnDepartment) {
                    appraisals = await PerformanceAppraisal.find({
                        "employeeDetails.department": userData.department.departmentName
                    });
                } else {
                    appraisals = await PerformanceAppraisal.find({});
                }
            }
    
            // Create and extend performance appraisal stats
            const extendedPerformanceAppraisals = appraisals.map(appraisal => {
                return {
                    ...appraisal.toObject(),
                    stats: getNewPerformanceAppraisalStats(appraisal)
                };
            });
    
            return res.status(200).json({ success: true, appraisals: extendedPerformanceAppraisals });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ success: false, message: "Error getting appraisals." });
        }
    },
    
    createAppraisal: async function (req, res) {
        try {
            const {
                employeeId,
                appraisalData,
                timePeriod,
                appraisalDate,
                percentageCarries,
                appraiserComments,
            } = req.body;

            // Get employee details
            const employee = await User
                .findById(employeeId)
                .populate("designation", "name")
                .populate("department", "_id departmentName leadDesignation")
                .populate("jobGrade", "jobGradeName");

            // Create employee details object
            const employeeDetails = {
                name: employee["name"],
                employeeId: employee["employeeId"],
                designation: employee["designation"]["name"],
                department: employee["department"]["departmentName"],
                jobGrade: employee["jobGrade"]["jobGradeName"],
                dateOfJoining: employee["dateJoined"]
            };

            // Create attribute percentage carry object
            const attributePercentageCarry = {
                KnowHow: percentageCarries["Know-How"],
                ProblemSolving: percentageCarries["Problem-Solving"],
                Accountability: percentageCarries["Accountability"]
            };

            const appraiserCommentsObject = {
                message: appraiserComments,
                user: res.locals.user._id,
                timestamp: new Date()
            }

            // Appraisal data
            const createdAppraisal = await PerformanceAppraisal.create({
                employeeId,
                employeeDetails,
                timePeriod,
                appraisalDate,
                attributePercentageCarry,
                appraisalData,
                appraiserComments: appraiserCommentsObject,
                reviewedBy: res.locals.user._id,
            });

            // Process performance appraisal
            const extendedPerformanceAppraisal = getNewPerformanceAppraisalStats({
                employeeId,
                employeeDetails,
                timePeriod,
                appraisalDate,
                attributePercentageCarry,
                appraisalData,
                appraiserComments: appraiserCommentsObject,
                reviewedBy: res.locals.user._id
            });

            (async () => {
                let uuid = await createAppraisalPdf(employeeDetails, timePeriod, appraiserComments, extendedPerformanceAppraisal, createdAppraisal._id.toString());

                // Create email prompt
                let emailTemplate = await createEmailTemplate(`
                    <p>Dear ${employeeDetails.name},</p>
                    <p>A performance appraisal has been created for you for ${timePeriod}. Please check it out in your platform account.</p>
                    <p>You can access the performance appraisal created for you in this email attached below.</p>
                    <p>For full details, you may do so in your account through Profile &gt Performance Appraisal section.</p>
                `)

                // Send email
                let fileStreamAsBase64 = fs.readFileSync(path.resolve(process.cwd(), "resources/uploads", `${uuid}`), {encoding: 'base64'});

                await sendMail(
                    employee.email,
                    "Performance Appraisal Created",
                    emailTemplate,
                    [
                        {
                            filename: `${employeeDetails.name}'s Performance Appraisal (${timePeriod}).pdf`,
                            content: fileStreamAsBase64,
                            encoding: 'base64'
                        }
                    ]
                );
            })().then(() => {
                console.log("Email sent.");
            });

            return res.status(200).json({success: true, message: "Appraisal created successfully."});
        } catch (e) {
            console.error(e);
            return res.status(500).json({success: false, message: "Error creating appraisal."})
        }
    },
    updateAppraisal: async function (req, res) {
        try {
            const {
                performanceAppraisalId,
                appraisalData,
                appraiserComments,
            } = req.body;

            const appraiserCommentsObject = {
                message: appraiserComments,
                user: res.locals.user._id,
                timestamp: new Date()
            }

            // Get old appraisal data
            const oldAppraisal = await PerformanceAppraisal.findById(performanceAppraisalId).populate("employeeId");

            if(!oldAppraisal) {
                return res.status(404).json({success: false, message: "Appraisal not found."});
            }

            // Update appraisal data
            oldAppraisal.appraisalData = appraisalData;
            oldAppraisal.appraiserComments = appraiserCommentsObject;
            oldAppraisal.reviewedBy = res.locals.user._id;

            oldAppraisal.markModified("appraisalData");

            await oldAppraisal.save();

            // Process performance appraisal
            const extendedPerformanceAppraisal = getNewPerformanceAppraisalStats(oldAppraisal.toObject());

            (async () => {
                let uuid = await createAppraisalPdf(oldAppraisal.employeeDetails, oldAppraisal.timePeriod, appraiserComments, extendedPerformanceAppraisal, oldAppraisal._id.toString());

                // Create email prompt
                let emailTemplate = await createEmailTemplate(`
                    <p>Dear ${oldAppraisal.employeeDetails.name},</p>
                    <p>Performance appraisal ${oldAppraisal.timePeriod} has been updated. Please check it out in your platform account.</p>
                    <p>You can access the performance appraisal created for you in this email attached below.</p>
                    <p>For full details, you may do so in your account through Profile &gt Performance Appraisal section.</p>
                `)

                // Send email
                let fileStreamAsBase64 = fs.readFileSync(path.resolve(process.cwd(), "resources/uploads", `${uuid}`), {encoding: 'base64'});

                await sendMail(
                    oldAppraisal.employeeId.email,
                    "Performance Appraisal Created",
                    emailTemplate,
                    [
                        {
                            filename: `${oldAppraisal.employeeDetails.name}'s Performance Appraisal (${oldAppraisal.timePeriod}).pdf`,
                            content: fileStreamAsBase64,
                            encoding: 'base64'
                        }
                    ]
                );
            })().then(() => {
                console.log("Email sent.");
            });

            return res.status(200).json({success: true, message: "Appraisal updated successfully."});
        } catch (e) {
            console.error(e);
            return res.status(500).json({success: false, message: "Error updating appraisal."})
        }
    },
    downloadAppraisalPdf: async function (req, res) {
        try {
            const {performanceAppraisalId} = req.params;

            const appraisal = await PerformanceAppraisal.findById(performanceAppraisalId);

            if(!appraisal) {
                return res.status(404).json({success: false, message: "Appraisal not found."});
            }

            let pdfPath = path.resolve(process.cwd(), "resources/uploads", `${appraisal.pdf}`);

            if (!fs.existsSync(pdfPath)) {
                console.warn("Appraisal PDF not found. Creating a new one.");
                const extendedPerformanceAppraisal = getNewPerformanceAppraisalStats(appraisal.toObject());

                let pdfUuid = await createAppraisalPdf(appraisal.employeeDetails, appraisal.timePeriod, appraisal.appraiserComments.message, extendedPerformanceAppraisal, appraisal._id.toString());
                pdfPath = path.resolve(process.cwd(), "resources/uploads", `${pdfUuid}`);
            }

            return res.download(pdfPath, `${appraisal.employeeDetails.name}'s Performance Appraisal (${appraisal.timePeriod}).pdf`);
        } catch (e) {
            console.error(e);
            return res.status(500).json({success: false, message: "Error downloading appraisal PDF."})
        }
    },
    deleteAppraisal: async function (req, res) {
        try {
            const {performanceAppraisalId} = req.body;

            const appraisal = await PerformanceAppraisal.findById(performanceAppraisalId);

            if(!appraisal) {
                return res.status(404).json({success: false, message: "Appraisal not found."});
            }

            const pdfPath = path.resolve(process.cwd(), "resources/uploads", `${appraisal.pdf}`);

            if (fs.existsSync(pdfPath)) {
                fs.unlinkSync(pdfPath);
            }

            await appraisal.deleteOne();

            return res.status(200).json({success: true, message: "Appraisal deleted successfully."});
        } catch (e) {
            console.error(e);
            return res.status(500).json({success: false, message: "Error deleting appraisal."})
        }
    },
    setEmployeeComment: async function (req, res) {
        try {
            const {
                performanceAppraisalId,
                comment,
            } = req.body;

            const appraisal = await PerformanceAppraisal.findById(performanceAppraisalId);

            if(!appraisal) {
                return res.status(404).json({success: false, message: "Appraisal not found."});
            }

            if(appraisal.employeeId.toString() !== res.locals.user._id.toString()) {
                return res.status(403).json({success: false, message: "You are not authorized to set employee comment for this appraisal."});
            }

            appraisal.employeeComment = {
                message: comment,
                timestamp: new Date()
            };

            await appraisal.save();

            (async () => {
                // Remake PDF
                let extendedPerformanceAppraisal = getNewPerformanceAppraisalStats(appraisal.toObject());
                await createAppraisalPdf(appraisal.employeeDetails, appraisal.timePeriod, appraisal.appraiserComments.message, extendedPerformanceAppraisal, appraisal._id.toString());

                // Send notification
                let appraiser = await User.findById(appraisal.reviewedBy);
                await notifyUser(appraiser, `Employee ${res.locals.user.name} has commented on their appraisal ${appraisal.timePeriod}.\n"${comment}"`);

                // Send to appraiser email
                let emailTemplate = await createEmailTemplate(`
                <p>Employee ${res.locals.user.name} has commented on their appraisal ${appraisal.timePeriod}.</p>
                <p>"${comment}"</p>
            `);

                await sendMail(
                    appraiser.email,
                    "Employee Commented on Appraisal",
                    emailTemplate
                );
            })().then(() => {
                console.log("Email sent.");
            }).catch(e => {
                console.error(e);
            });

            return res.status(200).json({success: true, message: "Employee comment set successfully."});
        } catch (e) {
            console.error(e);
            return res.status(500).json({success: false, message: "Error setting employee comment."})
        }
    }
}