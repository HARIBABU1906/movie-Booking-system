const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });

const Show = require('../server/models/Show');
const Movie = require('../server/models/Movie');

async function checkDb() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/movieBooking';
    console.log('Connecting to', mongoUri);
    await mongoose.connect(mongoUri);
    
    const show = await Show.findOne().populate('movieId');
    if (!show) {
      console.log('❌ No shows found in database.');
    } else {
      console.log('✅ Show found:', show.movieId?.name || 'Unknown Movie');
      console.log('Has seats array:', Array.isArray(show.seats));
      if (show.seats && show.seats.length > 0) {
        console.log('Number of seats:', show.seats.length);
        console.log('First seat data:', JSON.stringify(show.seats[0], null, 2));
      } else {
        console.log('Seats array is EMPTY or MISSING.');
      }
      
      // Check for old fields
      const rawShow = await mongoose.connection.db.collection('shows').findOne({ _id: show._id });
      console.log('Raw document fields:', Object.keys(rawShow));
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

checkDb();
