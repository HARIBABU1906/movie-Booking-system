const Movie = require("../models/Movie");
const Theater = require("../models/Theater");
const Show = require("../models/Show");

/**
 * Helper function to generate default seats layout for a new show
 */
function generateAdvancedSeatMap(basePrice = 250) {
  const seats = [];
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  
  rows.forEach(row => {
    for (let col = 1; col <= 10; col++) {
      let price = basePrice;
      if (row === 'I' || row === 'J') price += 100;
      if (row === 'A' || row === 'B') price -= 50;

      seats.push({
        seatId: `${row}${col}`,
        status: "AVAILABLE",
        price: price
      });
    }
  });
  return seats;
}

/**
 * Get Real-Time Seat Availability
 */
async function getShowAvailability(req, res) {
  try {
    const { id } = req.params;
    const show = await Show.findById(id)
      .populate("movieId", "name poster")
      .populate("theaterId", "name location");

    if (!show) return res.status(404).json({ message: "Show not found." });

    const currentTime = new Date();
    const seatMap = show.seats.map(seat => {
      let currentStatus = seat.status;
      if (currentStatus === "LOCKED" && seat.lockTimeout && seat.lockTimeout < currentTime) {
        currentStatus = "AVAILABLE";
      }
      return { seatId: seat.seatId, status: currentStatus, price: seat.price };
    });

    return res.json({
      showDetails: {
        movie: show.movieId,
        theater: show.theaterId,
        showTime: show.showTime,
      },
      seats: seatMap
    });
  } catch (error) {
    console.error("Error fetching seat layout:", error);
    return res.status(500).json({ message: "Unable to load real-time seats." });
  }
}

/**
 * Create a Show
 */
async function createShow(req, res) {
  try {
    const { movieId, theaterId, screenId, showTime, baseTicketPrice } = req.body;
    const show = await Show.create({
      movieId,
      theaterId,
      screenId: screenId || theaterId,
      showTime: new Date(showTime),
      baseTicketPrice: baseTicketPrice || 250,
      seats: generateAdvancedSeatMap(baseTicketPrice || 250)
    });
    return res.status(201).json(show);
  } catch (error) {
    console.error("Create show error:", error);
    return res.status(500).json({ message: "Unable to create show." });
  }
}

/**
 * Create a Theater
 */
async function createTheater(req, res) {
  try {
    const { name, location, city, district, screens } = req.body;
    
    // Auto-assign ownerId from authenticated user if not admin
    const ownerId = req.user.role === 'owner' ? req.user._id : (req.body.ownerId || null);

    const theater = await Theater.create({
      name,
      location,
      city: city || "Default City",
      district,
      ownerId,
      screens: screens || [{ name: "Screen 1", seatLayout: { rows: 10, cols: 10 } }]
    });
    
    return res.status(201).json(theater);
  } catch (error) {
    console.error("Create theater error:", error);
    return res.status(500).json({ message: "Unable to create theater." });
  }
}

/**
 * Get All Theaters
 */
async function getTheaters(req, res) {
  try {
    const theaters = await Theater.find();
    return res.json(theaters);
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch theaters." });
  }
}

/**
 * Get All Shows
 */
async function getShows(req, res) {
  try {
    const { movieId } = req.query;
    const query = movieId ? { movieId } : {};
    const shows = await Show.find(query).populate("theaterId", "name location");
    return res.json(shows);
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch shows." });
  }
}

/**
 * Get Owner's Shows
 */
async function getOwnerShows(req, res) {
  try {
    const shows = await Show.find().populate("movieId", "name").populate("theaterId", "name");
    return res.json(shows);
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch owner shows." });
  }
}

module.exports = {
  createTheater,
  getTheaters,
  createShow,
  getShows,
  getShowAvailability,
  getOwnerShows,
};
