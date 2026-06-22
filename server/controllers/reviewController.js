const Movie = require("../models/Movie");

/**
 * @desc    Add a review to a movie
 * @route   POST /api/movies/:id/reviews
 * @access  Private
 */
async function addMovieReview(req, res) {
  try {
    const { rating, comment } = req.body;
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    // Check if user already reviewed
    const alreadyReviewed = movie.reviews.find(
      (r) => String(r.userId) === String(req.user._id)
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: "Movie already reviewed" });
    }

    const review = {
      userId: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };

    movie.reviews.push(review);
    
    // Update movie rating average
    movie.rating = 
      movie.reviews.reduce((acc, item) => item.rating + acc, 0) / 
      movie.reviews.length;

    await movie.save();
    res.status(201).json({ message: "Review added", reviews: movie.reviews, rating: movie.rating });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * @desc    Delete a review
 * @route   DELETE /api/movies/:id/reviews/:reviewId
 * @access  Private
 */
async function deleteMovieReview(req, res) {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    // Find the review
    const reviewIndex = movie.reviews.findIndex(
      (r) => String(r._id) === req.params.reviewId
    );

    if (reviewIndex === -1) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if user is owner of review or admin
    if (String(movie.reviews[reviewIndex].userId) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(401).json({ message: "Not authorized" });
    }

    movie.reviews.splice(reviewIndex, 1);

    // Update movie rating average
    if (movie.reviews.length > 0) {
      movie.rating = 
        movie.reviews.reduce((acc, item) => item.rating + acc, 0) / 
        movie.reviews.length;
    } else {
      movie.rating = 0;
    }

    await movie.save();
    res.json({ message: "Review removed", reviews: movie.reviews, rating: movie.rating });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = { addMovieReview, deleteMovieReview };
