const kNODE_ENV = process.env.NODE_ENV || "development";
const kBASE_URL = process.env.BASE_URL || "localhost:3000";

module.exports = {
    kPORT: process.env.PORT || 3000,
    kMONGODB_URI: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017",
    kMONGODB_NAME: process.env.MONGODB_NAME || "cck_hrpms",
    kNODE_ENV,
    kBASE_URL,
    // Public address of the website, used for links in emails (password reset, survey invitations)
    kAPP_URL: (process.env.APP_URL || (kNODE_ENV === "production" ? `http://${kBASE_URL}` : "http://localhost:3001")).replace(/\/+$/, ""),
    kCORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3001",
    kJWT_SECRET: process.env.JWT_SECRET,
    kEMAIL_USERNAME: process.env.EMAIL_USERNAME || "",
    kEMAIL_PASSWORD: process.env.EMAIL_PASSWORD || "",
    kEMAIL_FROM: process.env.EMAIL_FROM || "",
    kSMTP_HOST: process.env.SMTP_HOST || "",
    kSMTP_PORT: process.env.SMTP_PORT || 465,
    kSMTP_USER: process.env.SMTP_USER || "",
    kSMTP_PASSWORD: process.env.SMTP_PASSWORD || "",
    kAPP_NAME: process.env.APP_NAME || "CCK Group HR Performance Measure System",
}
