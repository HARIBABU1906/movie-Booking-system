const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const Booking = require("../models/Booking");
const { generateBookingCode } = require("../utils/idUtils");

async function migrate() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/movieBooking";
    console.log(`Connecting to ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log("Connected.");

    const bookings = await Booking.find({ $or: [{ bookingCode: null }, { bookingCode: { $exists: false } }] });
    console.log(`Found ${bookings.length} bookings without a code.`);

    for (const booking of bookings) {
      booking.bookingCode = generateBookingCode();
      await booking.save();
      console.log(`Assigned code ${booking.bookingCode} to booking ${booking._id}`);
    }

    console.log("Migration complete.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

migrate();
