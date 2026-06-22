const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const Show = require("../models/Show");
const Booking = require("../models/Booking");
const User = require("../models/User");

async function diagnose() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/movieBooking";
    await mongoose.connect(mongoUri);

    const show = await Show.findOne();
    if (!show) {
      console.log("No shows found.");
      process.exit(1);
    }

    const user = await User.findOne();
    if (!user) {
      console.log("No users found.");
      process.exit(1);
    }

    const showId = show._id;
    const userId = user._id;
    const seatIds = [show.seats[0].seatId];

    console.log(`Diagnosing lock for show ${showId}, user ${userId}, seat ${seatIds}...`);

    try {
        const targetSeats = show.seats.filter(seat => seatIds.includes(seat.seatId));
        const lockExpiry = new Date(Date.now() + 5 * 60000);
        const totalPrice = targetSeats.reduce((sum, seat) => sum + (seat.price || 0), 0);

        console.log("Simulating atomic updates...");
        await Promise.all(targetSeats.map(seat => {
            return Show.updateOne(
                { _id: showId, "seats.seatId": seat.seatId },
                { $set: { "seats.$.status": "LOCKED", "seats.$.lockedBy": userId, "seats.$.lockTimeout": lockExpiry } }
            );
        }));

        console.log("Simulating Booking.create...");
        const pendingBooking = await Booking.create({
            userId, 
            showId, 
            seats: seatIds, 
            totalPrice, 
            status: "PENDING",
            bookingCode: "DIAG-" + Date.now().toString().slice(-6)
        });

        console.log("SUCCESS! Booking ID:", pendingBooking._id);
    } catch (innerErr) {
        console.error("DIAGNOSTIC ERROR REACHED:");
        console.error(innerErr);
    }

    process.exit(0);
  } catch (err) {
    console.error("SETUP ERROR:");
    console.error(err);
    process.exit(1);
  }
}

diagnose();
