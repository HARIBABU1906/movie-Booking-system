const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // Reverted back to `name` from `title` to fix frontend crash
    language: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true }, // Restored `district` which was missing
    description: { type: String, default: "" },
    genre: [{ type: String }], // Array for multiple genres e.g., ["Action", "Sci-Fi"]
    cast: [{ type: String }], // e.g., ["Leo DiCaprio", "Tom Hardy"]
    durationInMins: { type: Number, default: 120 }, // Mandatory showing duration
    releaseDate: { type: Date, default: Date.now },
    posterUrl: { type: String, default: "" }, // 🚀 Placeholder for Cloudinary integration
    poster: { type: String, default: "" }, // Kept for backward compatibility
    trailerId: { type: String, default: "" }, // Kept for backward compatibility
    director: { type: String, default: "" }, // 🎬 Movie Director
    runtime: { type: String, default: "" }, // 🕒 e.g., "192m" or "2h 30m"
    rating: { type: Number, default: 0 },
    reviews: [ // 🚀 Ratings & Reviews Integration
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String }
      }
    ],
    status: { 
      type: String, 
      enum: ["NOW_SHOWING", "COMING_SOON"], 
      default: "NOW_SHOWING" 
    },
    isTrending: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Movie", movieSchema);
