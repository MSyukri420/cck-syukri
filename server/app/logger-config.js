const winston = require("winston");
const {kNODE_ENV} = require("../constants");
const path = require("path");

// Create logger configuration
const logger = winston.createLogger({
    level: "debug",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.errors({ stack: true })
    ),
    defaultMeta: { service: "cck-hrpms-service" },
    transports: [
        new winston.transports.File({ filename: path.resolve(process.cwd(), "resources/logs", "error.log"), level: "error", handleExceptions: true, handleRejections: true, }),
        new winston.transports.File({ filename: path.resolve(process.cwd(), "resources/logs", "combined.log") }),
    ],
});

// // If we are not in production, log to the console
// if (kNODE_ENV !== "production") {
    logger.add(new winston.transports.Console({
        format: winston.format.json(),
    }));
// }

// Override console.log
console.log = function(message) {
    logger.info(message);
};

// Override console.warn
console.warn = function(message) {
    logger.warn(message);
};

// Override console.error
console.error = function(message) {
    logger.error(message);
};

// Listen globally for unhandled promise rejections and log them
process.on("unhandledRejection", (ex) => {
    logger.error(ex.message, ex);
});

process.on("uncaughtException", (ex) => {
    logger.error(ex.message, ex);
});

module.exports = logger;

