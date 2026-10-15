const express = require("express");
const router = express.Router();
const { upload } = require('./functions');

// Express 4 does not catch rejected promises from async handlers, which crashes the process.
// Wrap every handler so errors are forwarded to the error handler in index.js instead.
for (const method of ["get", "post", "put", "delete"]) {
    const register = router[method].bind(router);
    router[method] = (path, ...handlers) => register(path, ...handlers.map((handler) => (req, res, next) => {
        try {
            return Promise.resolve(handler(req, res, next)).catch(next);
        } catch (e) {
            next(e);
        }
    }));
}

const start = require("./modules/start");
const user = require("./modules/user");
const department = require("./modules/department");
const designation = require("./modules/designation");
const attribute = require("./modules/attribute");
const jobgrade = require("./modules/jobgrade");
const newPerformanceAppraisal = require("./modules/newPerformanceAppraisal");
const apikey = require("./modules/apikey");
const survey = require('./modules/survey');
const departmentController = require('./modules/department');
const designationController = require('./modules/designation');
const jobGradeController = require('./modules/jobgrade');
const notificationController = require('./modules/notification');
const bootstrap = require('../bootstrap');

// Add routes here
router.get("/profile-employee/:employeeId", user.needsLogin([]), start.profiles);
router.get("/profiles/:employeeId?", user.needsLogin([]), start.profiles);
router.get("/profile/:employeeId?", user.needsLogin([]), start.newProfile);
router.get("/individual-performance-appraisal/:employeeId?", user.needsLogin(["own_appraisals_table", "appraisals_table", "performance_appraisal"]), start.checkAppraisals);

router.post("/admin/impersonate", user.needsLogin([]), user.impersonate);
router.get("/admin/stop-impersonate", user.needsLogin([]), user.stopImpersonate);

router.post("/login", user.postLogin);
router.get('/logout', user.logout);
router.get("/register", user.needsLogin(['add_form']), user.register);
router.post("/register", user.needsLogin(['add_form']), user.postRegister);
router.post('/change-password', user.needsLogin([]), user.changePassword);
router.post('/forgot-password', user.forgotPassword);
router.post('/reset-password/:token', user.resetPassword);

router.get("/avatars/:usernameOrEmployeeId", user.avatar);

router.get("/dashboard", user.needsLogin(['dashboard']), user.dashboard);
router.get("/dashboard-graphs", user.needsLogin(['dashboard']), user.dashboardGraphs);

router.get("/employees-list", user.needsLogin(['employees_list']), start.employeeList);
router.get("/employees-list/search", user.needsLogin(['employees_list']), start.employeeList);
router.post("/add-user", user.needsLogin(['add_form']), start.addUser);
router.post("/add-user-csv", user.needsLogin(['add_csv']), upload.single('csvfile'), start.addUserCSV);
router.post("/update-user", user.needsLogin([]), upload.single('profilePicture'), start.updateUser);
router.post("/update-users-csv", user.needsLogin(['update_csv']), upload.single('csvfile'), start.updateUsersCSV);
router.post("/delete-user", user.needsLogin(['delete']), start.deleteUser);

router.get("/departments", user.needsLogin(['department']), department.departments);
router.post("/department/add", user.needsLogin(['department']), department.postDepartment);
router.get("/department/:id", user.needsLogin(['department']), department.getDepartmentById);
router.post("/department/edit", user.needsLogin(['department']), department.editDepartment);
router.post("/department/delete", user.needsLogin(['department']), department.deleteDepartment);
router.get("/departments-json", user.needsLogin(['department']), department.departmentsJSON);
router.get("/employees/:departmentId", user.needsLogin(['department']), department.getEmployeesByDepartment);

router.get("/designations", user.needsLogin(['designation']), designation.getDesignations);
router.post("/designation/add", user.needsLogin(['designation']), designation.postDesignation);
router.get("/designation/:id", user.needsLogin(['designation']), designation.getDesignationById);
router.post("/designation/edit", user.needsLogin(['designation']), designation.editDesignation);
router.post("/designation/delete", user.needsLogin(['designation']), designation.deleteDesignation);
router.get("/designation/users/:designationId", user.needsLogin(['designation']), designation.getUsersByDesignation);

router.get("/attributes", user.needsLogin(['performance_indicator']), attribute.attributes);
router.post("/attributes/edit", user.needsLogin(['performance_indicator']), attribute.editAttribute);
router.post("/attributes/delete", user.needsLogin(['performance_indicator']), attribute.deleteAttribute);
router.get("/attributes/used-percentage", user.needsLogin(['performance_indicator']), attribute.getUsedPercentage);
router.get("/attributes/:id/subattributes", user.needsLogin(['performance_indicator']), attribute.getSubAttributes);
router.get("/filter-attributes", user.needsLogin(['performance_indicator']), attribute.filterAttributes);

router.get("/roles-permissions", user.needsLogin(['setting']), start.rolesPermissions);
router.post("/roles-permissions/add-role", user.needsLogin(['setting']), start.addRole);
router.put("/roles-permissions/edit-role/:roleId", user.needsLogin(['setting']), start.editRole);
router.delete("/roles-permissions/delete-role/:roleId", user.needsLogin(['setting']), start.deleteRole);
router.post("/roles-permissions/:roleId/permissions", user.needsLogin(['setting']), start.updateRolePermissions);
router.get('/roles-permissions/:roleId/permissions', user.needsLogin(['setting']), start.getRolePermissions);
router.post("/roles-permissions/add-permission", user.needsLogin(['setting']), start.addPermissions);
router.delete("/roles-permissions/delete-permission/:permissionId", user.needsLogin(['setting']), start.deletePermissions);
router.put("/roles-permissions/edit-permission/:permissionId", user.needsLogin(['setting']), start.editPermissions);
router.get("/roles-permissions/get-permission/:permissionId", user.needsLogin(['setting']), start.getPermission);

router.get("/jobgrades", user.needsLogin(['jobgrade']), jobgrade.getJobgrades);
router.post("/jobgrade/add", user.needsLogin(['jobgrade']), jobgrade.postJobgrade);
router.post("/jobgrade/delete", user.needsLogin(['jobgrade']), jobgrade.deleteJobgrade);
router.get("/api/designations/department/:departmentId", user.needsLogin(['jobgrade']), jobgrade.getDesignationsByDepartment);
router.get("/api/filter-jobgrades", user.needsLogin(['jobgrade']), jobgrade.filterJobGradesByDepartment);
router.get("/jobgrade/edit/:jobGradeId", user.needsLogin(['jobgrade']), jobgrade.getJobgradeById);
router.post("/jobgrade/update/:jobGradeId", user.needsLogin(['jobgrade']), jobgrade.updateJobgrade);
router.get("/jobgrade/check/:jobGradeName", user.needsLogin(['jobgrade']), jobgrade.checkJobGradeExists);

// New performance appraisal
router.get("/get-appraisals-list", user.needsLogin(['performance_appraisal']), newPerformanceAppraisal.getAppraisals);
router.get("/get-appraisals-list/:employeeId?", user.needsLogin([]), newPerformanceAppraisal.getAppraisals);
router.get("/get-appraisal-details/:performanceAppraisalId", user.needsLogin(["own_appraisals_table", "appraisals_table", "performance_appraisal"]), newPerformanceAppraisal.getAppraisalInfo);
router.post("/create-attribute", user.needsLogin(['performance_indicator']), newPerformanceAppraisal.createAttribute);
router.get("/get-employee-names", user.needsLogin(['performance_appraisal']), newPerformanceAppraisal.getEmployeeNames);
router.get("/get-employee-details/:employeeId", user.needsLogin(['performance_appraisal']), newPerformanceAppraisal.getEmployeeDetails);
router.post("/create-appraisal", user.needsLogin(['performance_appraisal']), newPerformanceAppraisal.createAppraisal);
router.post("/update-appraisal", user.needsLogin(['performance_appraisal']), newPerformanceAppraisal.updateAppraisal);
router.get("/print-appraisal/:performanceAppraisalId", user.needsLogin(["own_appraisals_table", "appraisals_table", "performance_appraisal"]), newPerformanceAppraisal.downloadAppraisalPdf);
router.post("/delete-appraisal", user.needsLogin(['performance_appraisal']), newPerformanceAppraisal.deleteAppraisal);
// Employees comment on their own appraisal; the handler checks ownership
router.post("/set-employee-comment", user.needsLogin([]), newPerformanceAppraisal.setEmployeeComment);

router.get("/apikey-settings", user.needsLogin(['apikey_setting']), apikey.settings);
router.post("/apikey-settings", user.needsLogin(['apikey_setting']), apikey.settings);
router.delete("/apikey-settings", user.needsLogin(['apikey_setting']), apikey.settings);

// Managing surveys needs the 'survey' permission; answering and viewing your own response only needs login
router.post("/create-survey", user.needsLogin(['survey']), survey.createSurvey);
router.get("/survey", user.needsLogin(['survey']), survey.getSurveysList);
router.get("/own-survey/:userId?", user.needsLogin([]), survey.getOwnSurveys);
router.get("/survey/:surveyId", user.needsLogin(['survey']), survey.getSurvey);
router.get("/survey/:surveyId/status", user.needsLogin(['survey']), survey.getSurveyStatus);
router.get("/survey/:surveyId/stats", user.needsLogin(['survey']), survey.getSurveyStats);
router.get("/survey-response/:responseId", user.needsLogin([]), survey.getSurveyResponse);
router.post("/survey-response/token", user.needsLogin([]), survey.generateLoginlessSurveyToken);
router.post("/update-survey", user.needsLogin(['survey']), survey.updateSurvey);
router.get("/survey-response/:responseId/print", user.needsLogin([]), survey.getSurveyPdf);
router.get("/survey/:surveyId/get-all-responses", user.needsLogin(['survey']), survey.getSurveyRecords);
router.post("/survey/delete", user.needsLogin(['survey']), survey.deleteSurvey);
router.get("/respond-to-survey/:surveyId?", survey.getPreparedSurvey);
router.post("/create-survey-response", survey.createSurveyResponse);

router.get("/notifications", user.needsLogin([]), notificationController.getNotifications);
router.post("/notifications/read", user.needsLogin([]), notificationController.updateNotificationRead);
router.post("/notifications/delete", user.needsLogin([]), notificationController.deleteNotification);

router.get("/api/departments", user.needsLogin(['department']), departmentController.getAllDepartments);
router.get("/api/designations", user.needsLogin(['designation']), designationController.getAllDesignations);
router.get("/api/jobgrades", user.needsLogin(['jobgrade']), jobGradeController.getAllJobGrades);

// Bootstrap routes
router.get("/bootstrap", bootstrap.checkFirstRun);
router.post("/bootstrap-create", bootstrap.createSuperAdmin);

module.exports = router;