const envConfig = require("env.config");
const fs = require("fs");

if(envConfig.environmentSrc === "file") {
    require("dotenv").config({path: envConfig.environmentPath});
} else if(envConfig.environmentSrc === "local") {
    require("dotenv").config();
} else if(envConfig.environmentSrc === "system") {
    // Do nothing
} else {
    throw new Error("No environment source");
}

const {kPORT, kMONGODB_URI, kMONGODB_NAME} = require("./constants");

// Import required modules
const logger = require("./app/logger-config");
const express = require('express');
const path = require('path');
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const routes = require("./app/routes");
const Bootstrap = require("./bootstrap");

const app = express();

// Define the upload path for file uploads
const uploadPath = path.resolve(__dirname, "resources/uploads");

// Define logger path
const loggerPath = path.resolve(__dirname, "resources/logs");

const PORT = kPORT;

app.use("/uploads", express.static(uploadPath));

app.use("/assets", express.static(path.resolve(__dirname, 'resources/public')));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:3001", "https://cckfm.marcusmarrio.com"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(async (req, res, next) => {
        try {
            // Check if the platform is being run for the first time
            let firstRun = await Bootstrap.checkPlatformFirstRun();
            if (firstRun) await Bootstrap.initialize();

            return next();
        } catch (e) {
            console.error(e);
        }
    }
);

app.use("/api", routes);

app.use((req, res, next) => {
    if (!req.url.startsWith('/api') || !req.url.startsWith('/uploads') || !req.url.startsWith('/assets')) {
        // Serve the HTML file
        let indexPage = fs.createReadStream(path.resolve(process.cwd(), "resources/views/index.html"));
        indexPage.pipe(res);
    } else {
        next();
    }
});

// If the request is not handled by the routes, send a 404 response
app.use((req, res) => {
    res.status(404).send("404 Not Found");
});

mongoose.connect(kMONGODB_URI, {
    dbName: kMONGODB_NAME,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.connection.on("error", (err) => {
    console.error(err);
});

mongoose.connection.once("open", () => {
    console.log("Database connection established");
});

if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
if (!fs.existsSync(loggerPath)) fs.mkdirSync(loggerPath);

app.listen(PORT, () => {
    console.log(`Server now listening to port ${PORT}`);
});

