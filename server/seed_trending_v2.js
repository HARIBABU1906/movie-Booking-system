const mongoose = require("mongoose");
const Movie = require("./models/Movie");
const Theater = require("./models/Theater");
const Show = require("./models/Show");
const { generateSeatMap } = require("./utils/seatUtils");

async function seedTrending() {
  await mongoose.connect("mongodb://localhost:27017/movie-booking-system");
  console.log("Connected to MongoDB");

  // Create a default theater if none exists
  let theater = await Theater.findOne();
  if (!theater) {
    theater = await Theater.create({ name: "Grand Cinema", district: "Chennai", location: "Premium Screen" });
  }

  const trendingData = [
    { name: "Avatar: The Way of Water", director: "James Cameron", runtime: "192m", poster: "https://images.alphacoders.com/128/1284895.jpg", trailerId: "d9MyW72ELq0", description: "Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Na'vi race to protect their home." },
    { name: "Inception", director: "Christopher Nolan", runtime: "148m", poster: "https://images.alphacoders.com/210/210515.jpg", trailerId: "YoHD9XEInc0", description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O." },
    { name: "The Dark Knight", director: "Christopher Nolan", runtime: "152m", poster: "https://images.alphacoders.com/125/125633.jpg", trailerId: "EXeTwQWrcwY", description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice." },
    { name: "Interstellar", director: "Christopher Nolan", runtime: "169m", poster: "https://images.alphacoders.com/542/542526.jpg", trailerId: "zSWdZVtXT7E", description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival." },
    { name: "Avengers: Endgame", director: "Anthony Russo, Joe Russo", runtime: "181m" , poster: "https://images.alphacoders.com/974/974950.jpg", trailerId: "TcMBFSGVi1c", description: "After the devastating events of Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to restore balance to the universe." }
  ];

  for (const data of trendingData) {
    // Upsert movie
    let movie = await Movie.findOne({ name: data.name });
    if (!movie) {
      movie = await Movie.create({
        ...data,
        language: "English",
        district: "Chennai",
        genre: ["Action", "Sci-Fi"],
        isTrending: true,
        status: "NOW_SHOWING"
      });
    } else {
      Object.assign(movie, data, { isTrending: true, status: "NOW_SHOWING" });
      await movie.save();
    }

    // Ensure shows exist for the movie
    let show = await Show.findOne({ movieId: movie._id });
    if (!show) {
      await Show.create({
        movieId: movie._id,
        theaterId: theater._id,
        showTime: "10:00 AM",
        totalSeats: generateSeatMap(),
        bookedSeats: []
      });
    }
    console.log(`Ensured trending movie: ${movie.name}`);
  }

  console.log("Successfully seeded 5 premium trending movies.");
  process.exit(0);
}

seedTrending();
