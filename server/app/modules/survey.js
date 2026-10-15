const Survey = require('../models/Survey');
const SurveyResponse = require('../models/SurveyResponse');
const User = require('../models/User');
const Designation = require('../models/Designation');
const {createSurveyPdf, createEmailTemplate, sendMail} = require("../functions");
const {kJWT_SECRET, kAPP_URL} = require("../../constants");
const jwt = require("jsonwebtoken");
const jszip = require("jszip");
const path = require("path");
const fs = require("fs");
const {t} = require("../i18n");

// A survey response is visible to the person who answered it and to staff who manage surveys
const canViewResponse = (res, response) =>
    String(response.user?._id || response.user) === String(res.locals.user._id) ||
    res.locals.userPermissions.some((permission) => permission.name === "survey" || permission.module === "survey");

module.exports = {
    createSurvey: async (req, res) => {
        try {
            const {
                campaignName,
                campaignDescription,
                campaignStartDate,
                campaignEndDate,
                employees,
                questions
            } = req.body;

            // Check questions whether either one of the questions, low or high is missing
            const invalidQuestions = questions.filter((question) => {
                let checkQuestionEmpty = Object.values(question).some((value) => value === "");
                let checkLowEmpty = Object.values(question.low).some((value) => value === "");
                let checkHighEmpty = Object.values(question.high).some((value) => value === "");

                return checkQuestionEmpty || checkLowEmpty || checkHighEmpty;
            });

            let campaignStartDateObject = new Date(new Date(campaignStartDate).setHours(0, 0, 0, 0));
            let campaignEndDateObject = new Date(new Date(campaignEndDate).setHours(23, 59, 59, 999));

            if (invalidQuestions.length > 0) {
                return res.status(400).json({success: false, message: "Questions are not properly formatted"});
            }

            const survey = new Survey({
                campaignName,
                campaignDescription,
                campaignStartDate: campaignStartDateObject,
                campaignEndDate: campaignEndDateObject,
                employees,
                questions,
                createdBy: res.locals.user._id
            });

            await survey.save();

            (async () => {
                try {
                    // Get employees by their id
                    let employeesInfo = await User.find({_id: {$in: employees}});

                    // Get unique department ids
                    let departmentIds = [...new Set(employeesInfo.map((user) => user.department))];

                    // For each department, get the designation where isLead is true
                    let designations = await Designation.find({
                        department: {
                            $in: departmentIds
                        },
                        isLead: true
                    });

                    // Find the leads of that department through the designation
                    let leads = await User.find({
                        designation: {
                            $in: designations.map((designation) => designation._id)
                        }
                    }).lean();

                    // Send notification to the leads of the department
                    if(leads.length > 0) {
                        let promises = leads.map(async (lead) => {
                            let sendNotification = User.findByIdAndUpdate(lead._id, {
                                $push: {
                                    notifications: {
                                        info: `A campaign, ${campaignName} has been created for some of your employees, which will need to be completed by ${campaignEndDateObject.toLocaleDateString("en-my", {
                                            weekday: "long",
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                            hour: "numeric",
                                            minute: "numeric",
                                        })}.`,
                                        read: false,
                                        date: new Date()
                                    }
                                }
                            });

                            let leadPromptTemplate = await createEmailTemplate(`
                                <p> This is to notify you a survey, ${campaignName} has been sent to some of your employees, which they have to complete by ${campaignEndDateObject.toLocaleDateString("en-my", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "numeric",
                                    minute: "numeric",
                                })}.</p>
                            `);

                            let sendMailAction = await sendMail(lead.email, "Survey Notification", leadPromptTemplate);

                            await Promise.all([sendNotification, sendMailAction]);
                        });

                        await Promise.all(promises);
                    }

                    // Send notification to the employees
                    if(employeesInfo.length > 0) {
                        let promises = employeesInfo.map(async (employee) => {
                            let sendNotification = User.findByIdAndUpdate(employee._id, {
                                $push: {
                                    notifications: {
                                        info: `A campaign, ${campaignName} has been created for you, which will need to be completed by ${campaignEndDateObject.toLocaleDateString("en-my", {
                                            weekday: "long",
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                            hour: "numeric",
                                            minute: "numeric",
                                        })}.`,
                                        read: false,
                                        date: new Date()
                                    }
                                }
                            });

                            // Create loginless token
                            const token = await new Promise((resolve, reject) => {
                                jwt.sign({userId: employee._id, surveyId: survey._id}, kJWT_SECRET, {expiresIn: "3d"},(err, token) => {
                                    if(err) {
                                        return reject(err);
                                    } else {
                                        return resolve(token);
                                    }
                                });
                            });

                            let employeeCallToActionTemplate = await createEmailTemplate(`
                                <p>A survey, ${campaignName} has been sent to you. Please check it out in your platform account to fill it up. Please complete the survey by ${campaignEndDateObject.toLocaleDateString("en-my", {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour: "numeric",
                                        minute: "numeric",
                                    })}.</p>
                                <p>Alternatively, you can click this link for an express survey fill up through this <a href="${kAPP_URL}/respond?token=${token}">link</a>.</p>
                                <p style="margin-top: 50px;">If the link above doesn't work, you may copy and paste this link below:</p>
                                <p style="text-align: center; margin-top: 25px">${kAPP_URL}/respond?token=${token}</p>
                            `);

                            let sendMailAction = await sendMail(employee.email, "Survey Notification", employeeCallToActionTemplate);

                            await Promise.all([sendNotification, sendMailAction]);
                        });

                        await Promise.all(promises);
                    }
                } catch (e) {
                    // Error sending notifications
                    console.error(e);
                }
            })().then(() => {
                console.log("Sent notifications to intended recipients");
            }).catch((e) => {
                console.log(e);
            });

            return res.status(201).json({success: true, message: "Survey created successfully."});
        } catch (e) {
            console.error(e);
            return res.status(500).json({success: false, message: "Could not create survey."});
        }
    },
    createSurveyResponse: async (req, res) => {
        try {
            let {
                token,
                responses
            } = req.body;

            // Decrypt jwt token
            let tokenData = await new Promise((resolve, reject) => {
                jwt.verify(token, kJWT_SECRET, (err, decoded) => {
                    if(err) {
                        return reject(err);
                    } else {
                        return resolve(decoded);
                    }
                });
            });

            // Checks valid token with campaignId and userId
            if(!tokenData || !tokenData.surveyId || !tokenData.userId) {
                return res.status(400).json({success: false, message: "Invalid token"});
            }

            let campaign = await Survey.findById(tokenData.surveyId);

            if (!campaign) {
                return res.status(404).json({success: false, message: "Campaign not found"});
            }

            let user = await User
                .findById(tokenData.userId)
                .populate("department")
                .populate("designation")
                .populate("jobGrade")
                .lean();

            if(!user) {
                return res.status(404).json({success: false, message: "User not found"});
            }

            let campaignEndDate = campaign.campaignEndDate;

            if (new Date() < campaign.campaignStartDate) {
                return res.status(400).json({success: false, message: t(req, "surveyNotStarted")});
            }

            if (new Date() > campaignEndDate) {
                return res.status(400).json({success: false, message: "Campaign has ended"});
            }

            // Check user is in the list of employees
            if(!campaign.employees.find((employee) => employee.toString() === tokenData.userId)) {
                return res.status(403).json({success: false, message: "You are not in the list of employees for this campaign"});
            }

            // Check if user has already responded
            let existingResponse = await SurveyResponse.findOne({
                campaign: campaign._id,
                user: user._id
            });

            if(existingResponse) {
                return res.status(400).json({success: false, message: "You have already responded to this campaign"});
            }

            let surveyResponse = await SurveyResponse.create({
                campaign: campaign._id,
                user: user._id,
                responses,
                completed: true
            });

            createSurveyPdf(user, campaign.toObject(), {
                _id: surveyResponse._id,
                campaign: campaign._id,
                user: user._id,
                responses,
                completed: true
            }).catch(e => {
                console.error(e);
            });

            return res.status(200).json({success: true, message: "Survey response submitted"});
        } catch (e) {
            console.error(e);
            return res.status(500).json({success: false, message: "Could not submit survey response."});
        }
    },
    getSurveysList: async (req, res) => {
        try {

            let surveys = await Survey.find({}).lean();

            // Get survey responses
            let surveyResponses = await SurveyResponse
                .find({})
                .populate("user", "-password");

            // Get list of users who have responded for a survey
            surveys = await Promise.all(surveys.map(async (survey) => {
                // Get responses for the current survey
                let currentSurveyResponses = surveyResponses.filter((response) => response.campaign.toString() === survey._id.toString());

                return {
                    ...survey,
                    completed: currentSurveyResponses
                        .map((response) => {
                            return {
                                user: response.user,
                                responseId: response._id,
                                completedAt: response.createdAt
                            }
                        }),
                    totalResponses: currentSurveyResponses.length,
                }
            }));

            return res.status(200).json({success: true, surveys});
        } catch (e) {
            console.error(e);
            return res.status(500).json({success: false, message: "Could not get surveys list."});
        }
    },
    getOwnSurveys: async (req, res) => {
        try {
            const {userId} = req.params;

            let user;

            if(userId) {
                user = await User.findById(userId);

                if(!user) {
                    return res.status(404).json({success: false, message: "User not found"});
                }
            } else {
                user = res.locals.user;
            }

            let surveys = await Survey.find({employees: user._id}).lean();

            // Check survey responses
            let surveyResponses = await SurveyResponse.find({user: user._id}).lean();

            // Match survey and survey responses, check if user has completed the survey
            surveys = surveys.map((survey) => {
                let surveyResponse = surveyResponses.find((response) => response.campaign.toString() === survey._id.toString());

                if(surveyResponse) {
                    return {
                        ...survey,
                        completed: true,
                        responseId: surveyResponse._id
                    }
                }

                return {
                    ...survey,
                    completed: false
                }
            });

            return res.status(200).json({success: true, surveys});
        } catch (e) {
            console.error(e);
            return res.status(500).json({success: false, message: "Could not get own surveys."});
        }
    },
    getSurvey: async (req, res) => {
        try {
            const {surveyId} = req.params;

            let survey = await Survey.findById(surveyId)
                .populate("employees", "-password")
                .populate({path: "employees", populate: {path: "department"}})
                .populate({path: "employees", populate: {path: "designation"}})
                .populate({path: "employees", populate: {path: "jobGrade"}})
                .lean();

            if (!survey) {
                return res.status(404).json({success: false, message: "Survey not found"});
            }

            return res.status(200).json({success: true, survey});
        } catch (e) {
            console.error(e);
            return res.status(500).json({success: false, message: "Could not get survey."});
        }
    },
    getPreparedSurvey: async (req, res) => {
        try {
            const {token} = req.query;
            const {surveyId} = req.params;

            let survey;
            let user;

            // If token exists the user does not have to log in, instead the token is used to identify the user and surveyId
            if (token) {
                // Parse JWT token
                let decoded = jwt.verify(token, kJWT_SECRET);

                // Check if the token is valid
                if (!decoded) {
                    return res.status(400).json({success: false, message: "Invalid token"});
                }

                // Get user
                user = await User.findById(decoded.userId, "-password")
                    .populate("department")
                    .populate("designation")
                    .populate("jobGrade")
                    .lean();

                survey = await Survey.findOne({
                    _id: decoded.surveyId,
                    employees: decoded.userId
                }).lean();
            } else {
                if(!surveyId) {
                    return res.status(400).json({success: false, message: "Survey ID is required"});
                }

                // Check if the user is logged in
                let sessionToken = req.cookies["sessionToken"];

                if (!sessionToken) {
                    return res.status(401).json({success: false, message: "Unauthorized"});
                }

                // Get user from the session token
                let token = await jwt.verify(sessionToken, kJWT_SECRET);

                const userData = await User.findOne({ username: token.username })
                    .populate({
                        path: 'role',
                        populate: {
                            path: 'permissions',
                        },
                    })
                    .lean();

                if (!userData) {
                    return res.status(401).json({ success: false, message: "Unauthorized" });
                }

                user = await User.findById(userData._id, "-password")
                    .populate("department")
                    .populate("designation")
                    .populate("jobGrade")
                    .lean();

                // This route has no login middleware, so use the user resolved from the cookie above
                survey = await Survey.findOne({
                    _id: surveyId,
                    employees: userData._id
                }).lean();
            }

            if (!survey) {
                return res.status(404).json({success: false, message: "Survey not found"});
            }

            if (new Date() < survey.campaignStartDate) {
                return res.status(400).json({success: false, message: t(req, "surveyNotStarted")});
            }

            // Check if user has already responded
            let existingResponse = await SurveyResponse.findOne({
                campaign: survey._id,
                user: user._id
            });

            if (existingResponse) {
                return res.status(400).json({success: false, message: "You have already responded to this campaign"});
            }

            return res.status(200).json({success: true, user, survey});
        } catch (e) {
            console.error(e);
            return res.status(500).json({success: false, message: "Could not get prepared survey."});
        }
    },
    getSurveyResponse: async (req, res) => {
        try {
            const {responseId} = req.params;

            let response = await SurveyResponse
                .findById(responseId)
                .populate("campaign")
                .populate("user", "-password")
                .populate({path: "user", populate: {path: "department"}})
                .populate({path: "user", populate: {path: "designation"}})
                .populate({path: "user", populate: {path: "jobGrade"}})
                .lean();

            if (!response) {
                return res.status(404).json({success: false, message: "Survey response not found"});
            }

            if (!canViewResponse(res, response)) {
                return res.status(403).json({success: false, message: t(req, "accessDenied")});
            }

            return res.status(200).json({success: true, response});
        } catch (e) {
            console.error(e);
            return res.status(500).json({success: false, message: "Could not get survey response."});
        }
    },
    getSurveyStatus: async (req, res) => {
        try {
            const {surveyId} = req.params;

            let survey = await Survey
                .findById(surveyId)
                .populate("employees", "-password")
                .populate({path: "employees", populate: {path: "department"}})
                .populate({path: "employees", populate: {path: "designation"}})
                .populate({path: "employees", populate: {path: "jobGrade"}})
                .lean();

            if(!survey) {
                return res.status(404).json({success: false, message: "Survey not found"});
            }

            let surveyResponses = await SurveyResponse
                .find({campaign: surveyId})
                .lean();

            // Get employees who have not completed the survey
            let employeesNotCompleted = survey.employees.filter((employee) => {
                return !surveyResponses.find((response) => response.user.toString() === employee._id.toString());
            });

            // Get employees who have completed and add responseId
            let employeesCompleted = surveyResponses.map((response) => {
                return {
                    ...survey.employees.find((employee) => employee._id.toString() === response.user.toString()),
                    responseId: response._id
                }
            });

            return res.status(200).json({success: true, survey, employeesNotCompleted, employeesCompleted});
        } catch (e) {
            console.error(e);
            return res.status(500).json({success: false, message: "Could not get employees who have not completed survey."});
        }
    },
    getSurveyStats: async (req, res) => {
        try {
            const {surveyId} = req.params;

            let survey = await Survey
                .findById(surveyId)
                .populate("employees", "-password -notifications")
                .populate({path: "employees", populate: {path: "department"}})
                .populate({path: "employees", populate: {path: "designation"}})
                .populate({path: "employees", populate: {path: "jobGrade"}})
                .lean();

            let surveyResponses = await SurveyResponse
                .find({campaign: surveyId})
                .populate("user", "-password -notifications")
                .populate({path: "user", populate: {path: "department"}})
                .populate({path: "user", populate: {path: "designation"}})
                .populate({path: "user", populate: {path: "jobGrade"}})
                .lean();

            if(!survey) {
                return res.status(404).json({success: false, message: "Survey not found"});
            }

            // Get total responses
            let totalResponses = surveyResponses.length;

            // Filter users who completed the survey
            let employeesWhoCompleted = survey.employees.filter((employee) => surveyResponses.find((response) => response.user._id.toString() === employee._id.toString()));

            // Filter users who did not complete/do the survey
            let employeesWhoDidNotComplete = survey.employees.filter((employee) => !surveyResponses.find((response) => response.user._id.toString() === employee._id.toString()));

            // Get average rating for each question
            let averageRatings = survey.questions.map((question) => {
                let totalRating = surveyResponses.reduce((acc, response) => {
                    let responseRating = response.responses.find((response) => response.question === question.question);
                    return acc + responseRating.rating;
                }, 0);

                // Count rating distribution with all ratings
                let ratingDistribution = surveyResponses.reduce((acc, response) => {
                    let responseRating = response.responses.find((response) => response.question === question.question);

                    if(acc[responseRating.rating]) {
                        acc[responseRating.rating]++;
                    } else {
                        acc[responseRating.rating] = 1;
                    }

                    return acc;
                }, {1: 0, 2: 0, 3: 0, 4: 0, 5: 0});

                // Get highest and lowest rating from among the ratings
                let ratings = surveyResponses.map((response) => {
                    let responseRating = response.responses.find((response) => response.question === question.question);
                    return responseRating.rating;
                });

                let highestRating = Math.max(...ratings);
                let lowestRating = Math.min(...ratings);

                return {
                    question: question.question,
                    totalRating,
                    highestRating,
                    lowestRating,
                    ratingDistribution,
                    averageRating: totalRating / totalResponses
                }
            });

            return res.status(200).json({
                success: true,
                survey,
                surveyResponses,
                totalResponses,
                averageRatings,
                employeesWhoCompleted,
                employeesWhoDidNotComplete
            });
        } catch (e) {
            console.error(e);
            return res.status(500).json({success: false, message: "Could not get survey stats"});
        }
    },
    generateLoginlessSurveyToken: async (req, res) => {
        try {
            const {surveyId, userId} = req.body;

            // A token lets its holder answer as that user, so only issue one for yourself
            if (userId && userId !== res.locals.user._id.toString()) {
                return res.status(403).json({success: false, message: t(req, "surveyAsYourself")});
            }

            const user = await User
                .findById(res.locals.user._id, "-password")
                .populate("department")
                .populate("designation")
                .populate("jobGrade")
                .lean();

            if(!user) {
                return res.status(404).json({success: false, message: "User not found"});
            }

            const survey = await Survey.findById(surveyId);

            if(!survey) {
                return res.status(404).json({success: false, message: "Survey not found"});
            }

            const token = await new Promise((resolve, reject) => {
                jwt.sign({userId: user._id, surveyId: survey._id}, kJWT_SECRET, {expiresIn: "3d"},(err, token) => {
                    if(err) {
                        return reject(err);
                    } else {
                        return resolve(token);
                    }
                });
            });

            return res.status(200).json({success: true, user, token});
        } catch(e) {
            console.error(e);
            return res.status(500).json({success: false, message: "Could not generate token"});
        }
    },
    updateSurvey: async (req, res) => {
        try {
            const {
                campaignId,
                campaignDescription,
                campaignName,
                campaignStartDate,
                campaignEndDate,
                questions
            } = req.body;

            let campaign = await Survey.findById(campaignId);

            if(!campaign) {
                return res.status(404).json({success: false, message: "Campaign not found"});
            }

            let campaignStartDateObject = new Date(campaignStartDate);
            let campaignEndDateObject = new Date(campaignEndDate);

            // Responses are matched to questions, so once people have answered, the questions are fixed.
            // Name, description and dates can still change, and existing responses are kept.
            const questionText = (list) => JSON.stringify((list || []).map((q) => [q.question, q.low, q.high]));
            const responseCount = await SurveyResponse.countDocuments({campaign: campaignId});
            if (responseCount > 0 && questionText(campaign.questions) !== questionText(questions)) {
                return res.status(409).json({success: false, message: t(req, "surveyQuestionsLocked", {count: responseCount})});
            }

            campaign.campaignName = campaignName;
            campaign.campaignDescription = campaignDescription;
            campaign.campaignStartDate = campaignStartDateObject;
            campaign.campaignEndDate = campaignEndDateObject;
            campaign.questions = questions;

            await campaign.save();

            (async () => {
                // Get employees by their id
                const employeeIds = campaign.employees.map((employee) => employee._id);
                let employeesInfo = await User.find({_id: {$in: employeeIds}});

                // Get unique department ids
                let departmentIds = [...new Set(employeesInfo.map((user) => user.department))];

                // For each department, get the designation where isLead is true
                let designations = await Designation.find({
                    department: {
                        $in: departmentIds
                    },
                    isLead: true
                });

                // Find the leads of that department through the designation
                let leads = await User.find({
                    designation: {
                        $in: designations.map((designation) => designation._id)
                    }
                });

                // Send notification to the leads of the department
                if(leads.length > 0) {
                    let promises = leads.map(async (lead) => {
                        let sendNotification = User.findByIdAndUpdate(lead._id, {
                            $push: {
                                notifications: {
                                    info: `A campaign, ${campaignName} has been updated. Some of your employees will need to be completed by ${campaignEndDateObject.toLocaleDateString("en-my", {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour: "numeric",
                                        minute: "numeric",
                                    })}.`,
                                    read: false,
                                    date: new Date()
                                }
                            }
                        });

                        let leadPromptTemplate = await createEmailTemplate(`
                                <p> This is to notify you a survey, ${campaignName} has been updated. Some of your employees will have to complete by ${campaignEndDateObject.toLocaleDateString("en-my", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "numeric",
                            minute: "numeric",
                        })}.</p>
                            `);

                        let sendMailAction = await sendMail(lead.email, "Survey Update Notification", leadPromptTemplate);

                        await Promise.all([sendNotification, sendMailAction]);
                    });

                    await Promise.all(promises);
                }

                // Send notification to the employees
                if(employeesInfo.length > 0) {
                    let promises = employeesInfo.map(async (employee) => {
                        let sendNotification = User.findByIdAndUpdate(employee._id, {
                            $push: {
                                notifications: {
                                    info: `A campaign, ${campaignName} has been updated for you, which you will need to be completed by ${campaignEndDateObject.toLocaleDateString("en-my", {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour: "numeric",
                                        minute: "numeric",
                                    })}.`,
                                    read: false,
                                    date: new Date()
                                }
                            }
                        });

                        // Create loginless token
                        const token = await new Promise((resolve, reject) => {
                            jwt.sign({userId: employee._id, surveyId: campaign._id}, kJWT_SECRET, {expiresIn: "3d"},(err, token) => {
                                if(err) {
                                    return reject(err);
                                } else {
                                    return resolve(token);
                                }
                            });
                        });

                        let employeeCallToActionTemplate = await createEmailTemplate(`
                                <p>A survey, ${campaignName} has been updated for you. Please check it out in your platform account to fill it up. Please complete the survey by ${campaignEndDateObject.toLocaleDateString("en-my", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "numeric",
                            minute: "numeric",
                        })}.</p>
                                <p>Alternatively, you can click this link for an express survey fill up through this <a href="${kAPP_URL}/respond?token=${token}">link</a>.</p>
                                <p style="margin-top: 50px;">If the link above doesn't work, you may copy and paste this link below:</p>
                                <p style="text-align: center; margin-top: 25px">${kAPP_URL}/respond?token=${token}</p>
                            `);

                        let sendMailAction = await sendMail(employee.email, "Survey Notification", employeeCallToActionTemplate);

                        await Promise.all([sendNotification, sendMailAction]);
                    });

                    await Promise.all(promises);
                }


                await Promise.all(employeesInfo.map((employee) => employee.save()));
                await Promise.all(leads.map((lead) => lead.save()));
            })().then(() => {
                console.log("Sent notifications to intended recipients");
            }).catch((e) => {
                console.error(e);
            });

            return res.status(200).json({success: true, message: "Survey updated"});
        } catch (e) {
            console.error(e);
            return res.status(500).json({success: false, message: "Could not update survey."});
        }
    },
    getSurveyPdf: async (req, res) => {
        try {
            const { responseId } = req.params;
    
            let response = await SurveyResponse
                .findById(responseId)
                .populate("user", "-password")
                .populate({path: "user", populate: {path: "department"}})
                .populate({path: "user", populate: {path: "designation"}})
                .populate({path: "user", populate: {path: "jobGrade"}})
                .populate("campaign")
                .lean();
    
            if (!response) {
                return res.status(404).json({ success: false, message: "Response not found" });
            }

            if (!canViewResponse(res, response)) {
                return res.status(403).json({ success: false, message: t(req, "accessDenied") });
            }

            let pdf = response.pdf;

            // Get pdf file path; responses whose PDF was never generated have no file name, so the
            // existence check below fails and a new PDF is created
            let pdfPath = path.resolve(process.cwd(), "resources/uploads", pdf || "no-pdf-yet");
    
            // Check if the file exists
            fs.access(pdfPath, fs.constants.F_OK, async (err) => {
                if (err) {
                    console.error(`File ${pdfPath} does not exist, creating new one`);
                    try {
                        pdf = await createSurveyPdf(response.user, response.campaign, response);
                        pdfPath = path.resolve(process.cwd(), "resources/uploads", pdf);
                    } catch (e) {
                        console.error(e);
                        return res.status(500).json({ success: false, message: "Could not get survey pdf." });
                    }
                }
    
                // Create a read stream
                let pdfStream = fs.createReadStream(pdfPath);
    
                // Handle stream errors
                pdfStream.on('error', (err) => {
                    console.error(`Error reading file ${pdfPath}: ${err}`);
                    return res.status(500).json({ success: false, message: "Could not get survey pdf." });
                });
    
                // Send the pdf file with filename (employeeId-campaign.pdf)
                res.set("Content-Type", "application/pdf");
                res.set("Content-Disposition", `attachment; filename=${response.user.employeeId}-${response.campaign.campaignName}.pdf`);
                
                // Pipe the pdfStream to the response
                pdfStream.pipe(res);
            });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ success: false, message: "Could not get survey pdf." });
        }
    },
    getSurveyRecords : async (req, res) => {
        try {
            const { surveyId } = req.params;
    
            const survey = await Survey.findById(surveyId);
            if (!survey) {
                return res.status(404).json({ success: false, message: "Survey not found" });
            }
    
            // Get all responses of that survey id
            const surveyResponses = await SurveyResponse.find({ campaign: surveyId })
                .populate("user", "-password")
                .populate({ path: "user", populate: { path: "department" } })
                .populate({ path: "user", populate: { path: "designation" } })
                .populate({ path: "user", populate: { path: "jobGrade" } })
                .populate("campaign")
                .lean();
    
            if (surveyResponses.length === 0) {
                return res.status(404).json({ success: false, message: "No records found" });
            }
    
            // Initialize a new JSZip instance
            const zip = new jszip();
    
            // Add PDFs to the zip
            for (let surveyResponse of surveyResponses) {
                const pdfPath = path.resolve(process.cwd(), "resources/uploads", surveyResponse.pdf);
                try {
                    // Check if the file exists and is readable
                    fs.accessSync(pdfPath, fs.constants.F_OK | fs.constants.R_OK);
                    
                    // Read the PDF content
                    const pdfContent = fs.readFileSync(pdfPath);
                    // Add the PDF to the zip with the filename as the user's employee ID
                    zip.file(`${surveyResponse.user.employeeId}.pdf`, pdfContent, { binary: true });
                } catch (e) {
                    console.warn(`Skipping PDF at ${pdfPath} for employee ID ${surveyResponse.user.employeeId}: ${e.message}`);
                    // Generate a new PDF for the response
                    const newPdf = await createSurveyPdf(surveyResponse.user, surveyResponse.campaign, surveyResponse);
                    const newPdfPath = path.resolve(process.cwd(), "resources/uploads", newPdf);
                    const newPdfContent = fs.readFileSync(newPdfPath);
                    zip.file(`${surveyResponse.user.employeeId}.pdf`, newPdfContent, { binary: true });
                }
            }
    
            // Generate the zip file
            const zipContent = await zip.generateAsync({ type: "nodebuffer" });
    
            // Send the zip file
            res.set("Content-Type", "application/zip");
            res.set("Content-Disposition", `attachment; filename=${survey.campaignName}.zip`);
            res.set("Content-Length", zipContent.length);
            res.send(zipContent);
        } catch (e) {
            console.error(e);
            return res.status(500).json({ success: false, message: "Could not get survey records" });
        }
    },
    deleteSurvey: async (req, res) => {
        try {
            const {surveyId} = req.body;

            let survey = await Survey.findById(surveyId);

            if(!survey) {
                return res.status(404).json({success: false, message: "Survey not found"});
            }

            await survey.deleteOne();

            // Clear survey responses
            await SurveyResponse.deleteMany({campaign: surveyId});

            return res.status(200).json({success: true, message: "Survey deleted"});
        } catch (e) {
            console.error(e);
            return res.status(500).json({success: false, message: "Could not delete survey."});
        }
    },
};