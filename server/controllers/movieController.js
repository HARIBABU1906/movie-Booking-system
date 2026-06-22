const Movie = require("../models/Movie");
const Theater = require("../models/Theater");
const Show = require("../models/Show");
const Booking = require("../models/Booking");
const { generateSeatMap } = require("../utils/seatUtils");
const { movieToClient } = require("../utils/serializers");
const { extractYoutubeId } = require("../utils/stringUtils");

function normalizeTheaters(rawTheaters) {
  if (!Array.isArray(rawTheaters)) {
    return [];
  }

  return rawTheaters
    .map((item) => ({
      name: String(item?.name || "").trim(),
      times: Array.isArray(item?.times)
        ? item.times.map((time) => String(time).trim()).filter(Boolean)
        : [],
    }))
    .filter((item) => item.name && item.times.length > 0);
}

function parseTimeToDate(timeStr) {
  try {
    const now = new Date();
    // Default to today's date
    const dateStr = now.toISOString().split('T')[0];
    
    // Handle formats like "10:00 AM", "10:00AM", "22:00"
    const match = timeStr.match(/(\d+):?(\d+)?\s*(AM|PM)?/i);
    if (!match) return now;

    let [_, hours, minutes, modifier] = match;
    hours = parseInt(hours, 10);
    minutes = parseInt(minutes || "0", 10);

    if (modifier) {
      if (modifier.toUpperCase() === "PM" && hours < 12) hours += 12;
      if (modifier.toUpperCase() === "AM" && hours === 12) hours = 0;
    }

    const d = new Date(now);
    d.setHours(hours, minutes, 0, 0);
    return d;
  } catch (e) {
    return new Date();
  }
}

async function buildMovieResponse(movies) {
  const movieIds = movies.map((movie) => movie._id);
  const shows = await Show.find({ movieId: { $in: movieIds } }).populate("theaterId", "name");

  const grouped = new Map();
  for (const show of shows) {
    const movieId = String(show.movieId);
    const theaterName = show.theaterId?.name;
    if (!theaterName) {
      continue;
    }

    if (!grouped.has(movieId)) {
      grouped.set(movieId, new Map());
    }
    const theaterMap = grouped.get(movieId);
    if (!theaterMap.has(theaterName)) {
      theaterMap.set(theaterName, []);
    }
    theaterMap.get(theaterName).push({
      showId: show._id,
      time: show.showTime
    });
  }

  return movies.map((movie) => {
    const theaterMap = grouped.get(String(movie._id)) || new Map();
    const theaters = Array.from(theaterMap.entries()).map(([name, shows]) => ({
      name,
      shows, // contains { showId, time }
      times: shows.map(s => s.time) // Keep compatibility with old frontend
    }));
    return movieToClient(movie, theaters);
  });
}

async function createOrGetTheater({ name, district }) {
  const normalizedName = String(name || "").trim();
  let theater = await Theater.findOne({ name: normalizedName });
  if (!theater) {
    theater = await Theater.create({
      name: normalizedName,
      district: district || "",
      location: district || "",
      city: district || "Default City",
      screens: [{ name: "Screen 1", seatLayout: { rows: 8, cols: 10 } }]
    });
  } else if (!theater.screens || theater.screens.length === 0) {
    // Ensure existing theater has at least one screen
    theater.screens = [{ name: "Screen 1", seatLayout: { rows: 8, cols: 10 } }];
    await theater.save();
  }
  return theater;
}

async function syncShowsForMovie(movie, theaterInput) {
  await Show.deleteMany({ movieId: movie._id });

  for (const theaterData of theaterInput) {
    const theater = await createOrGetTheater({
      name: theaterData.name,
      district: movie.district,
    });

    const screenId = theater.screens?.[0]?._id; 
    if (!screenId) {
       console.error(`Theater ${theater.name} has no screens! Skipping.`);
       continue;
    }

    for (const timeStr of theaterData.times) {
      const showTime = parseTimeToDate(timeStr);
      const rawSeats = generateSeatMap();
      const seats = rawSeats.map(sId => ({
        seatId: sId,
        status: "AVAILABLE",
        price: movie.baseTicketPrice || 250
      }));

      await Show.create({
        movieId: movie._id,
        theaterId: theater._id,
        screenId: screenId,
        showTime,
        seats: seats,
        baseTicketPrice: movie.baseTicketPrice || 250
      });
    }
  }
}

async function getMovies(req, res) {
  try {
    const movies = await Movie.find({ isActive: true }).sort({ createdAt: -1 });
    const payload = await buildMovieResponse(movies);
    return res.json(payload);
  } catch (error) {
    return res.status(500).json({ message: "Unable to load movies." });
  }
}

async function getMovieById(req, res) {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie || !movie.isActive) {
      return res.status(404).json({ message: "Movie not found." });
    }
    const [payload] = await buildMovieResponse([movie]);
    return res.json(payload);
  } catch (error) {
    return res.status(500).json({ message: "Unable to load movie." });
  }
}

async function createMovie(req, res) {
  try {
    const { name, language, district, description, rating, trailerId, poster, status, isTrending, genre } = req.body;
    if (!name || !language || !district) {
      return res.status(400).json({ message: "Name, language and district are required." });
    }

    const movie = await Movie.create({
      name,
      language,
      district,
      description: description || "",
      rating: Number(rating) || 0,
      trailerId: extractYoutubeId(trailerId),
      poster: poster || "",
      status: status || "NOW_SHOWING",
      isTrending: isTrending === true || isTrending === "true",
      genre: Array.isArray(genre) ? genre : [],
      director: req.body.director || "",
      runtime: req.body.runtime || "",
    });

    const theaters = normalizeTheaters(req.body.theaters);
    if (theaters.length > 0) {
      await syncShowsForMovie(movie, theaters);
    }

    const [payload] = await buildMovieResponse([movie]);
    return res.status(201).json(payload);
  } catch (error) {
    console.error("Error creating movie:", error);
    return res.status(500).json({ message: "Unable to create movie." });
  }
}

async function updateMovie(req, res) {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found." });
    }

    const updates = ["name", "language", "district", "description", "trailerId", "poster", "status", "isTrending", "genre", "director", "runtime"];
    for (const field of updates) {
      if (req.body[field] !== undefined) {
        if (field === "isTrending") {
          movie[field] = req.body[field] === true || req.body[field] === "true";
        } else if (field === "trailerId") {
          movie[field] = extractYoutubeId(req.body[field]);
        } else {
          movie[field] = req.body[field];
        }
      }
    }
    if (req.body.rating !== undefined) {
      movie.rating = Number(req.body.rating) || 0;
    }
    await movie.save();

    const theaters = normalizeTheaters(req.body.theaters);
    if (theaters.length > 0) {
      await syncShowsForMovie(movie, theaters);
    }

    const [payload] = await buildMovieResponse([movie]);
    return res.json(payload);
  } catch (error) {
    console.error("Error updating movie:", error);
    return res.status(500).json({ message: "Unable to update movie." });
  }
}

async function deleteMovie(req, res) {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found." });
    }

    await Booking.deleteMany({ movieId: movie._id });
    await Show.deleteMany({ movieId: movie._id });
    await movie.deleteOne();
    return res.json({ message: "Movie deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Unable to delete movie." });
  }
}

module.exports = { getMovies, getMovieById, createMovie, updateMovie, deleteMovie, buildMovieResponse };
