const User = require('./app/models/User');
const Role = require('./app/models/Role');
const Permission = require('./app/models/Permission');
const {generateEmployeeId, hashPassword} = require('./app/functions');

class Bootstrap {
    constructor() {}

    static async checkPlatformFirstRun() {
        const users = await User.find({});

        return users.length === 0;
    }

    static async initialize() {
        const bootstrap = new Bootstrap();
        await bootstrap.initializePermissions();
        await bootstrap.initializeRoles();
    }

    async initializePermissions() {
        const permissions = [
            {name: "own_appraisals_table", group: "table", exclusive: false, module: "dashboard"},
            {name: "departments_table", group: "table", exclusive: false, module: "dashboard"},
            {name: "update_csv", group: "button", exclusive: false, module: "employees_list"},
            {name: "edit_admin", group: "edit", exclusive: true, module: "employees_list"},
            {name: "delete", group: "delete", exclusive: true, module: "employees_list"},
            {name: "own_department", group: "info", exclusive: true, module: "information"},
            {name: "all_department", group: "info", exclusive: true, module: "information"},
            {name: "employees_graph", group: "graph", exclusive: false, module: "dashboard"},
            {name: "appraisals_graph", group: "graph", exclusive: false, module: "dashboard"},
            {name: "employees_table", group: "table", exclusive: false, module: "dashboard"},
            {name: "designations_table", group: "table", exclusive: false, module: "dashboard"},
            {name: "add_csv", group: "button", exclusive: false, module: "employees_list"},
            {name: "edit_all", group: "edit", exclusive: true, module: "employees_list"},
            {name: "department", group: "", exclusive: false, module: "department"},
            {name: "performance_appraisal", group: "", exclusive: false, module: "performance_appraisal"},
            {name: "appraisals_table", group: "table", exclusive: false, module: "dashboard"},
            {name: "indicators_table", group: "table", exclusive: false, module: "dashboard"},
            {name: "add_form", group: "button", exclusive: false, module: "employees_list"},
            {name: "view_profile", group: "view", exclusive: true, module: "employees_list"},
            {name: "edit_hr", group: "edit", exclusive: true, module: "employees_list"},
            {name: "setting", group: "", exclusive: false, module: "setting"},
            {name: "designation", group: "", exclusive: false, module: "designation"},
            {name: "performance_indicator", group: "", exclusive: false, module: "performance_indicator"},
            {name: "department_graph", group: "graph", exclusive: false, module: "dashboard"},
            {name: "apikey_setting", group: "", exclusive: true, module: "ApiKey"},
            {name: "survey", group: "", exclusive: false, module: "survey"},
            {name: "view_appraisal", group: "view", exclusive: false, module: "performance_appraisal"},
            {name: "jobgrade", group: "", exclusive: false, module: "jobgrade"},
            {name: "topPerformers_graph", group: "graph", exclusive: false, module: "dashboard"},
            {name: "survey_table", group: "table", exclusive: false, module: "dashboard"},
        ];

        // Check for existing permissions
        const existingPermissions = await Permission.find({});
        if (existingPermissions.length === 0) {
            await Permission.insertMany(permissions);
            console.log("Permissions initialized");
        } else {
            console.log("Permissions exist so skipping initialization");
        }
    }

    async initializeRoles() {
        const superAdminRoles = [
            "departments_table", "employees_table", "designations_table", "appraisals_table",
            "indicators_table", "survey_table", "employees_graph", "appraisals_graph",
            "department_graph", "topPerformers_graph", "update_csv", "add_csv",
            "add_form", "edit_all", "delete", "view_profile",
            "all_department", "department", "performance_appraisal", "view_appraisal",
            "setting", "designation", "performance_indicator", "survey",
            "jobgrade",
        ];

        const hrRoles = [
            "own_appraisals_table", "employees_table", "appraisal_table", "indicators_table",
            "survey_table", "employees_graph", "appraisals_graph", "department_graph",
            "topPerformers_graph", "update_csv",
            "edit_hr", "view_profile", "all_department", "performance_appraisal",
            "view_appraisal", "performance_indicator", "survey",
        ];

        const employeeRoles = [
            "own_appraisals_table", "employees_table", "view_profile", "own_department",
            "performance_appraisal",
        ];

        const hodRoles = [
            "own_appraisals_table", "employees_table", "designations_table", "appraisals_table",
            "employees_graph", "appraisals_graph", "topPerformers_graph", "view_profile",
            "own_department", "performance_appraisal", "view_appraisal",
        ];

        // Check for existing roles
        const existingRoles = await Role.find({});
        if (existingRoles.length === 0) {
            const superAdminPermissionsIds = await Permission.find({name: {$in: superAdminRoles}}).select("_id");
            const hrPermissionsIds = await Permission.find({name: {$in: hrRoles}}).select("_id");
            const employeePermissionsIds = await Permission.find({name: {$in: employeeRoles}}).select("_id");
            const hodPermissionsIds = await Permission.find({name: {$in: hodRoles}}).select("_id");

            await Role.insertMany([
                {name: "Super Admin", permissions: superAdminPermissionsIds},
                {name: "HR", permissions: hrPermissionsIds},
                {name: "Employee", permissions: employeePermissionsIds},
                {name: "HOD", permissions: hodPermissionsIds},
            ]);

            console.log("Roles initialized");
        } else {
            console.log("Roles exist so skipping initialization");
        }
    }

    static async checkFirstRun(req, res) {
        try {
            const firstRun = await Bootstrap.checkPlatformFirstRun();
            return res.status(200).json({firstRun});
        } catch (e) {
            console.error(e);
            return res.status(500).send("An error occurred");
        }
    }

    static async createSuperAdmin(req, res) {
        try {
            const {
                username,
                name,
                email,
                password,
                repeatPassword,
                phone,
            } = req.body;

            // Check if it is first initialization
            if(!(await Bootstrap.checkPlatformFirstRun())) {
                return res.status(400).json({success: false, message: "Platform is already initialized. This is not a valid operation."})
            }

            if (password !== repeatPassword) {
                return res.status(400).send("Passwords do not match");
            }

            // Get the super admin role
            const superAdminRole = await Role.findOne({name: "Super Admin"});

            const user = new User({
                employeeId: await generateEmployeeId(),
                username,
                name,
                email,
                password,
                phone,
                role: superAdminRole._id,
            });

            await user.save();

            return res.status(201).json({success: true, message: "Super admin created successfully"});
        } catch (e) {
            console.error(e);
            return res.status(500).send("An error occurred");
        }
    }
}

module.exports = Bootstrap;