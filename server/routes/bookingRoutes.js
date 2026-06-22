const express = require("express");
const {
  lockSeats,
  confirmBooking,
  getMyBookings,
} = require("../controllers/bookingController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// 1. Lock Seats before payment
router.post("/lock", protect, lockSeats);

// 2. Confirm Booking (Dummy Payment Simulation)
router.post("/confirm/:bookingId", protect, confirmBooking);

// 3. User Booking History
router.get("/my", protect, getMyBookings);

module.exports = router;
