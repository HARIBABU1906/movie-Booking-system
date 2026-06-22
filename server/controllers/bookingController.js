/**
 * ADVANCED BOOKING CONTROLLER
 */
const Booking = require("../models/Booking");
const Show = require("../models/Show");
const { generateBookingCode } = require("../utils/idUtils");

// 🕒 Helper: Add minutes to current date
function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

// 📡 Helper: Broadcast seat updates via Socket.io
async function broadcastSeats(req, showId) {
  const io = req.app.get("io");
  if (!io) return;

  try {
    const show = await Show.findById(showId);
    if (!show) return;

    const currentTime = new Date();
    const seatMap = show.seats.map(seat => {
      let status = seat.status;
      if (status === "LOCKED" && seat.lockTimeout < currentTime) {
        status = "AVAILABLE";
      }
      return { seatId: seat.seatId, status, price: seat.price };
    });

    io.to(String(showId)).emit("seats-updated", seatMap);
  } catch (err) {
    console.error("Broadcast Error:", err);
  }
}

/**
 * 🚀 1. LOCK SEATS
 */
async function lockSeats(req, res) {
  try {
    const { showId, seatIds } = req.body;
    const userId = req.user._id;

    if (!showId || !seatIds || seatIds.length === 0) {
      return res.status(400).json({ message: "ShowID and SeatIDs are required." });
    }

    const show = await Show.findById(showId);
    if (!show) return res.status(404).json({ message: "Show not found." });

    if (!show.seats || !Array.isArray(show.seats)) {
      console.error(`💥 [LOCK ERROR] Show ${showId} has no seats array!`);
      return res.status(500).json({ message: "Show configuration error. Please contact support." });
    }

    const targetSeats = show.seats.filter(seat => seatIds.includes(seat.seatId));
    
    if (targetSeats.length !== seatIds.length) {
      return res.status(400).json({ message: "One or more selected seats were not found." });
    }

    // Concurrency Check
    const unavailableSeats = targetSeats.filter(seat => {
      const isBooked = seat.status === "BOOKED";
      const isLocked = seat.status === "LOCKED" && seat.lockTimeout > new Date() && String(seat.lockedBy) !== String(userId);
      return isBooked || isLocked;
    });

    if (unavailableSeats.length > 0) {
      return res.status(409).json({ 
        message: "Some seats are no longer available.",
        unavailableSeats: unavailableSeats.map(s => s.seatId)
      });
    }

    const lockExpiry = addMinutes(new Date(), 5);
    
    // Calculate total price robustly before update
    const totalPrice = targetSeats.reduce((sum, seat) => sum + (seat.price || 0), 0);

    // Atomic-like update per seat (Mongoose updateOne with positional operator)
    await Promise.all(targetSeats.map(seat => {
      return Show.updateOne(
        { _id: showId, "seats.seatId": seat.seatId },
        { $set: { "seats.$.status": "LOCKED", "seats.$.lockedBy": userId, "seats.$.lockTimeout": lockExpiry } }
      );
    }));

    const pendingBooking = await Booking.create({
      userId, 
      showId, 
      seats: seatIds, 
      totalPrice, 
      status: "PENDING",
      bookingCode: generateBookingCode()
    });

    // Broadcast update to other users
    broadcastSeats(req, showId);

    res.status(200).json({
      message: "Seats locked for 5 minutes.",
      bookingId: pendingBooking._id,
      lockTimeout: lockExpiry,
      totalPrice
    });

  } catch (error) {
    console.error("💥 [LOCK ERROR]:", error);
    res.status(500).json({ message: "Server error during seat locking." });
  }
}

/**
 * 💳 2. CONFIRM BOOKING
 */
async function confirmBooking(req, res) {
  try {
    const { bookingId } = req.params;
    const { paymentId, paymentMethod } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found." });
    
    const show = await Show.findById(booking.showId);
    const targetSeats = show.seats.filter(seat => booking.seats.includes(seat.seatId));
    
    const isLockExpired = targetSeats.some(seat => 
      seat.status === "LOCKED" && seat.lockTimeout < new Date()
    );

    if (isLockExpired) {
      booking.status = "PAYMENT_FAILED";
      await booking.save();
      
      await Promise.all(targetSeats.map(seat => 
        Show.updateOne(
          { _id: show._id, "seats.seatId": seat.seatId },
          { $set: { "seats.$.status": "AVAILABLE", "seats.$.lockedBy": null, "seats.$.lockTimeout": null } }
        )
      ));
      
      broadcastSeats(req, show._id);
      return res.status(408).json({ message: "Time limit exceeded." });
    }

    await Promise.all(targetSeats.map(seat => 
      Show.updateOne(
        { _id: show._id, "seats.seatId": seat.seatId },
        { $set: { "seats.$.status": "BOOKED", "seats.$.lockedBy": booking.userId, "seats.$.lockTimeout": null } }
      )
    ));

    booking.status = "CONFIRMED";
    booking.paymentId = paymentId || `MOCK_PAY_${Date.now()}`;
    booking.ticketQrCode = `QR_${booking._id}_${booking.userId}`;
    await booking.save();

    broadcastSeats(req, show._id);

    res.status(200).json({ message: "Booking confirmed.", booking });

  } catch (error) {
    res.status(500).json({ message: "Failed to confirm payment." });
  }
}

/**
 * 🧹 3. SYSTEM CLEANUP (Expired Locks)
 * Can be called by a cron job or interval
 */
async function cleanupExpiredLocks(io) {
    try {
        const currentTime = new Date();
        // Clear expired locks across ALL shows
        const affectedShows = await Show.find({ "seats.status": "LOCKED", "seats.lockTimeout": { $lt: currentTime } });
        
        for (const show of affectedShows) {
            let changed = false;
            show.seats.forEach(seat => {
                if (seat.status === "LOCKED" && seat.lockTimeout < currentTime) {
                    seat.status = "AVAILABLE";
                    seat.lockedBy = null;
                    seat.lockTimeout = null;
                    changed = true;
                }
            });
            if (changed) {
                await show.save();
                // Emit to this show's room if io is provided
                if (io) {
                    const seatMap = show.seats.map(s => ({ seatId: s.seatId, status: s.status, price: s.price }));
                    io.to(String(show._id)).emit("seats-updated", seatMap);
                }
            }
        }
    } catch (err) {
        console.error("Cleanup Error:", err);
    }
}

async function getMyBookings(req, res) {
    try {
      const bookings = await Booking.find({ userId: req.user._id })
        .populate({
            path: 'showId',
            populate: [
                { path: 'movieId', select: 'name poster' },
                { path: 'theaterId', select: 'name location' }
            ]
        })
        .sort({ createdAt: -1 });
  
      return res.json({ bookings });
    } catch (error) {
      return res.status(500).json({ message: "Unable to load booking history." });
    }
}

module.exports = { lockSeats, confirmBooking, getMyBookings, cleanupExpiredLocks };
