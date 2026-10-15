require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const cookieParser = require("cookie-parser");
const {kPORT, kMONGODB_URI, kMONGODB_NAME, kJWT_SECRET, kCORS_ORIGIN} = require("./constants");

// Refuse to start without a secret; a guessable default would let anyone forge login tokens
if (!kJWT_SECRET) {
  console.error("❌ JWT_SECRET is not set. Copy server/.env.example to server/.env and fill it in.");
  process.exit(1);
}

const app = express();

// Behind a reverse proxy (Nginx, Caddy), login limits must see each visitor's address rather than the proxy's
if (process.env.TRUST_PROXY) {
  const trustProxy = process.env.TRUST_PROXY;
  app.set("trust proxy", /^\d+$/.test(trustProxy) ? Number(trustProxy) : trustProxy === "true" || trustProxy);
}

const kAPIPrefix = "/api";

// Folders the upload, PDF and logging code write into (relative to the server folder)
const uploadPath = path.resolve(process.cwd(), "resources/uploads");
const loggerPath = path.resolve(process.cwd(), "resources/logs");
// Built React client, served by this server so the whole app runs on one port
const clientDistPath = path.resolve(__dirname, process.env.CLIENT_DIST_PATH || "../client/dist");

app.use(cookieParser());
// Only needed when the client runs on its own dev server (npm run dev); the built client is same-origin
app.use(cors({
  origin: kCORS_ORIGIN.split(",").map((origin) => origin.trim()),
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount your actual router
const router = require("./app/routes");
app.use(kAPIPrefix, router);

// Logo and stylesheet referenced by the PDF and email templates
app.use("/assets", express.static(path.resolve(process.cwd(), "resources/public")));

// Serve the built client, falling back to index.html so React Router can handle page URLs
if (fs.existsSync(path.join(clientDistPath, "index.html"))) {
  app.use(express.static(clientDistPath));
  app.get(/^(?!\/api\/).*/, (req, res) => res.sendFile(path.join(clientDistPath, "index.html")));
} else {
  console.warn("Client build not found, serving the API only. Run `npm run build` in the project root to include the website.");
}

// Last-resort error handler so a failing request returns an error instead of crashing the server
app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  return res.status(500).json({ success: false, message: "Internal server error" });
});

// Background jobs (emails, PDFs) run after the response is sent; log their failures instead of exiting
process.on("unhandledRejection", (err) => {
  console.error("Unhandled promise rejection:", err);
});

// Start the server only after connecting to MongoDB
async function startServer() {
  try {
    await mongoose.connect(kMONGODB_URI, {
      dbName: kMONGODB_NAME,
    });

    console.log("✅ Connected to MongoDB:", mongoose.connection.db.databaseName);

    fs.mkdirSync(uploadPath, { recursive: true });
    fs.mkdirSync(loggerPath, { recursive: true });

    // Create the default roles and permissions on a fresh database (skipped when they exist)
    await require("./bootstrap").initialize();

    app.listen(kPORT, () => {
      console.log(`🚀 Server now listening to port ${kPORT}`);
    });

  } catch (err) {
    console.error("❌ Failed to start:", err.message);
    process.exit(1);
  }
}

startServer();
