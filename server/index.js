require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const cookieParser = require("cookie-parser");

const app = express();

const PORT = process.env.PORT || 3000;
const kMONGODB_URI = process.env.MONGODB_URI;
const kMONGODB_NAME = process.env.MONGODB_NAME;
const kAPIPrefix = "/api";

const loggerPath = "./logs";
const uploadPath = "./uploads";

app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3001',   // must match your React dev server
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount your actual router
const router = require("./app/routes");
app.use(kAPIPrefix, router);

// Start the server only after connecting to MongoDB
async function startServer() {
  try {
    await mongoose.connect(kMONGODB_URI, {
      dbName: kMONGODB_NAME,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connected to MongoDB:", mongoose.connection.db.databaseName);

    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    if (!fs.existsSync(loggerPath)) fs.mkdirSync(loggerPath);

    app.listen(PORT, () => {
      console.log(`🚀 Server now listening to port ${PORT}`);
    });

  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err.message);
    process.exit(1);
  }
}

startServer();
