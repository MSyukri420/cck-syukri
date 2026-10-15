// Import necessary modules and functions using 'require'
const User = require("../models/User");
const Department = require("../models/Department");
const Designation = require("../models/Designation");
const Attribute = require("../models/Attribute");
const PerformanceAppraisal = require("../models/PerformanceAppraisal");
const {hashPassword, comparePassword, createSessionToken, verifySessionToken, getNewPerformanceAppraisalStats} = require("../functions");
const path = require('path');
const fs = require("fs");
const Role = require('../models/Role');
const Survey = require('../models/Survey');
const crypto = require('crypto');
const RateLimit = require('../models/RateLimit');
const {t} = require('../i18n');
const transporter = require('../mail-config');
const {kEMAIL_FROM, kEMAIL_USERNAME, kSMTP_USER, kAPP_URL} = require("../../constants");
const {generateEmployeeId} = require('../functions');

// Counts attempts per key within a time window. Stored in MongoDB (see models/RateLimit.js), so limits
// survive restarts and apply across every copy of the server.
function attemptLimiter({ name, max, windowMs }) {
    const idFor = (key) => `${name}:${key}`;
    return {
        // Minutes until the key may try again, or 0 when it isn't blocked
        blockedFor: async (key) => {
            const entry = await RateLimit.findById(idFor(key)).lean();
            if (!entry || entry.expiresAt <= new Date() || entry.count < max) return 0;
            return Math.ceil((entry.expiresAt.getTime() - Date.now()) / 60000);
        },
        record: async (key) => {
            const now = new Date();
            // MongoDB removes expired counters within about a minute; restart any that have expired already
            await RateLimit.updateOne({ _id: idFor(key), expiresAt: { $lte: now } }, { $set: { count: 0, expiresAt: new Date(now.getTime() + windowMs) } });
            await RateLimit.updateOne(
                { _id: idFor(key) },
                { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(now.getTime() + windowMs) } },
                { upsert: true },
            );
        },
        reset: (key) => RateLimit.deleteOne({ _id: idFor(key) }),
    };
}

// Failed logins: 10 per email from one address, and 50 per address across all emails, per 15 minutes
const failedLoginsPerAccount = attemptLimiter({ name: "login-account", max: 10, windowMs: 15 * 60 * 1000 });
const failedLoginsPerAddress = attemptLimiter({ name: "login-address", max: 50, windowMs: 15 * 60 * 1000 });
// Password reset emails: 5 requests per address per 15 minutes
const resetRequestsPerAddress = attemptLimiter({ name: "reset-address", max: 5, windowMs: 15 * 60 * 1000 });

// Reset tokens are stored hashed so a database leak doesn't expose working reset links
const hashResetToken = (token) => crypto.createHash("sha256").update(String(token)).digest("hex");

const checkDepartmentPermission = (user) => {
    return user.role.permissions.some(permission =>
        ['own_department'].includes(permission.name)
    );
};

const getLastPerformanceReviewDate = async (employeeId) => {
    const lastAppraisal = await PerformanceAppraisal.findOne({ employeeSelect: employeeId })
                                .sort({ appraisalDate: -1 }) // Sort by date in descending order
                                .lean();
    return lastAppraisal ? lastAppraisal.appraisalDate : null;
};

async function sendEmail({ to, subject, text }) {
    const mailOptions = {
        from: kEMAIL_FROM || kSMTP_USER || kEMAIL_USERNAME,
        to,
        subject,
        text
    };

    try {
        const result = await transporter.sendMail(mailOptions);
        console.log('Email sent:', result);
        return result;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

// Exporting functions created using 'module.exports'
module.exports = {
    // Render avatar
    avatar: async (req, res) => {
        try {
            // Get the username from the request parameters
            const {usernameOrEmployeeId} = req.params;

            // Find the user based on the provided username
            let user = await User.findOne({
                $or: [
                    { username: usernameOrEmployeeId },
                    { employeeId: usernameOrEmployeeId }
                ]
            });

            if(!user) {
                return res.status(404).send("Not found");
            }

            let profilePicturePath;

            // Get user profile picture
            if(user.profilePicture) {
                profilePicturePath =  path.resolve(process.cwd(), "resources/uploads", user.profilePicture);
            } else {
                profilePicturePath = path.resolve(process.cwd(), "resources/public/img/user.jpg");
            }

            // Check profile picture existence
            if(!fs.existsSync(profilePicturePath)) {
                profilePicturePath = path.resolve(process.cwd(), "resources/public/img/user.jpg");
            }

            // sendFile sets the image's Content-Type from its extension
            return res.sendFile(profilePicturePath);
        } catch (e) {
            console.error(e);
            return res.status(500).send("Internal server error");
        }
    },
    // Checks to see whether user has logged in or not
    postLogin: async (req, res) => {
        // Strings only, so a JSON object like {"$ne": null} can't be used as a query operator
        let email = String(req.body.email || "").trim();
        let password = String(req.body.password || "");

        const accountKey = `${req.ip}|${email.toLowerCase()}`;
        const waitMinutes = Math.max(await failedLoginsPerAccount.blockedFor(accountKey), await failedLoginsPerAddress.blockedFor(req.ip));
        if (waitMinutes > 0) {
            return res.status(429).json({success: false, message: t(req, "loginLocked", {minutes: waitMinutes})});
        }
        const loginFailed = async () => {
            await failedLoginsPerAccount.record(accountKey);
            await failedLoginsPerAddress.record(req.ip);
            return res.json({success: false, message: t(req, "invalidLogin")});
        };

        let user = await User.findOne({email: email});
        if(!user) {
            return loginFailed();
        }

        let isMatch = await comparePassword(password, user.password);
        if(!isMatch) {
            return loginFailed();
        }
        await failedLoginsPerAccount.reset(accountKey);

        let sessionToken = await createSessionToken(user.username, user.role);

        res.cookie("sessionToken", sessionToken, {
            httpOnly: true,
        });

        return res.json({success: true, message: "Logged in successfully"});
    },

    // Handle logout
    logout: (req, res) => {
        res.clearCookie("sessionToken");

        return res.json({success: true, message: "Logged out successfully"});
    },

    // Render 'register' page
    register: async (req, res) => {
        const departments = await Department.find().lean();
        const designations = await Designation.find().lean();

        return res.json({departments: departments, designations: designations});
    },
    // Handle registration form submission
    postRegister: async (req, res) => {
        let username = req.body.username;
        let name = req.body.name;
        let email = req.body.email;
        let password = req.body.password;
        let repeatPassword = req.body.repeatPassword;
        let phone = req.body.phone;
        let department = req.body.department;
        let designation = req.body.designation;
        let role = req.body.role;

        if (!username || !name || !email || !password || !repeatPassword || !phone || !department || !designation || !role) {
            return res.json({success: false, message: "Please fill in all fields"});
        }

        if(password !== repeatPassword) {
            return res.json({success: false, message: "Passwords do not match"});
        }

        let employeeId = await generateEmployeeId();

        let user = await User.findOne({email: email});

        if(user) {
            return res.json({success: false, message: "Email already exists"});
        }

        // Only a Super Admin may create another Super Admin
        let selectedRole = await Role.findById(role).lean();
        if (!selectedRole) {
            return res.json({success: false, message: "Role not found"});
        }
        if (selectedRole.name === "Super Admin" && res.locals.user.role.name !== "Super Admin") {
            return res.status(403).json({success: false, message: t(req, "roleNotAllowed")});
        }

        let depart = await Department.findOne({ departmentName: department });
        let desig = await Designation.findOne({ name: designation });

        await User.create({
            employeeId: employeeId,
            username: username,
            name: name,
            email: email,
            password: password, // hashed by the User pre-save hook
            phone: phone,
            department: depart,
            designation: desig,
            role: selectedRole._id
        });

        return res.json({success: true, message: "User registered successfully"});
    },


    changePassword: async function (req, res) {
        const { currentPassword, newPassword } = req.body;
        const user = res.locals.user;
    
        try {
            const isMatch = await comparePassword(currentPassword, user.password);
            if (!isMatch) {
                return res.json({ success: false, message: 'Current password is incorrect' });
            }
    
            const hashedPassword = await hashPassword(newPassword);
            await User.findByIdAndUpdate(user._id, { password: hashedPassword });
    
            return res.json({ success: true, message: 'Password changed successfully' });
        } catch (error) {
            console.error('Failed to change password:', error);
            return res.status(500).json({ success: false, message: 'Failed to change password' });
        }
    },


    forgotPassword: async (req, res) => {
        const email = req.body.email ? String(req.body.email).trim() : "";
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        // Limit reset emails per address so the form can't be used to flood someone's inbox
        const waitMinutes = await resetRequestsPerAddress.blockedFor(req.ip);
        if (waitMinutes > 0) {
            return res.status(429).json({ success: false, message: t(req, "resetLimited", {minutes: waitMinutes}) });
        }
        await resetRequestsPerAddress.record(req.ip);

        try {
            const user = await User.findOne({ email });
            if (!user) {
                return res.json({ success: true, message: "If the email is registered, you will receive a reset link." });
            }

            const resetToken = crypto.randomBytes(20).toString('hex');
            user.resetPasswordToken = hashResetToken(resetToken);
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

            await user.save();

            // Built from configuration, not request headers, so a forged Origin cannot redirect the reset link
            const resetUrl = `${kAPP_URL}/reset-password/${resetToken}`;
            const text = `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
                        `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
                        `${resetUrl} \n\n` +
                        `If you did not request this, please ignore this email and your password will remain unchanged.\n`;

            await sendEmail({
                to: user.email,
                subject: 'Password Reset Request',
                text
            });

            res.json({ success: true, message: "An email has been sent to your email address with further instructions." });
        } catch (err) {
            console.error('Error in forgotPassword:', err);
            res.status(500).json({ success: false, message: "Server error" });
        }
    },

    resetPassword: async (req, res) => {
        const { token } = req.params;
        const { password } = req.body;

        if (!password || String(password).length < 6) {
            return res.status(400).json({ success: false, message: t(req, "passwordTooShort") });
        }

        try {
            const user = await User.findOne({
                resetPasswordToken: hashResetToken(token),
                resetPasswordExpires: { $gt: Date.now() }
            });

            if (!user) {
                return res.status(400).json({ success: false, message: "Password reset token is invalid or has expired." });
            }

            user.password = password; 
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            await user.save();

            res.json({ success: true, message: "Your password has been updated." });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Server error" });
        }
    },

    getAvatar: async (req, res) => {
        try {

        } catch (e) {
            console.error(e);
            return res.status(500).send(e.message);
        }
    },


    dashboard: async (req, res) => {
        const user = res.locals.user;
    
        const superAdminRole = await Role.findOne({ name: 'Super Admin' }).lean();
        const superAdminRoleId = superAdminRole._id;
        let filter;
        filter = { role: { $ne: superAdminRoleId } };
    
        if (user.department) {
            user.department = await Department.findById(user.department);
        }
    
        let appraisals = [];
        let ownAppraisals;
        let appraisalFilter = {};
        const departmentPermission = checkDepartmentPermission(user);
        if (departmentPermission) {
            if (user.department) {
                filter = { ...filter, department: user.department._id };
                appraisalFilter = { "employeeDetails.department": user.department.departmentName };
            } else {
                filter = { ...filter, department: null };
                appraisalFilter = { "employeeDetails.department": null };
            }
        }

        // Other people's appraisals only for roles whose dashboard shows them
        if (res.locals.userPermissions.some(permission => permission.name === 'appraisals_table')) {
            appraisals = await PerformanceAppraisal.find(appraisalFilter).limit(5).lean();
        }
    
        ownAppraisals = await PerformanceAppraisal.find({
            employeeId: user._id
        }).limit(5).lean();
    
        const extendedPerformanceAppraisals = appraisals.map(appraisal => ({
            ...appraisal,
            stats: getNewPerformanceAppraisalStats(appraisal)
        }));
    
        const extendedOwnPerformanceAppraisals = ownAppraisals.map(appraisal => ({
            ...appraisal,
            stats: getNewPerformanceAppraisalStats(appraisal)
        }));
    
        const employees = await User.find(filter)
            .populate('department', 'departmentName')
            .populate('designation', 'name')
            .populate('role', 'name')
            .limit(5)
            .lean();
    
        const filteredEmployees = employees.filter(employee => employee.role.name !== 'super admin');
    
        const departments = await Department.find().limit(5).lean();
        const designations = await Designation.find(filter)
            .populate('department', 'departmentName')
            .limit(5)
            .lean();
    
        for (const employee of filteredEmployees) {
            employee.lastAppraisalDate = await getLastPerformanceReviewDate(employee._id);
        }
        filteredEmployees.sort((a, b) => {
            if (!a.lastAppraisalDate) return 1;
            if (!b.lastAppraisalDate) return -1;
            return new Date(b.lastAppraisalDate) - new Date(a.lastAppraisalDate);
        });
    
        const attributes = await Attribute.find()
            .populate('designation', 'name')
            .populate('subAttributes', ['name', 'weight'])
            .limit(5)
            .lean();
    
        const remarksAppraisal = appraisals.map(appraisal => ({
            appraisalId: appraisal._id,
            username: appraisal.employeeDetails.name,
            appraisalDate: appraisal.appraisalDate,
            totalScore: getNewPerformanceAppraisalStats(appraisal)
        }));
    
        const surveys = await Survey.find().limit(5).lean();
    
        const totalEmployees = await User.countDocuments(filter);
        const totalDepartments = await Department.countDocuments();
        const totalDesignations = await Designation.countDocuments(filter);
        const totalAppraisal = await PerformanceAppraisal.countDocuments(appraisalFilter);
        const totalAttributes = await Attribute.countDocuments();

        return res.json({
            totalEmployees,
            totalDepartments,
            totalDesignations,
            totalAppraisal,
            totalAttributes,
            employees: filteredEmployees,
            departments,
            designations,
            appraisals: extendedPerformanceAppraisals,
            ownAppraisals: extendedOwnPerformanceAppraisals,
            attributes,
            remarksAppraisal,
            surveys,
        });
    },
    

    dashboardGraphs: async (req, res) => {
        const user = res.locals.user;
        
        const superAdminRole = await Role.findOne({ name: 'Super Admin' }).lean();
        const superAdminRoleId = superAdminRole._id;
        let userFilter = {};
        let appraisalFilter = {};
        if (user.role.name !== 'Super Admin') {
            userFilter.role = { $ne: superAdminRoleId };
        }
    
        if (user.department) {
            user.department = await Department.findById(user.department);
        }
    
        // Check department permissions
        const departmentPermission = checkDepartmentPermission(user);
        if (departmentPermission) {
            if (user.department) {
                userFilter.department = user.department._id;
                appraisalFilter['employeeDetails.department'] = user.department.departmentName;
            } else {
                userFilter.department = null;
                appraisalFilter['employeeDetails.department'] = null;
            }
        } 
    
        // Aggregate for employee counts by department
        const employeeCountsByDepartment = {};
        const employeeCounts = await User.aggregate([
            { $match: userFilter }, // Excludes super admins, and limits heads of department to their own department
            { $group: { _id: "$department", count: { $sum: 1 } } },
            {
                $lookup: {
                    from: "departments",
                    localField: "_id",
                    foreignField: "_id",
                    as: "departmentInfo"
                }
            },
            { $unwind: "$departmentInfo" },
            {
                $project: {
                    _id: 1,
                    count: 1,
                    departmentName: "$departmentInfo.departmentName",
                    createdAt: "$departmentInfo.createdAt"
                }
            },
            { $sort: { count: -1, createdAt: 1 } } // Sort by count descending and createdAt ascending
        ]);
    
        employeeCounts.forEach(item => {
            if (item.departmentName) {
                employeeCountsByDepartment[item.departmentName] = item.count;
            }
        });
    
        // Aggregate for appraisal counts by month
        const appraisalCountsByMonth = await PerformanceAppraisal.aggregate([
            { $match: appraisalFilter }, // Apply filter here
            {
                $project: {
                    // Ensure appraisalDate is treated as a date
                    convertedDate: {
                        $cond: {
                            if: { $eq: [{ $type: "$appraisalDate" }, "date"] },
                            then: "$appraisalDate",
                            else: { $dateFromString: { dateString: "$appraisalDate", format: "%Y-%m-%d" } }
                        }
                    }
                }
            },
            {
                $project: {
                    month: { $month: "$convertedDate" },
                    year: { $year: "$convertedDate" }
                }
            },
            {
                $group: {
                    _id: { month: "$month", year: "$year" },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]);
    
        // Aggregate for employee growth data
        const employeeGrowthData = await User.aggregate([
            { $match: userFilter },
            {
                $project: {
                    month: { $month: "$createdAt" },
                    year: { $year: "$createdAt" }
                }
            },
            {
                $group: {
                    _id: { month: "$month", year: "$year" },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]);
    
        // Aggregate for top performers
        const topPerformers = await PerformanceAppraisal.aggregate([
            { $match: appraisalFilter }, // Apply filter here
            // Newest first, so each employee's latest appraisal is the one kept below
            { $sort: { appraisalDate: -1, createdAt: -1 } },
            {
                $project: {
                    employeeId: 1,
                    attributePercentageCarry: 1,
                    appraisalData: 1
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "employeeId",
                    foreignField: "_id",
                    as: "employeeInfo"
                }
            },
            { $unwind: "$employeeInfo" },
            {
                $project: {
                    employeeId: 1,
                    employeeInfo: {
                        name: "$employeeInfo.name",
                        employeeId: "$employeeInfo.employeeId",
                        department: "$employeeInfo.department",
                        designation: "$employeeInfo.designation"
                    },
                    attributePercentageCarry: 1,
                    appraisalData: 1
                }
            }
        ]);
    
        // Calculate stats for each top performer and sort by total score; names and scores only for roles that show them
        const canSeeTopPerformers = res.locals.userPermissions.some(permission => permission.name === 'topPerformers_graph');
        // Rank people, not appraisals: one entry per employee, using their latest appraisal
        const seenEmployees = new Set();
        const latestPerEmployee = topPerformers.filter(appraisal => {
            const id = String(appraisal.employeeId);
            if (seenEmployees.has(id)) return false;
            seenEmployees.add(id);
            return true;
        });
        const topPerformersStats = (canSeeTopPerformers ? latestPerEmployee : []).map(performanceAppraisal => {
            const stats = getNewPerformanceAppraisalStats(performanceAppraisal);
            return {
                ...performanceAppraisal,
                stats
            };
        }).sort((a, b) => b.stats.totalScore - a.stats.totalScore).slice(0, 5);

        return res.json({
            employeeCountsByDepartment,
            appraisalCountsByMonth,
            employeeGrowthData,
            topPerformers: topPerformersStats
        });
    },       
    


    impersonate: async (req, res) => {
        const { role } = req.body;
        const user = res.locals.user;
    
        if (user.role === 'Admin' || user.realRole === 'Admin') {
            // If the real role is not already set, set it to the current role (Admin)
            const updateData = { role: role };
            if (!user.realRole) {
                updateData.realRole = user.role;
            }
    
            // Update the user in the database
            await User.findByIdAndUpdate(user._id, updateData);

            return res.json({success: true, message: "Impersonated successfully"});
        } else {
            res.status(403).send('Unauthorized');
        }
    },
    

    stopImpersonate: async (req, res) => {
        const user = res.locals.user;
    
        if (user.realRole === 'Admin') {
            // Revert to the original admin role
            await User.findByIdAndUpdate(user._id, { role: user.realRole, realRole: null });

            return res.json({success: true, message: "Stopped impersonating successfully"});
        } else {
            res.status(403).send('Unauthorized');
        }
    },
    needsLogin: (requiredAccess = []) => {
        return async (req, res, next) => {
            let sessionToken = req.cookies["sessionToken"];

            if (!sessionToken) {
                return res.status(401).json({success: false, message: "Unauthorized"});
            }

            let session = await verifySessionToken(sessionToken);
            if (!session) {
                return res.status(401).json({success: false, message: "Unauthorized"});
            }

            const user = await User.findOne({ username: session.username })
                .populate({
                    path: 'role',
                    populate: {
                        path: 'permissions',
                    },
                })
                .lean();

            if (!user || !user.role) {
                return res.status(401).json({success: false, message: "Unauthorized"});
            }

            res.locals.userPermissions = user.role.permissions.map(permission => ({
                name: permission.name,
                module: permission.module
            }));

            // Check if the user has the required access
            let hasAccess = requiredAccess.length === 0 || requiredAccess.includes("Self") ||
                            user.role.permissions.some(permission =>
                                requiredAccess.includes(permission.module) || requiredAccess.includes(permission.name));

            if (hasAccess) {
                res.locals.user = user; // Make user data globally available to templates
                next();
            } else {
                return res.status(403).json({success: false, message: t(req, "accessDenied")});
            }
        };
    }
}