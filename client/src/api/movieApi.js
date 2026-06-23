import api from "./client";
import { mockMovies } from "../mockData/movies";

export async function login(payload) {
  const response = await api.post("/auth/login", payload);
  return response.data;
}

export async function register(payload) {
  const response = await api.post("/auth/register", payload);
  return response.data;
}


export async function fetchMovies() {
  try {
    const response = await api.get("/movies");
    return response.data;
  } catch (error) {
    // Fallback to mock data for UI demo when backend is unavailable
    console.warn("fetchMovies: falling back to mock data", error);
    return mockMovies;
  }
}

export async function addMovie(payload) {
  const response = await api.post("/movies", payload);
  return response.data;
}

export async function updateMovie(id, payload) {
  const response = await api.put(`/movies/${id}`, payload);
  return response.data;
}

export async function deleteMovie(id) {
  const response = await api.delete(`/movies/${id}`);
  return response.data;
}

export async function fetchAdminMovies() {
  try {
    const response = await api.get("/admin/movies");
    return response.data;
  } catch (error) {
    console.warn("fetchAdminMovies: fallback to mock data", error);
    return mockMovies;
  }
}

export async function fetchAdminBookings() {
  try {
    const response = await api.get("/admin/bookings");
    return response.data;
  } catch (error) {
    console.warn("fetchAdminBookings: fallback to mock data", error);
    return [
      {
        bookingCode: "BKG123",
        movieName: "The Grand Adventure",
        customerName: "John Doe",
        amount: 250,
        status: "CONFIRMED"
      },
      {
        bookingCode: "BKG124",
        movieName: "Comedy Nights",
        customerName: "Jane Smith",
        amount: 500,
        status: "CONFIRMED"
      }
    ];
  }
}

export async function fetchOwnerShows() {
  const response = await api.get("/theaters/owner/shows");
  return response.data;
}

// 🕒 Real-Time Seat Availability
export async function fetchShowAvailability(showId) {
  const response = await api.get(`/theaters/shows/${showId}/seats`);
  return response.data;
}

// 🔒 Seat Locking
export async function lockSeats(payload) {
  const response = await api.post("/bookings/lock", payload);
  return response.data;
}

// 💳 Confirm Booking
export async function confirmBooking(bookingId, payload) {
  const response = await api.post(`/bookings/confirm/${bookingId}`, payload);
  return response.data;
}

// Legacy / Support for old components
export async function fetchBookedSeats({ movieId, theater, showTime }) {
  const response = await api.get("/theaters/shows/seats", {
    params: { movieId, theater, showTime },
  });
  return response.data;
}

export async function createBooking(payload) {
  const response = await api.post("/bookings", payload);
  return response.data;
}

export async function fetchBooking(id) {
  const response = await api.get(`/bookings/${id}`);
  return response.data;
}

export async function addMovieReview(id, payload) {
  const response = await api.post(`/movies/${id}/reviews`, payload);
  return response.data;
}

export async function createTheater(payload) {
  const response = await api.post("/theaters", payload);
  return response.data;
}

export async function createShow(payload) {
  const response = await api.post("/theaters/shows", payload);
  return response.data;
}

export async function fetchAllTheaters() {
  try {
    const response = await api.get("/theaters");
    return response.data;
  } catch (error) {
    console.warn("fetchAllTheaters: fallback to empty list", error);
    return [];
  }
}

export async function fetchAdminStats() {
  try {
    const response = await api.get("/admin/stats");
    return response.data;
  } catch (error) {
    console.warn("fetchAdminStats: fallback to mock data", error);
    return { totalMovies: 3, totalUsers: 15, totalBookings: 2, totalRevenue: 750 };
  }
}
