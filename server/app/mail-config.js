const nodemailer = require("nodemailer");
const {kSMTP_HOST, kSMTP_PORT, kSMTP_USER, kSMTP_PASSWORD, kEMAIL_USERNAME, kEMAIL_PASSWORD} = require("../constants");

// One mail transport for every email: SMTP_* when configured, otherwise the Gmail account in EMAIL_*
module.exports = kSMTP_HOST
    ? nodemailer.createTransport({
        host: kSMTP_HOST,
        port: kSMTP_PORT,
        secure: true,
        secureProtocol: 'TLSv1_2',
        auth: {
            user: kSMTP_USER,
            pass: kSMTP_PASSWORD,
        },
    })
    : nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: kEMAIL_USERNAME,
            pass: kEMAIL_PASSWORD,
        },
    });
