const nodemailer = require("nodemailer");
const {kSMTP_HOST, kSMTP_PORT, kSMTP_USER, kSMTP_PASSWORD} = require("../constants");

module.exports = nodemailer.createTransport({
    host: kSMTP_HOST,
    port: kSMTP_PORT,
    secure: true,
    secureProtocol: 'TLSv1_2',
    auth: {
        user: kSMTP_USER,
        pass: kSMTP_PASSWORD,
    },
});