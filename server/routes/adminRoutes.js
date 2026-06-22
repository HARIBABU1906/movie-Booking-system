const express = require("express");
const {
  getAdminBookings,
  getAdminMovies,
  getAdminUsers,
  getDashboardStats,
} = require("../controllers/adminController");
const { authorize, protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/movies", getAdminMovies);
router.get("/bookings", getAdminBookings);
router.get("/users", getAdminUsers);
router.get("/stats", getDashboardStats);

module.exports = router;
