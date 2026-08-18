const mongoose = require("mongoose");

const DB_RETRY_DELAY_MS = 10000;

const connectDB = async () => {
  try {
    const mongoUri = process.env.DATABASE_URL || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("DATABASE_URL (or MONGO_URI) is not set in .env");
    }

    await mongoose.connect(mongoUri);
    console.log("MongoDB connected ✅");
  } catch (error) {
    console.error("MongoDB error ❌", error.message || error);
    console.error(
      `Retrying MongoDB connection in ${DB_RETRY_DELAY_MS / 1000}s. Ensure Atlas IP whitelist includes your current IP.`
    );

    setTimeout(connectDB, DB_RETRY_DELAY_MS);
  }
};

module.exports = connectDB;
