const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load backend env
dotenv.config({ path: path.join(__dirname, "../.env") });

const Show = require("../models/Show");

async function check() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/movieBooking";
    console.log(`Connecting to ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log("Connected.");

    const shows = await Show.find();
    console.log(`Checking ${shows.length} shows...`);

    let withSeats = 0;
    let withoutSeats = 0;

    shows.forEach(show => {
      if (show.seats && show.seats.length > 0) {
        withSeats++;
      } else {
        withoutSeats++;
      }
    });

    console.log(`Summary:`);
    console.log(`- Shows WITH seats: ${withSeats}`);
    console.log(`- Shows WITHOUT seats: ${withoutSeats}`);

    if (withoutSeats > 0) {
      console.log("\n⚠️ Sample IDs of shows missing seats:");
      shows.filter(s => !s.seats || s.seats.length === 0).slice(0, 5).forEach(s => {
        console.log(`- ID: ${s._id}, Time: ${s.showTime}`);
      });
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
