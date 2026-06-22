function movieToClient(movieDoc, theaters = []) {
  return {
    id: String(movieDoc._id),
    name: movieDoc.name,
    language: movieDoc.language,
    district: movieDoc.district,
    description: movieDoc.description,
    rating: movieDoc.rating,
    trailerId: movieDoc.trailerId,
    poster: movieDoc.poster,
    status: movieDoc.status,
    isTrending: !!movieDoc.isTrending,
    genre: movieDoc.genre || [],
    director: movieDoc.director || "",
    runtime: movieDoc.runtime || "",
    theaters,
  };
}

function bookingToClient(bookingDoc) {
  return {
    id: String(bookingDoc._id),
    bookingCode: bookingDoc.bookingCode,
    movieName: bookingDoc.movieId?.name || "",
    language: bookingDoc.movieId?.language || "",
    district: bookingDoc.movieId?.district || bookingDoc.theaterId?.district || "",
    theater: bookingDoc.theaterId?.name || "",
    showTime: bookingDoc.showId?.showTime || "",
    seats: bookingDoc.seats || [],
    amount: bookingDoc.totalPrice,
    paymentStatus: bookingDoc.paymentStatus,
    bookingDate: new Date(bookingDoc.bookingDate).toLocaleString("en-IN"),
    customerName: bookingDoc.userId?.name || "",
    customerUserId: bookingDoc.userId?.email || "",
  };
}

module.exports = { movieToClient, bookingToClient };
