const mongoose = require("mongoose");

// Embed seat schema for real-time concurrency lock & booking tracking
const seatSchema = new mongoose.Schema({
  seatId: { type: String, required: true }, // e.g., "A1"
  status: { 
    type: String, 
    enum: ["AVAILABLE", "LOCKED", "BOOKED"], 
    default: "AVAILABLE" 
  },
  lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  lockTimeout: { type: Date, default: null }, // Seat Unlocks after 5 minutes naturally if unpaid
  price: { type: Number, required: true } // Price calculation (Base + Category Multiplier = total)
});

const showSchema = new mongoose.Schema(
  {
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
    theaterId: { type: mongoose.Schema.Types.ObjectId, ref: "Theater", required: true },
    screenId: { type: mongoose.Schema.Types.ObjectId, required: true }, // 🚀 Must map to a specific Theatre screen
    showTime: { type: Date, required: true }, // Strict date typing, changed from String
    baseTicketPrice: { type: Number, default: 250, min: 0 },
    seats: [seatSchema], // 🚀 Embedded seats tracking real-time layout per show!
    status: {
       type: String,
       enum: ["UPCOMING", "PLAYING", "CANCELLED", "COMPLETED"],
       default: "UPCOMING"
    }
  },
  { timestamps: true }
);

// Prevent exact same screen from starting two showings at exact same time
showSchema.index({ theaterId: 1, screenId: 1, showTime: 1 }, { unique: true });

module.exports = mongoose.model("Show", showSchema);
