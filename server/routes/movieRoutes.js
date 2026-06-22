const express = require("express");
const reviewRoutes = require("./reviewRoutes");
const {
  createMovie,
  deleteMovie,
  getMovieById,
  getMovies,
  updateMovie,
} = require("../controllers/movieController");
const { authorize, protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use("/:id/reviews", reviewRoutes);

router.get("/", getMovies);
router.get("/:id", getMovieById);
router.post("/", protect, authorize("admin"), createMovie);
router.put("/:id", protect, authorize("admin"), updateMovie);
router.delete("/:id", protect, authorize("admin"), deleteMovie);

module.exports = router;
