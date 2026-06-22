const mongoose = require("mongoose");
const Movie = require("./models/Movie");

async function seedTrending() {
  await mongoose.connect("mongodb://localhost:27017/movie-booking-system");
  console.log("Connected to MongoDB");

  const movies = await Movie.find().limit(5);
  if (movies.length < 5) {
    console.log("Not enough movies to set 5 as trending. Please add more movies first.");
    process.exit(0);
  }

  const trendingData = [
    { name: "Avatar: The Way of Water", director: "James Cameron", runtime: "192m", description: "Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Na'vi race to protect their home." },
    { name: "Inception", director: "Christopher Nolan", runtime: "148m", description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O." },
    { name: "The Dark Knight", director: "Christopher Nolan", runtime: "152m", description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice." },
    { name: "Interstellar", director: "Christopher Nolan", runtime: "169m", description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival." },
    { name: "Avengers: Endgame", director: "Anthony Russo, Joe Russo", runtime: "181m" , description: "After the devastating events of Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to restore balance to the universe." }
  ];

  for (let i = 0; i < 5; i++) {
    const movie = movies[i];
    const data = trendingData[i];
    movie.isTrending = true;
    movie.name = data.name;
    movie.director = data.director;
    movie.runtime = data.runtime;
    movie.description = data.description;
    await movie.save();
    console.log(`Updated ${movie.name} to Trending`);
  }

  console.log("Successfully updated 5 movies to Trending with premium metadata");
  process.exit(0);
}

seedTrending();
