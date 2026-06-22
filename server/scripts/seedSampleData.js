const dotenv = require("dotenv");
const connectDB = require("../config/db");
const Movie = require("../models/Movie");
const Theater = require("../models/Theater");
const Show = require("../models/Show");
const { generateSeatMap } = require("../utils/seatUtils");

dotenv.config();

const sampleMovies = [
  {
    name: "Leo",
    language: "Tamil",
    district: "Chennai",
    description: "Action thriller starring Vijay.",
    rating: 7.8,
    trailerId: "Po3jStA673E",
    poster: "https://upload.wikimedia.org/wikipedia/en/7/7f/Leo_2023_Indian_film_poster.jpg",
    theaters: [
      { name: "PVR Nexus", district: "Chennai", times: ["10:00 AM", "02:00 PM", "07:00 PM"] },
      { name: "INOX Marina", district: "Chennai", times: ["11:00 AM", "06:30 PM"] },
    ],
  },
  {
    name: "Jailer",
    language: "Tamil",
    district: "Madurai",
    description: "Mass entertainer starring Rajinikanth.",
    rating: 8.1,
    trailerId: "Y5BeWdODPqo",
    poster: "https://upload.wikimedia.org/wikipedia/en/3/34/Jailer_film_poster.jpg",
    theaters: [
      { name: "Aathi Cinemas", district: "Madurai", times: ["09:30 AM", "01:30 PM", "08:00 PM"] },
    ],
  },
];

async function seed() {
  try {
    await connectDB();

    const existingCount = await Movie.countDocuments();
    if (existingCount > 0) {
      console.log("Movies already exist. Skipping seed.");
      process.exit(0);
    }

    for (const item of sampleMovies) {
      const movie = await Movie.create({
        name: item.name,
        language: item.language,
        district: item.district,
        description: item.description,
        rating: item.rating,
        trailerId: item.trailerId,
        poster: item.poster,
      });

      for (const theaterItem of item.theaters) {
        let theater = await Theater.findOne({ name: theaterItem.name });
        if (!theater) {
          theater = await Theater.create({
            name: theaterItem.name,
            location: theaterItem.district,
            district: theaterItem.district,
          });
        }

        for (const showTime of theaterItem.times) {
          await Show.create({
            movieId: movie._id,
            theaterId: theater._id,
            showTime,
            ticketPrice: 250,
            totalSeats: generateSeatMap(),
            bookedSeats: [],
          });
        }
      }
    }

    console.log("Sample movie data seeded successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
}

seed();
