const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const transporter = require('./mail-config');
const csv = require('csv');
const fs = require('fs');
const handlebars = require('handlebars');
const puppeteer = require("puppeteer");
const multer = require('multer');
const path = require('path');
const crypto = require("crypto");
const PerformanceAppraisal = require('./models/PerformanceAppraisal');
const SurveyResponse = require('./models/SurveyResponse');
const {kJWT_SECRET, kAPP_NAME, kBASE_URL} = require("../constants");
const User = require("./models/User");

handlebars.registerHelper('eq', (arg1, arg2) => arg1 === arg2);
handlebars.registerHelper('add', (arg1, arg2) => parseInt(arg1) + parseInt(arg2));
handlebars.registerHelper('range', function (start, end) {
    var accum = '';
    for (var i = start; i <= end; i++) { // Changed to <= for inclusivity
        accum += '<option value="' + i + '">Grade ' + i + '</option>';
    }
    return new handlebars.SafeString(accum);
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve(process.cwd(), 'resources', 'uploads'));
    },
    filename: function (req, file, cb) {
        cb(null, `${Math.random() * 100}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({storage: storage});

async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
}

const createSessionToken = async (username) => {
    return await jwt.sign({username: username}, kJWT_SECRET, {expiresIn: '1d'});
}

const verifySessionToken = async (sessionToken) => {
    return jwt.verify(sessionToken, kJWT_SECRET);
}

const sendMail = async (email, subject, message, attachments = []) => {
    try {
        const info = await transporter.sendMail({
            from: `${kAPP_NAME} <donotreply@${kBASE_URL}>`,
            to: email,
            subject: subject,
            html: message,
            attachments: attachments
        });

        console.log("Message sent: %s", info.messageId);
        return true;
    } catch (e) {
        throw e;
    }
}

const parseCSV = async (filePath, delimiter) => {
    let rows = [];
    let keys = [];

    return new Promise((resolve, reject) => {
        // Read file
        fs.createReadStream(filePath)
            .pipe(csv.parse({delimiter: delimiter}))
            .on('data', (row) => {
                rows.push(row);
            })
            .on('error', (error) => {
                // Handle the error here
                reject(error);
            })
            .on('end', () => {
                // Get keys from the first row
                keys = rows.shift();

                // Trim out the keys
                keys = keys.map((key) => {
                    return key.trim();
                });

                // Trim out the values
                rows = rows.map((row) => {
                    return row.map((value) => {
                        return value.trim();
                    });
                });

                // Map them into JSON
                rows = rows.map((row) => {
                    let obj = {};
                    keys.forEach((key, index) => {
                        obj[key] = row[index];
                    });
                    return obj;
                });

                return resolve(rows);
            })
    });
}

const createCSV = async (filePath, delimiter, data = []) => {
    return new Promise((resolve, _) => {
        let stream = csv.stringify({delimiter: delimiter});
        let writableStream = fs.createWriteStream(filePath);

        // Assuming data is an array of JSON objects
        // Get the keys from the first object
        let keys = Object.keys(data[0]);

        // Write the keys to the file
        stream.write(keys);

        // Now, we can write all the data
        data.map((obj) => {
            return Object.values(obj);
        }).forEach((value) => {
            stream.write(value);
        });

        stream.pipe(writableStream);

        return resolve(true);
    });
}

// Very specific functions
const notifyUser = async (user, info) => {
    user.notifications.push({
        info: info,
        read: false,
        date: new Date(),
    });
    await user.save();
}

const getNewPerformanceAppraisalStats = (performanceAppraisalObject) => {
    try {
        const {
            attributePercentageCarry,
            appraisalData,
        } = performanceAppraisalObject;

        let attributesObject = {
            knowHow: {
                attributes: [],
                percentageCarry: attributePercentageCarry.KnowHow,
            },
            problemSolving: {
                attributes: [],
                percentageCarry: attributePercentageCarry.ProblemSolving,
            },
            accountability: {
                attributes: [],
                percentageCarry: attributePercentageCarry.Accountability,
            },
        }

        // Push attributes to the respective categories
        appraisalData.forEach((attribute) => {
            // Add weighted marks to each sub attribute
            attribute.subAttributes.forEach((subAttribute) => {
                subAttribute["weightMark"] = (subAttribute.marksGiven * (subAttribute.weight / 100)).toFixed(2);
            });

            switch (attribute.attributeType) {
                case "Know-How":
                    attributesObject.knowHow.attributes.push(attribute);
                    break;
                case "Problem-Solving":
                    attributesObject.problemSolving.attributes.push(attribute);
                    break;
                case "Accountability":
                    attributesObject.accountability.attributes.push(attribute);
                    break;
            }
        });

        function calculateTotalMarks(category) {
           category["totalMarks"] = category.attributes.reduce((acc, curr) => {
               return acc + curr.subAttributes.reduce((acc, curr) => {
                   return acc + curr.marksGiven;
               }, 0);
           }, 0);
        }

        function calculateTotalWeight(category) {
            category["totalWeight"] = category.attributes.reduce((acc, curr) => {
                return acc + curr.subAttributes.reduce((acc, curr) => {
                    return acc + curr.weight;
                }, 0);
            }, 0);
        }

        function calculateTotalWeightedMarks(category) {
            category["totalWeightedMarks"] = Math.round((category.attributes.reduce((acc, curr) => {
                return acc + curr.subAttributes.reduce((acc, curr) => {
                    return acc + (curr.marksGiven * curr.weight) / 100;
                }, 0);
            }, 0)) * 1e2) / 1e2;
        }

        function calculatePercentageScore(category) {
            category["percentageScore"] = Math.round(((category.totalWeightedMarks / category.totalWeight) * category.percentageCarry) * 1e2) / 1e2;
        }

        // Calculate total marks, total weight, total weighted marks and percentage score for each category
        calculateTotalMarks(attributesObject.knowHow);
        calculateTotalMarks(attributesObject.problemSolving);
        calculateTotalMarks(attributesObject.accountability);

        calculateTotalWeight(attributesObject.knowHow);
        calculateTotalWeight(attributesObject.problemSolving);
        calculateTotalWeight(attributesObject.accountability);

        calculateTotalWeightedMarks(attributesObject.knowHow);
        calculateTotalWeightedMarks(attributesObject.problemSolving);
        calculateTotalWeightedMarks(attributesObject.accountability);

        calculatePercentageScore(attributesObject.knowHow);
        calculatePercentageScore(attributesObject.problemSolving);
        calculatePercentageScore(attributesObject.accountability);

        // Calculate total score
        attributesObject["totalScore"] = Math.round(attributesObject.knowHow.percentageScore + attributesObject.problemSolving.percentageScore + attributesObject.accountability.percentageScore);

        // Calculate grade
        if (attributesObject.totalScore >= 85) {
            attributesObject["grade"] = "A";
        } else if (attributesObject.totalScore >= 70 && attributesObject.totalScore < 85) {
            attributesObject["grade"] = "B";
        } else if (attributesObject.totalScore >= 50 && attributesObject.totalScore < 70) {
            attributesObject["grade"] = "C";
        } else if (attributesObject.totalScore >= 30 && attributesObject.totalScore < 50) {
            attributesObject["grade"] = "D";
        } else {
            attributesObject["grade"] = "E";
        }

        return attributesObject;
    } catch (e) {
        throw e;
    }
}

const formatDDMMYYYY = (date) => {
    // Separate dashes
    let dateArray = date.split('-');

    // If dd-mm-yyyy, convert to yyyy-mm-dd
    if (dateArray[0].length === 4) {
        dateArray.reverse();
    }

    // Process into date object
    return Date.parse(dateArray.join('-'));
}

const createAppraisalPdf = async (employeeDetails, timePeriod, appraiserComments, extendedPerformanceAppraisal, performanceAppraisalId) => {
    // Get path to template
    let templatePath = path.resolve(process.cwd(), "resources/views/performance-appraisal-template.hbs");

    try {
        let data = fs.readFileSync(templatePath, "utf-8");

        // Get employee comment
        let employeePerformanceAppraisal = await PerformanceAppraisal.findById(performanceAppraisalId).lean();

        // Compile template
        const template = handlebars.compile(data);

        // Create html
        const html = template({
            logoUrl: `http://${kBASE_URL}/assets/img/logo.png`,
            stylesheet: `http://${kBASE_URL}/assets/css/template.css`,
            employeeName: employeeDetails.name,
            dateJoined: employeeDetails.dateOfJoining,
            reviewPeriod: timePeriod,
            departmentName: employeeDetails.department,
            designationName: employeeDetails.designation,
            jobGradeName: employeeDetails.jobGrade,
            appraiserComment: appraiserComments,
            employeeComment: employeePerformanceAppraisal.employeeComment?.message || "",
            stats: extendedPerformanceAppraisal,
        });

        // Create new pdf
        let uuid = await createNewPdf(html);

        // Update appraisal with pdf
        await PerformanceAppraisal.findByIdAndUpdate(performanceAppraisalId, {
            pdf: uuid,
        });

        console.log(`Created performance appraisal ${uuid}`);

        return uuid;
    } catch (e) {
        throw e;
    }
}

async function createNewPdf(html) {
    try {
        // Create puppeteer instance
        let browser;

        if(process.env.CHROME_BIN) {
            browser = await puppeteer.launch({
                headless: true,
                executablePath: process.env.CHROME_BIN || null,
                args: [
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-gpu",
                    "--disable-dev-shm-usage",
                ]
            });
        } else {
            browser = await puppeteer.launch();
        }

        const page = await browser.newPage();
        await page.setContent(html, {
            waitUntil: "networkidle0"
        });

        // Create uuid
        const uuid = crypto.randomUUID();

        // Create pdf
        const pdfPath = path.resolve(process.cwd(), `resources/uploads/${uuid}`);

        await page.pdf({
            path: pdfPath,
            width: "8.5in",
            printBackground: true,
            margin: {
                top: "0.5in",
                bottom: "0.5in",
                left: "0.5in",
                right: "0.5in"
            }
        });

        // Close browser
        await browser.close();

        return uuid;
    } catch(e) {
        throw e;
    }
}

async function createEmailTemplate(message) {
    try {
        let templatePath = path.resolve(process.cwd(), "resources/views/email-template.hbs");

        // Read template file
        let data = fs.readFileSync(templatePath, "utf-8");

        // Compile template
        const template = handlebars.compile(data);

        // Create html
        return template({
            logoUrl: `http://${kBASE_URL}/assets/img/logo.png`,
            messageBody: message,
        });
    } catch (e) {
        throw e;
    }
}

async function createSurveyPdf(employee, survey, surveyResponse) {
    try {
        let templatePath = path.resolve(process.cwd(), "resources/views/survey-response-template.hbs");

        // Process survey response and add to survey
        let processedSurvey = survey.questions.map((question, index) => {
            return {
                ...question,
                rating: surveyResponse.responses[index].rating,
            }
        });

        // Read template file
        let data = fs.readFileSync(templatePath, "utf-8");

        // Compile template
        const template = handlebars.compile(data);

        // Create html
        const html = template({
            logoUrl: `http://${kBASE_URL}/assets/img/logo.png`,
            stylesheet: `http://${kBASE_URL}/assets/css/template.css`,
            employee: employee,
            campaign: survey,
            campaignStartDate: new Date(survey.campaignStartDate).toLocaleDateString("en-my", {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
            }),
            campaignEndDate: new Date(survey.campaignEndDate).toLocaleDateString("en-my", {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
            }),
            surveyResponse: processedSurvey,
        });

        // Create new pdf
        let uuid = await createNewPdf(html);

        // Update survey response with pdf
        await SurveyResponse.findByIdAndUpdate(surveyResponse._id, {
            pdf: uuid,
        });

        console.log(`Created survey response ${uuid}`);
        return uuid;
    } catch (e) {
        throw e;
    }
}

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

module.exports = {
    hashPassword,
    comparePassword,
    createSessionToken,
    verifySessionToken,
    sendMail,
    notifyUser,
    parseCSV,
    createCSV,
    upload,
    getNewPerformanceAppraisalStats,
    formatDDMMYYYY,
    createAppraisalPdf,
    createSurveyPdf,
    createEmailTemplate,
    generateEmployeeId
};