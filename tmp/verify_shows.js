const mongoose = require('mongoose');
const Show = require('./server/models/Show');

async function verify() {
  const mongoUri = "mongodb://127.0.0.1:27017/movieBooking";
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB.");

  const shows = await Show.find().populate('movieId');
  console.log("Total Shows Found:", shows.length);

  if (shows.length > 0) {
    const firstShow = shows[0];
    console.log("First Show ID:", firstShow._id);
    console.log("Movie:", firstShow.movieId ? firstShow.movieId.name : "N/A");
    console.log("Seats Count:", firstShow.seats ? firstShow.seats.length : "N/A");
    if (firstShow.seats && firstShow.seats.length > 0) {
      console.log("First Seat Example:", JSON.stringify(firstShow.seats[0], null, 2));
    }
  }

  process.exit(0);
}

verify().catch(err => {
  console.error(err);
  process.exit(1);
});
