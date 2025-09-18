// init/index.js
const path = require("path");
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

// load .env explicitly from project root (one level above init/)
if (process.env.NODE_ENV !== "production") {
  const envPath = path.resolve(__dirname, "..", ".env");
  require("dotenv").config({ path: envPath });
  console.log("Loaded .env from:", envPath);
}

console.log("__dirname:", __dirname);
console.log("process.cwd():", process.cwd());
console.log("NODE_ENV:", process.env.NODE_ENV);

// prefer named envs; fallback to local
const MONGO_URL =
  process.env.ATLASDB_URL;
//   "mongodb://127.0.0.1:27017/wanderlust";

function safeUri(uri) {
  if (!uri) return "undefined";
  return String(uri).replace(/(:\/\/[^:]+:)([^@]+)(@)/, "$1*****$3");
}

async function main() {
  console.log("Resolved Mongo URI (hidden):", safeUri(MONGO_URL));

  if (!MONGO_URL || MONGO_URL === "undefined") {
    console.error("ERROR: No MongoDB URI found. Check your .env or environment variables.");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URL);
    console.log("Mongoose connected (readyState):", mongoose.connection.readyState);
    // show the database name mongoose is using
    console.log("Connected DB name:", mongoose.connection?.name);

    await initDB();

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB. Done.");
    process.exit(0);
  } catch (err) {
    console.error("Connection / init error:", err);
    process.exit(1);
  }
}

const initDB = async () => {
  if (mongoose.connection.readyState !== 1) {
    throw new Error("Not connected to MongoDB (readyState=" + mongoose.connection.readyState + ")");
  }

  console.log("Clearing Listing collection...");
  await Listing.deleteMany({});
  console.log("Inserting initial documents...");

  // Use `new` with ObjectId to avoid the TypeError you saw
  const rawOwner = "68cbafcd74654c816d358604";
  const ownerId = mongoose.Types.ObjectId.isValid(rawOwner)
    ? new mongoose.Types.ObjectId(rawOwner)
    : rawOwner;

  const docs = initData.data.map((obj) => ({ ...obj, owner: ownerId }));
  await Listing.insertMany(docs);

  console.log("Data initialization complete.");
};

// start
main();
