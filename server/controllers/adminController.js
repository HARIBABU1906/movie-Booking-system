const Movie = require("../models/Movie");
const Theater = require("../models/Theater");
const User = require("../models/User");
const Booking = require("../models/Booking");
const { movieToClient } = require("../utils/serializers");

/**
 * @desc    Get Administrative Statistics
 */
async function getDashboardStats(req, res) {
  try {
    const totalMovies = await Movie.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalTheaters = await Theater.countDocuments();
    
    let totalBookings = 0;
    let totalRevenue = 0;

    const bookings = await Booking.find({ status: "CONFIRMED" });
    totalBookings = bookings.length;
    totalRevenue = bookings.reduce((acc, curr) => acc + (curr.totalPrice || curr.amount || 0), 0);

    res.json({
      totalMovies,
      totalUsers,
      totalTheaters,
      totalBookings,
      totalRevenue
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ message: "Server error fetching stats" });
  }
}

/**
 * @desc    Get all movies for admin
 */
async function getAdminMovies(req, res) {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    // Use buildMovieResponse to ensure theaters are loaded (so admin can edit them)
    const { buildMovieResponse } = require("./movieController");
    const transformed = await buildMovieResponse(movies);
    res.json(transformed);
  } catch (error) {
    console.error("Admin Movies Error:", error);
    res.status(500).json({ message: "Server error fetching movies" });
  }
}

/**
 * @desc    Get all bookings for admin
 */
async function getAdminBookings(req, res) {
  try {
    const bookings = await Booking.find()
      .populate("userId", "name email")
      .populate({
        path: "showId",
        populate: [
          { path: "movieId", select: "name" },
          { path: "theaterId", select: "name" }
        ]
      })
      .sort({ createdAt: -1 });

    // Transform for UI (matches standard structure in AdminPage)
    const transformed = bookings.map(b => ({
      bookingCode: b.ticketQrCode || b._id.toString().slice(-6).toUpperCase(),
      movieName: b.showId?.movieId?.name || "Deleted Movie",
      customerName: b.userId?.name || "Unknown",
      customerUserId: b.userId?._id,
      theater: b.showId?.theaterId?.name || "Theater",
      showTime: b.showId?.showTime ? new Date(b.showId.showTime).toLocaleString() : "N/A",
      seats: b.seats,
      amount: b.totalPrice || b.amount,
      bookingDate: new Date(b.createdAt).toLocaleDateString(),
      status: b.status
    }));

    res.json(transformed);
  } catch (error) {
    console.error("Fetch admin bookings error:", error);
    res.status(500).json({ message: "Server error fetching bookings" });
  }
}

/**
 * @desc    Get all users for admin
 */
async function getAdminUsers(req, res) {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching users" });
  }
}

module.exports = { 
  getDashboardStats, 
  getAdminMovies, 
  getAdminBookings, 
  getAdminUsers 
};
