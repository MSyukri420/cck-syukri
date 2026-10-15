// Seeds a small set of mock data so every page of the website can be tried out.
//
//   npm run seed:mock         insert mock data (replaces any previous mock data)
//   npm run seed:mock:clear   remove only the mock data
//
// Every inserted _id is recorded in the "_mockseed" collection so clearing never touches real records.
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const User = require("../app/models/User");
const Role = require("../app/models/Role");
const Department = require("../app/models/Department");
const Designation = require("../app/models/Designation");
const JobGrade = require("../app/models/JobGrade");
const Attribute = require("../app/models/Attribute");
const PerformanceAppraisal = require("../app/models/PerformanceAppraisal");
const Survey = require("../app/models/Survey");
const SurveyResponse = require("../app/models/SurveyResponse");
const Bootstrap = require("../bootstrap");

const PASSWORD = "Password123";
const EMAIL_DOMAIN = "mock.cck.test";
const MANIFEST = "_mockseed";
const MODELS = { User, Department, Designation, JobGrade, Attribute, PerformanceAppraisal, Survey, SurveyResponse };

// [designation, department, isLead, job grade, percentage carry: know-how / problem-solving / accountability]
const DESIGNATIONS = [
    ["HR Manager", "Human Resources", true, "14", [30, 30, 40]],
    ["IT Manager", "Information Technology", true, "14", [30, 30, 40]],
    ["Software Developer", "Information Technology", false, "10", [45, 35, 20]],
];

// One account per role, plus a second employee so the head of department has a team
const PEOPLE = [
    { key: "hr", username: "hr", name: "Nurul Aisyah binti Rahman", gender: "Female", designation: "HR Manager", role: "HR", joined: "2023-02-06", phone: "0123456701" },
    { key: "hod", username: "hod", name: "Daniel Lee Chee Keong", gender: "Male", designation: "IT Manager", role: "HOD", joined: "2023-04-10", phone: "0123456702" },
    { key: "employee", username: "employee", name: "Aiman Hakim bin Zulkifli", gender: "Male", designation: "Software Developer", role: "Employee", joined: "2024-01-15", phone: "0123456703" },
    { key: "employee2", username: "employee2", name: "Priya a/p Ramasamy", gender: "Female", designation: "Software Developer", role: "Employee", joined: "2024-06-24", phone: "0123456704" },
];

const CRITERIA = {
    "Know-How": { name: "Professional Knowledge", subs: [["Job Knowledge", 40], ["Tools & Systems", 30], ["Continuous Learning", 30]] },
    "Problem-Solving": { name: "Problem Solving & Judgement", subs: [["Analytical Thinking", 50], ["Decision Making", 30], ["Initiative", 20]] },
    "Accountability": { name: "Accountability & Conduct", subs: [["Ownership of Work", 40], ["Attendance & Punctuality", 30], ["Teamwork", 30]] },
};

// [employee, reviewer, period, date, typical mark, appraiser comment, employee comment]
const APPRAISALS = [
    ["employee", "hod", "2025 H2", "2025-12-16", 84, "Strong delivery on the payroll integration. Keep sharing knowledge with the team.", null],
    ["employee", "hod", "2026 H1", "2026-06-24", 89, "Outstanding half year. Ready to lead a small project.", "Thank you. I would like to take on the reporting project next."],
    ["employee2", "hod", "2025 H2", "2025-12-16", 66, "Good progress. Focus on testing and following up on open tickets.", null],
    ["employee2", "hod", "2026 H1", "2026-06-24", 73, "Clear improvement in code quality and reliability.", null],
    ["hod", "hr", "2026 H1", "2026-06-24", 64, "Department targets mostly met. Work on planning and communication with other teams.", null],
];

const SURVEY_QUESTIONS = [
    ["I feel motivated to do my best work every day.", "Strongly disagree", "Strongly agree"],
    ["My manager gives me regular and useful feedback.", "Never", "Always"],
    ["I would recommend CCK Group as a place to work.", "Unlikely", "Very likely"],
];

// Small fixed offsets so sub-item marks differ a little around the typical mark
const OFFSETS = [-4, 2, 5, -2, 0, 3, -3, 4, 1];

async function generateEmployeeId(taken) {
    let employeeId = 700000;
    while (taken.has(String(employeeId)) || await User.exists({ employeeId: String(employeeId) })) employeeId++;
    taken.add(String(employeeId));
    return String(employeeId);
}

async function clearMockData() {
    const manifest = await mongoose.connection.db.collection(MANIFEST).findOne({ _id: "manifest" });
    if (!manifest) {
        console.log("No mock data found.");
        return;
    }

    // Remove PDFs generated for mock appraisals and survey responses
    const pdfOwners = [
        ...await PerformanceAppraisal.find({ _id: { $in: manifest.ids.PerformanceAppraisal || [] } }, "pdf").lean(),
        ...await SurveyResponse.find({ $or: [{ _id: { $in: manifest.ids.SurveyResponse || [] } }, { campaign: { $in: manifest.ids.Survey || [] } }] }, "pdf").lean(),
    ];
    for (const { pdf } of pdfOwners) {
        const pdfPath = pdf && path.resolve(process.cwd(), "resources/uploads", pdf);
        if (pdfPath && fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
    }

    for (const [name, ids] of Object.entries(manifest.ids)) {
        let { deletedCount } = await MODELS[name].deleteMany({ _id: { $in: ids } });
        // Responses submitted while testing belong to mock surveys but aren't in the manifest
        if (name === "SurveyResponse") {
            deletedCount += (await SurveyResponse.deleteMany({ campaign: { $in: manifest.ids.Survey || [] } })).deletedCount;
        }
        console.log(`Removed ${String(deletedCount).padStart(2)} ${MODELS[name].collection.collectionName}`);
    }
    await mongoose.connection.db.collection(MANIFEST).deleteOne({ _id: "manifest" });
}

async function seedMockData() {
    // Record ids as they are inserted so a failed run can still be cleared
    const ids = Object.fromEntries(Object.keys(MODELS).map((name) => [name, []]));
    const manifest = mongoose.connection.db.collection(MANIFEST);
    await manifest.insertOne({ _id: "manifest", seededAt: new Date(), ids });
    const track = async (name, docs) => {
        const newIds = [].concat(docs).map((doc) => doc._id);
        ids[name].push(...newIds);
        await manifest.updateOne({ _id: "manifest" }, { $push: { [`ids.${name}`]: { $each: newIds } } });
        return docs;
    };

    await Bootstrap.initialize();
    const roles = Object.fromEntries((await Role.find().lean()).map((role) => [role.name, role._id]));
    for (const name of ["HR", "HOD", "Employee"]) {
        if (!roles[name]) throw new Error(`Role "${name}" is missing from the database`);
    }

    // Departments, designations, job grades and appraisal criteria
    const departments = {};
    const designations = {};
    for (const [name, departmentName, isLead, gradeName, [knowHow, problemSolving, accountability]] of DESIGNATIONS) {
        departments[departmentName] ??= await track("Department", await Department.create({ departmentName }));
        const department = departments[departmentName];
        const designation = await track("Designation", await Designation.create({ name, department: department._id, isLead }));
        const jobGrade = await track("JobGrade", await JobGrade.create({
            jobGradeName: gradeName,
            department: department._id,
            designation: designation._id,
            percentageCarry: { knowHow, problemSolving, accountability },
        }));
        const attributes = await track("Attribute", await Attribute.create(Object.entries(CRITERIA).map(([category, criterion]) => ({
            category,
            name: criterion.name,
            designation: designation._id,
            jobGrade: jobGrade._id,
            subAttributes: criterion.subs.map(([subName, weight]) => ({ name: subName, weight })),
        }))));
        designations[name] = { designation, jobGrade, attributes, departmentName };
    }

    // Accounts; create() runs the pre-save hook so passwords are hashed once
    const takenIds = new Set();
    const users = {};
    for (const person of PEOPLE) {
        const { designation, jobGrade, departmentName } = designations[person.designation];
        users[person.key] = await track("User", await User.create({
            employeeId: await generateEmployeeId(takenIds),
            username: `${person.username}.mock`,
            email: `${person.username}@${EMAIL_DOMAIN}`,
            password: PASSWORD,
            name: person.name,
            phone: person.phone,
            department: departments[departmentName]._id,
            designation: designation._id,
            jobGrade: jobGrade._id,
            role: roles[person.role],
            dateJoined: new Date(person.joined),
            birthday: new Date("1995-03-14"),
            address: "12, Jalan SS2/24, 47300 Petaling Jaya, Selangor",
            gender: person.gender,
        }));
        // Backdate createdAt to the join date so the employee growth chart has history
        await User.collection.updateOne({ _id: users[person.key]._id }, { $set: { createdAt: new Date(person.joined) } });
    }

    // Appraisals
    for (const [employeeKey, reviewerKey, timePeriod, appraisalDate, typicalMark, appraiserComment, employeeComment] of APPRAISALS) {
        const employee = users[employeeKey];
        const reviewer = users[reviewerKey];
        const person = PEOPLE.find((p) => p.key === employeeKey);
        const { designation, jobGrade, attributes, departmentName } = designations[person.designation];
        const carry = jobGrade.percentageCarry;
        const reviewedAt = new Date(`${appraisalDate}T10:00:00+08:00`);
        let offset = 0;

        const appraisal = await track("PerformanceAppraisal", await PerformanceAppraisal.create({
            employeeId: employee._id,
            employeeDetails: {
                name: employee.name,
                employeeId: employee.employeeId,
                designation: designation.name,
                department: departmentName,
                jobGrade: jobGrade.jobGradeName,
                dateOfJoining: employee.dateJoined,
            },
            timePeriod,
            appraisalDate,
            attributePercentageCarry: { KnowHow: carry.knowHow, ProblemSolving: carry.problemSolving, Accountability: carry.accountability },
            appraisalData: attributes.map((attribute) => ({
                attributeName: attribute.name,
                attributeType: attribute.category,
                subAttributes: attribute.subAttributes.map((sub) => ({
                    name: sub.name,
                    weight: sub.weight,
                    marksGiven: Math.min(100, typicalMark + OFFSETS[offset++ % OFFSETS.length]),
                })),
            })),
            appraiserComments: { message: appraiserComment, user: reviewer._id, timestamp: reviewedAt },
            employeeComment: employeeComment ? { message: employeeComment, timestamp: new Date(reviewedAt.getTime() + 2 * 864e5) } : undefined,
            reviewedBy: reviewer._id,
            supervisor: reviewer._id,
        }));
        await PerformanceAppraisal.collection.updateOne({ _id: appraisal._id }, { $set: { createdAt: reviewedAt } });

        // Same notification the app sends when an employee comments on their appraisal
        if (employeeComment) {
            await User.collection.updateOne({ _id: reviewer._id }, { $push: { notifications: {
                _id: new mongoose.Types.ObjectId(),
                info: `Employee ${employee.name} has commented on their appraisal ${timePeriod}.\n"${employeeComment}"`,
                read: false,
                date: new Date(reviewedAt.getTime() + 2 * 864e5),
            } } });
        }
    }

    // One open survey, dated around today so it can always be answered: employee2 has responded, employee has not
    const day = 864e5;
    const start = new Date(new Date(Date.now() - 7 * day).setHours(0, 0, 0, 0));
    const end = new Date(new Date(Date.now() + 14 * day).setHours(23, 59, 59, 999));
    const survey = await track("Survey", await Survey.create({
        campaignName: "Employee Engagement Survey",
        campaignDescription: "Short survey on motivation, feedback and how staff feel about working at CCK Group.",
        campaignStartDate: start,
        campaignEndDate: end,
        employees: [users.hod._id, users.employee._id, users.employee2._id],
        questions: SURVEY_QUESTIONS.map(([question, low, high]) => ({ question, low, high })),
        createdBy: users.hr._id,
    }));
    await track("SurveyResponse", await SurveyResponse.create({
        user: users.employee2._id,
        campaign: survey._id,
        responses: SURVEY_QUESTIONS.map(([question], index) => ({ question, rating: [4, 3, 5][index] })),
        completed: true,
    }));
    for (const key of ["hod", "employee"]) {
        await User.collection.updateOne({ _id: users[key]._id }, { $push: { notifications: {
            _id: new mongoose.Types.ObjectId(),
            info: `A campaign, ${survey.campaignName} has been created for you, which will need to be completed by ${end.toLocaleDateString("en-my", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.`,
            read: false,
            date: start,
        } } });
    }

    for (const [name, list] of Object.entries(ids)) {
        console.log(`Added ${String(list.length).padStart(2)} ${MODELS[name].collection.collectionName}`);
    }
    console.log(`\nLog in with any of these (password "${PASSWORD}"):`);
    for (const person of PEOPLE) {
        console.log(`  ${person.role.padEnd(9)} ${users[person.key].email.padEnd(28)} ${person.name}`);
    }
}

(async () => {
    if (process.env.NODE_ENV === "production") {
        console.error("Refusing to run mock seeding with NODE_ENV=production.");
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017", { dbName: process.env.MONGODB_NAME || "cck_hrpms" });
    console.log(`Database: ${mongoose.connection.db.databaseName}\n`);

    try {
        await clearMockData();
        if (!process.argv.includes("--clear")) {
            console.log("");
            await seedMockData();
        }
    } catch (e) {
        console.error(e);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
})();
