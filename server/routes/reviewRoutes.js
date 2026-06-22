const express = require("express");
const { addMovieReview, deleteMovieReview } = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router({ mergeParams: true });

router.post("/", protect, addMovieReview);
router.delete("/:reviewId", protect, deleteMovieReview);

module.exports = router;
