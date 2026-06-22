const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

async function cleanup() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/movieBooking";
    console.log(`Connecting to ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log("Connected.");

    const db = mongoose.connection.db;
    const collection = db.collection("bookings");

    console.log("Dropping problematic indexes...");
    
    try {
      await collection.dropIndex("bookingCode_1");
      console.log("✅ Dropped bookingCode_1");
    } catch (e) {
      console.log("⚠️ Could not drop bookingCode_1 (likely doesn't exist):", e.message);
    }

    try {
      await collection.dropIndex("movieId_1");
      console.log("✅ Dropped movieId_1");
    } catch (e) {
      console.log("⚠️ Could not drop movieId_1 (likely doesn't exist):", e.message);
    }

    console.log("Cleanup complete.");
    process.exit(0);
  } catch (err) {
    console.error("Cleanup failed:", err);
    process.exit(1);
  }
}

cleanup();
