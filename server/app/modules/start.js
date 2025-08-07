const User = require("../models/User");
const Department = require("../models/Department");
const Designation = require("../models/Designation");
const PerformanceAppraisal = require("../models/PerformanceAppraisal");
const Role = require('../models/Role');
const JobGrade = require('../models/JobGrade');
const Permission = require('../models/Permission');
const {hashPassword, parseCSV, getNewPerformanceAppraisalStats} = require("../functions");
const {kBASE_URL} = require("../../constants");

const generateEmployeeId = async () => {
    let unique = false;
    let employeeId;
    while (!unique) {
        employeeId = Math.floor(100000 + Math.random() * 900000).toString();

        let user = await User.findOne({ employeeId: employeeId });
        if (!user) {
            unique = true;
        }
    }
    return employeeId;
};

const checkDepartmentPermission = (user) => {
    return user.role.permissions.some(permission =>
        ['own_department'].includes(permission.name)
    );
};

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}
function validatePhone(phone) {
    const re = /^\d{10,11}$/;
    return re.test(phone);
}
function validateDate(dateText) {
    const re = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
    return re.test(dateText);
}

module.exports = {
    profiles: async function (req, res) {
        // Optional employeeId parameter
        const { employeeId } = req.params;
    
        // Base URL for images
        const baseURL = `http://${kBASE_URL}/uploads/`;
    
        // Get employee data if employeeId is provided
        let userData;
        let reportsTo = null;
    
        if (employeeId) {
            userData = await User.findOne({ employeeId: employeeId }, { password: 0 })
                .populate('department', 'departmentName')
                .populate('designation', 'name')
                .populate('role', 'name')
                .populate('jobGrade', 'jobGradeName')
                .lean();
    
            if (userData) {
                if (userData.profilePicture) {
                    userData.profilePicturePath = `${baseURL}${userData.profilePicture}`;
                } else {
                    userData.profilePicturePath = "https://via.placeholder.com/150";
                }
    
                // Check if the user has a lead designation
                if (userData.designation && userData.designation._id) {
                    const isLead = await Designation.findOne({ _id: userData.designation._id, isLead: true }).lean();
    
                    if (!isLead) {
                        // Find the person to whom the user reports
                        const leadDesignations = await Designation.find({ department: userData.department._id, isLead: true }).select('_id');
                        if (leadDesignations.length > 0) {
                            reportsTo = await User.findOne({
                                department: userData.department._id,
                                designation: { $in: leadDesignations }
                            }).lean();
    
                            if (reportsTo) {
                                userData.reportsTo = reportsTo.name;
                            } else {
                                userData.reportsTo = "Not Available";
                            }
                        } else {
                            userData.reportsTo = "Not Available";
                        }
                    }
                } else {
                    userData.reportsTo = "Not Available";
                }
            }
        } else {
            userData = res.locals.user;
    
            if (userData) {
                let userItem = await User.findById(userData._id)
                    .populate('department', 'departmentName')
                    .populate('designation', 'name')
                    .populate('role', 'name')
                    .populate('jobGrade', 'jobGradeName')
                    .lean();
    
                if (userItem) {
    
                    // Handle profile picture path
                    if (userItem.profilePicture) {
                        userData.profilePicturePath = `${baseURL}${userItem.profilePicture}`;
                    } else {
                        userData.profilePicturePath = "https://via.placeholder.com/150";
                    }
    
                    // Check if the user has a lead designation
                    if (userItem.designation && userItem.designation._id) {
                        const isLead = await Designation.findOne({ _id: userItem.designation._id, isLead: true }).lean();
    
                        if (!isLead) {
                            // Find the person to whom the user reports
                            const leadDesignations = await Designation.find({ department: userItem.department._id, isLead: true }).select('_id');
                            if (leadDesignations.length > 0) {
                                reportsTo = await User.findOne({
                                    department: userItem.department._id,
                                    designation: { $in: leadDesignations }
                                }).lean();
    
                                if (reportsTo) {
                                    userData.reportsTo = reportsTo.name;
                                } else {
                                    userData.reportsTo = "Not Available";
                                }
                            } else {
                                userData.reportsTo = "Not Available";
                            }
                        }
                    } else {
                        userData.reportsTo = "Not Available";
                    }
                }
            }
        }
    
        if (userData) {
            return res.json({ userData: userData });
        } else {
            res.status(404).json({ success: false, message: "User not found" });
        }
    },

    newProfile: async function (req, res) {
        const { employeeId } = req.params;
        const baseURL = `http://${kBASE_URL}/uploads/`;
    
        let userData;
        let reportsTo = "Not Available";
    
        if (employeeId) {
            userData = await User.findOne({ employeeId: employeeId }, { password: 0 })
                .populate('department', 'departmentName')
                .populate('designation', 'name isLead')
                .populate('role', 'name')
                .populate('jobGrade', 'jobGradeName')
                .lean();
        } else {
            userData = res.locals.user;
            if (userData) {
                userData = await User.findById(userData._id)
                    .populate('department', 'departmentName')
                    .populate('designation', 'name isLead')
                    .populate('role', 'name')
                    .populate('jobGrade', 'jobGradeName')
                    .lean();
            }
        }
    
        if (userData) {
            if (userData.profilePicture) {
                userData.profilePicturePath = `${baseURL}${userData.profilePicture}`;
            } else {
                userData.profilePicturePath = "https://via.placeholder.com/150";
            }
    
            if (userData.designation && userData.designation._id) {
                const isLead = await Designation.findOne({ _id: userData.designation._id, isLead: true }).lean();
                if (!isLead) {
                    const leadDesignations = await Designation.find({ department: userData.department._id, isLead: true }).select('_id');
                    if (leadDesignations.length > 0) {
                        const lead = await User.findOne({
                            department: userData.department._id,
                            designation: { $in: leadDesignations }
                        }).lean();
                        if (lead) {
                            reportsTo = lead.name;
                        }
                    }
                }
            }
            userData.reportsTo = reportsTo;
        }
    
        if (userData) {
            return res.json({ userData: userData });
        } else {
            res.status(404).json({ success: false, message: "User not found" });
        }
    },
    
    checkAppraisals: async function (req, res) {
        try {
            // Optional employeeId parameter
            const { employeeId } = req.params;

            let performanceAppraisals = [];

            if(employeeId) {
                let user = await User.findOne({ employeeId: employeeId });

                if(user) {
                    performanceAppraisals = await PerformanceAppraisal.find({ employeeId: user._id })
                        .populate('employeeId') // populate 'employeeId' with 'name' field from 'User' model
                        .populate('reviewedBy') // populate 'reviewedBy' with 'name' field from 'User' model
                        .populate('supervisor');
                }
            }

            let performanceAppraisalsData;

            if(performanceAppraisals.length > 0) {
                performanceAppraisalsData = performanceAppraisals.map((performanceAppraisal) => {
                    return {
                        performanceAppraisal: performanceAppraisal.toObject(),
                        stats: getNewPerformanceAppraisalStats(performanceAppraisal)
                    }
                })
            } else {
                performanceAppraisalsData = [];
            }

            return res.json({
                success: true,
                performanceAppraisals: performanceAppraisalsData
            })
        } catch (e) {
            console.error(e);
            return res.status(500).json({success: false, message: "Error getting performance appraisals."})
        }
    },
    profileEmployee: async function (req, res) {
        try {
            // Fetch the employee ID from the request, e.g., from a query parameter or session
            const employeeId = req.params.employeeId;
    
            // Fetch user data from the database based on employeeId
            const userData = await User.findOne({ employeeId: employeeId }).populate('department').populate('designation').lean();

            // Format the birthday before sending it to the template
            if (userData.birthday) {
                const date = new Date(userData.birthday);
                // Ensure the day and month are two digits by padding with '0' if necessary
                const day = ('0' + date.getDate()).slice(-2);
                const month = ('0' + (date.getMonth() + 1)).slice(-2);
                const year = date.getFullYear();
                userData.formattedBirthday = `${day}/${month}/${year}`;
            }

            // Format the join date before sending it to the template
            if (userData.createdAt) {
                const date = new Date(userData.createdAt);
                // Ensure the day and month are two digits by padding with '0' if necessary
                const day = ('0' + date.getDate()).slice(-2);
                const month = ('0' + (date.getMonth() + 1)).slice(-2);
                const year = date.getFullYear();
                userData.formattedcreatedAt = `${day}/${month}/${year}`;
            }

            if (userData.profilePicture) {
                userData.profilePicture = userData.profilePicture.replace('resources', '');
            }

            userData.depart = userData.department ? userData.department.departmentName : null;
            userData.desig = userData.designation ? userData.designation.name : null;

            const departments = await Department.find().lean();
            const designations = await Designation.find().lean();

            return res.json({
                userData: userData,
                departments: departments,
                designations: designations,
            });
        } catch (error) {
            console.error('Error fetching user data:', error);
            return res.status(500).send("An error occurred while fetching the profile data.");
        }
    },

    getUser: async (req, res) => {
        try {
            let users = await User.find();

            // Send a JSON response containing the array of users
            return res.json(users);
        } catch(error) {
            // If an error occurs during the execution of the try block, catch the error

            // Log the error message to the console
            console.error("Error fetching employee names by designation:", error);

            // Send a 500 Internal Server Error response with a generic error message
            return res.status(500).send("An error occurred while fetching performance appraisals.");
        }
    },

    addUserCSV: async function (req, res) {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded.' });
        }
    
        const csvPath = req.file.path;
        const errors = [];
        const createdUsers = [];
        let rowNumber = 0;
    
        try {
            // Parse the CSV file
            const csvData = await parseCSV(csvPath, ',');
    
            // Utility function to validate a row
            const validateRow = async (row, rowNumber) => {
                let errorMessages = [];
    
                if (!row.username || !row.email || !row.password) {
                    errorMessages.push(`Row ${rowNumber}: All fields must be filled out.`);
                }
                if (row.email && !validateEmail(row.email)) {
                    errorMessages.push(`Row ${rowNumber}: Invalid email address.`);
                }
                if (row.password && row.password.length < 6) {
                    errorMessages.push(`Row ${rowNumber}: Password must be at least 6 characters long.`);
                }
                const role = await Role.findOne({ name: row.role }).lean();
                if (!role) {
                    errorMessages.push(`Row ${rowNumber}: Invalid role specified.`);
                }
                if (role && role.name === 'Super Admin') {
                    errorMessages.push(`Row ${rowNumber}: Role not allowed for user creation.`);
                }
                row.role = role ? role._id : null;
    
                if (errorMessages.length > 0) {
                    return { errorMessages };
                }
    
                row.employeeId = await generateEmployeeId();
                row.password = await hashPassword(row.password);
                row.department = null;
                row.designation = null;
    
                return { validData: row };
            };
    
            // Iterate over each row in the CSV data
            for (const row of csvData) {
                rowNumber++;
    
                // Check if the row is empty
                if (Object.values(row).every(value => value === '')) {
                    continue; // Skip empty rows
                }
    
                const { errorMessages, validData } = await validateRow(row, rowNumber);
    
                if (errorMessages && errorMessages.length > 0) {
                    errors.push(...errorMessages);
                    continue; // Skip adding this user due to validation errors
                }
    
                try {
                    const newUser = await User.create(validData);
                    createdUsers.push(`Row ${rowNumber}: ${newUser.username} has been created successfully.`);
                } catch (error) {
                    let errorMessage = error.message;
                    if (error.code === 11000) {
                        errorMessage = 'Duplicate entry found.';
                    }
                    errors.push(`Row ${rowNumber}: ${errorMessage}`);
                }
            }
    
            // Check for errors
            return res.status(200).json({ success: true, messages: createdUsers, errors: errors });
        } catch (error) {
            console.error("CSV Parsing Error:", error);
            return res.status(500).json({ success: false, error: 'Error parsing CSV file.' });
        }
    },      
    

    addUser: async function (req, res) {
        let users = req.body.users;
        const errors = [];
    
        if (!Array.isArray(users)) {
            users = [users];
        }
    
        for (const userData of users) {
            try {
                // Validate required fields
                if (!userData.username || !userData.email || !userData.password) {
                    throw new Error('All fields must be filled out.');
                }
    
                // Validate email
                if (!validateEmail(userData.email)) {
                    throw new Error('Invalid email address.');
                }
    
                // Validate password length
                if (userData.password.length < 6) {
                    throw new Error('Password must be at least 6 characters long.');
                }
    
                // Validate password match
                if (userData.password !== userData.repeatPassword) {
                    throw new Error('Passwords do not match.');
                }
    
                userData.employeeId = await generateEmployeeId();

                const role = await Role.findOne({ _id: userData.role }).lean();
                if (!role) throw new Error('Role not found.');
                userData.role = role._id;

                userData.department = null;
                userData.designation = null;
    
                const newUser = await User.create(userData);
                createdUsers.push(newUser);
            } catch (error) {
                errors.push({ userData, error: error.message });
            }
        }
    
        if (errors.length > 0) {
            return res.status(400).json({ success: false, errors });
        } else {
            return res.json({ success: true, message: 'User created successfully' });
        }
    },

    updateUsersCSV: async function (req, res) {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded.' });
        }
    
        const csvPath = req.file.path;
        const errors = [];
        const updatedUsers = [];
        let rowNumber = 0;
    
        try {
            const csvData = await parseCSV(csvPath, ',');
    
            // Utility function to validate a row
            const validateRow = async (row, rowNumber) => {
                let errorMessages = [];
    
                // Check if the row is empty
                if (Object.values(row).every(value => value === '')) {
                    return { skip: true }; // Skip empty rows
                }
    
                if (!row.name) {
                    errorMessages.push(`Row ${rowNumber}: Name is required.`);
                }
                if (!row.email || !validateEmail(row.email)) {
                    errorMessages.push(`Row ${rowNumber}: Invalid or missing email address.`);
                }
                if (!row.phone || !validatePhone(row.phone)) {
                    errorMessages.push(`Row ${rowNumber}: Invalid or missing phone number.`);
                }
                const department = await Department.findOne({ departmentName: row.department });
                if (!department) {
                    errorMessages.push(`Row ${rowNumber}: Department not found.`);
                }
                const designation = await Designation.findOne({ name: row.designation });
                const jobGrade = await JobGrade.findOne({ designation: designation?._id });
    
                if (!designation) {
                    errorMessages.push(`Row ${rowNumber}: Designation not found.`);
                } else if (designation.department.toString() !== department?._id.toString()) {
                    errorMessages.push(`Row ${rowNumber}: Designation does not belong to the specified department.`);
                }
    
                if (!row.birthday || !validateDate(row.birthday)) {
                    errorMessages.push(`Row ${rowNumber}: Invalid or missing birthday.`);
                }
                if (!row.address) {
                    errorMessages.push(`Row ${rowNumber}: Address is required.`);
                }
                const validGenders = ['Male', 'Female', 'Other'];
                if (!row.gender || !validGenders.includes(row.gender)) {
                    errorMessages.push(`Row ${rowNumber}: Invalid or missing gender.`);
                }
    
                if (errorMessages.length > 0) {
                    return { errorMessages };
                }
    
                const updateData = {
                    name: row.name,
                    email: row.email,
                    phone: row.phone,
                    department: department._id,
                    designation: designation._id,
                    jobGrade: jobGrade._id,
                    birthday: new Date(Date.UTC(...row.birthday.split('/').reverse())),
                    address: row.address,
                    gender: row.gender
                };
    
                return { validData: updateData };
            };
    
            // Iterate over each row in the CSV data
            for (const row of csvData) {
                rowNumber++;
    
                const { skip, errorMessages, validData } = await validateRow(row, rowNumber);
    
                if (skip) {
                    continue; // Skip empty rows
                }
    
                if (errorMessages && errorMessages.length > 0) {
                    errors.push(...errorMessages);
                    continue; // Skip updating this user due to validation errors
                }
    
                try {
                    const updateResult = await User.updateOne({ email: row.email }, { $set: validData });
                    if (updateResult.matchedCount === 0) {
                        errors.push(`Row ${rowNumber}: User with email ${row.email} not found.`);
                    } else {
                        updatedUsers.push(`Row ${rowNumber}: ${row.email} has been updated successfully.`);
                    }
                } catch (updateError) {
                    errors.push(`Row ${rowNumber}: Failed to update user. ${updateError.message}`);
                }
            }
    
            return res.status(200).json({ success: true, messages: updatedUsers, errors: errors });
        } catch (error) {
            console.error('Error processing CSV:', error);
            return res.status(500).json({ success: false, error: 'An error occurred while processing the CSV file.' });
        }
    },    


    updateUser: async function (req, res) {
        let { username, name, email, phone, department, designation, role, jobGrade, birthday, address, gender, profilePicture, employeeId } = req.body;
    
        try {
            let updateData = {
                username,
                name,
                email,
                phone,
                department: department || null,
                designation: designation || null,
                role: role || null,
                jobGrade: jobGrade || null,
                birthday,
                address,
                gender,
                profilePicture,
                ...(req.body.password && { password: req.body.password }),
            };
    
            if (req.file) {
                updateData.profilePicture = req.file.filename;
            }
    
            await User.findOneAndUpdate(
                { employeeId: employeeId },
                updateData,
                { new: true }
            );

            return res.json({ success: true, message: 'User updated successfully' });
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).send('An error occurred while updating the user.');
        }
    },
    

    deleteUser: async function (req, res) {
        let { employeeId } = req.body;
    
        try {
            const result = await User.deleteOne({ employeeId: employeeId });
    
            if (result.deletedCount === 0) {
                return res.status(404).send('User not found.');
            }

            return res.json({ success: true, message: 'User deleted successfully' });
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500);

            return res.json({ success: false, message: 'An error occurred while deleting the user.' });
        }
    },


    employeeList: async function (req, res) {
        const user = res.locals.user;
        const { employeeId, employeeName } = req.query;
    
        const superAdminRole = await Role.findOne({ name: 'Super Admin' }).lean();
        const superAdminRoleId = superAdminRole._id;
        let filter;
        if (user.role.name !== 'Super Admin') {
            filter = { role: { $ne: superAdminRoleId } };
        }

        const departmentPermission = checkDepartmentPermission(user);
        if (departmentPermission) {
            filter.department = user.department; 
            if (employeeId) filter.employeeId = employeeId;
            if (employeeName) filter.name = new RegExp(employeeName, 'i'); 
        } else {
            if (employeeId) filter.employeeId = employeeId;
            if (employeeName) filter.name = new RegExp(employeeName, 'i'); 
            if (req.query.role) {
                const role = await Role.findOne({ name: req.query.role }).lean();
                if (role) filter.role = role._id;
            }
            if (req.query.departmentName) {
                const dept = await Department.findOne({ departmentName: req.query.departmentName }).lean();
                if (dept) filter.department = dept._id;
            }
        }
    
        const employees = await User.find(filter)
            .populate('department', 'departmentName')
            .populate('designation', 'name')
            .populate('role', 'name')
            .populate('jobGrade', 'jobGradeName')
            .lean();
    
        // Define the base URL for your uploaded images
        const baseURL = `http://${kBASE_URL}/uploads/`;
    
        // Add full path for profile pictures
        const employeesWithPictures = employees.map(employee => ({
            ...employee,
            profilePicturePath: employee.profilePicture ? `${baseURL}${employee.profilePicture}` : null
        }));
    
        const departments = await Department.find().lean();
        const designations = await Designation.find().lean();
        const roles = await Role.find().lean();
        const jobGrades = await JobGrade.find().lean();

        return res.json({
            employees: employeesWithPictures,
            roles,
            departments,
            designations,
            jobGrades,
            searchParams: { employeeId, employeeName, role: req.query.role, departmentName: req.query.departmentName }
        });
    },
    rolesPermissions: async function (req, res) {
        try {
            let roles = await Role.find().lean();
            let permissions = await Permission.find().lean();

            permissions = permissions.filter(permission => permission.module !== 'ApiKey');
    
            const modules = permissions.reduce((acc, p) => {
                acc[p.module] = acc[p.module] || {};
                acc[p.module][p.group] = acc[p.module][p.group] || [];
                acc[p.module][p.group].push(p);
                return acc;
            }, {});

            return res.json({
                roles,
                modules,
            });
        } catch (error) {
            console.error("Failed to fetch roles and permissions:", error);
            res.status(500).send("Error fetching roles and permissions");
        }
    },

    addPermissions: async function (req, res) {
        const { name, module, group, exclusive } = req.body;
    
        try {
            const newPermission = new Permission({ name, module, group, exclusive });
            await newPermission.save();
            res.status(201).json({ success: true, message: 'Permission added successfully' });
        } catch (error) {
            res.status(400).json({ success: false, message: 'Error adding permission', error: error.message });
        }
    },

    deletePermissions: async function (req, res) {
        try {
            const { permissionId } = req.params;
            await Permission.findByIdAndDelete(permissionId);
            res.json({ success: true, message: 'Permission deleted successfully.' });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error deleting permission.' });
        }
    },

    editPermissions: async function (req, res) {
        const { permissionId } = req.params;
        const { name, module, group, exclusive } = req.body;
    
        try {
            const updatedPermission = await Permission.findByIdAndUpdate(
                permissionId,
                { name, module, group, exclusive },
                { new: true, runValidators: true }
            );
    
            if (!updatedPermission) {
                return res.status(404).json({ success: false, message: 'Permission not found' });
            }
    
            res.json({ success: true, message: 'Permission updated successfully', permission: updatedPermission });
        } catch (error) {
            res.status(400).json({ success: false, message: 'Error updating permission', error: error.message });
        }
    },

    getPermission: async function (req, res) {
        const { permissionId } = req.params;
    
        try {
            const permission = await Permission.findById(permissionId).lean();
            if (!permission) {
                return res.status(404).json({ success: false, message: 'Permission not found' });
            }
            res.json({ success: true, permission });
        } catch (error) {
            res.status(400).json({ success: false, message: 'Error fetching permission', error: error.message });
        }
    },
    

    addRole: async function (req, res) {
        try {
            const { name } = req.body;
            const newRole = new Role({ name });
            await newRole.save();
            res.status(201).send({ success: true, message: 'Role created successfully', role: newRole });
        } catch (error) {
            console.error('Error creating role:', error);
            res.status(500).send({ success: false, message: 'Error creating role' });
        }
    },

    editRole: async function (req, res) {
        try {
            const { roleId } = req.params;
            const { name } = req.body;
            await Role.findByIdAndUpdate(roleId, { name });
            res.status(200).send({success: true, message: 'Role updated successfully' });
        } catch (error) {
            console.error('Error updating role:', error);
            res.status(500).send({success: false, message: 'Error updating role' });
        }
    },

    deleteRole: async function (req, res) {
        try {
            const roleId = req.params.roleId; 
            const deletedRole = await Role.findByIdAndDelete(roleId);
            if (!deletedRole) {
                return res.status(404).send({ message: 'Role not found' });
            }
            res.status(200).send({success: true, message: 'Role deleted successfully', role: deletedRole });
        } catch (error) {
            console.error('Error deleting role:', error);
            res.status(500).send({success: false, message: 'Error deleting role' });
        }
    },

    updateRolePermissions: async function (req, res) {
        try {
            const { roleId } = req.params;
            const { permissions } = req.body; 
    
            const updatedRole = await Role.findByIdAndUpdate(
                roleId,
                { permissions: permissions },
                { new: true }
            );
    
            res.status(200).send({success: true, message: 'Permissions updated successfully', role: updatedRole });
        } catch (error) {
            console.error('Error updating role permissions:', error);
            res.status(500).send({success: false, message: 'Error updating role permissions' });
        }
    },

    getRolePermissions: async function(req, res) {
        try {
            const { roleId } = req.params; 
            const role = await Role.findById(roleId)
                .populate('permissions')
                .exec();
            if (!role) {
                return res.status(404).send({success: false, message: 'Role not found' });
            }

            const permissionIds = role.permissions.map(permission => permission._id);
            res.send({success: true, permissions: permissionIds });
        } catch (error) {
            console.error('Error fetching permissions for the role:', error);
            res.status(500).send({success: false, message: 'Error fetching permissions for the role' });
        }
    },
}