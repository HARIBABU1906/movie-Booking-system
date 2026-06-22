/**
 * ADVANCED MOVIE BOOKING SERVER
 * Integrated with Socket.io, Helmet Security, and Morgan Logging.
 */

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");

// Route Imports
const authRoutes = require("./routes/authRoutes");
const movieRoutes = require("./routes/movieRoutes");
const theaterRoutes = require("./routes/theaterRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { ensureDefaultUsers } = require("./controllers/authController");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { 
    origin: "https://movie-booking-system-jade.vercel.app", 
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;

// Export IO for use in controllers
app.set("io", io);

// ==========================================
// 🛡️ 1. ENTERPRISE GLOBAL MIDDLEWARES
// ==========================================

app.use(helmet()); 
app.use(cors({ origin: "https://movie-booking-system-jade.vercel.app", credentials: true })); 
app.use(morgan("dev")); 
app.use(express.json({ limit: "10kb" })); 

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: "Too many requests from this IP, please try again later."
});
app.use("/api", limiter);

// ==========================================
// 🔌 1.5. SOCKET.IO REAL-TIME LOGIC
// ==========================================
io.on("connection", (socket) => {
  console.log("⚡ [SOCKET] User Connected:", socket.id);

  socket.on("join-show", (showId) => {
    socket.join(String(showId));
    console.log(`📡 [SOCKET] User ${socket.id} joined show: ${showId}`);
  });

  socket.on("leave-show", (showId) => {
    socket.leave(String(showId));
    console.log(`📡 [SOCKET] User ${socket.id} left show: ${showId}`);
  });

  socket.on("disconnect", () => {
    console.log("⚡ [SOCKET] User Disconnected");
  });
});

// ==========================================
// 🛣️ 2. API ROUTES
// ==========================================

app.get("/", (req, res) => {
  res.status(200).json({ status: "success", message: "Movie Booking API is Online with Real-Time Sync" });
});

app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/theaters", theaterRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);

// ==========================================
// 🚨 3. CENTRALIZED ERROR HANDLING
// ==========================================

app.all("*", (req, res, next) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

app.use((err, req, res, next) => {
  console.error("💥 ERROR: ", err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: "error",
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ==========================================
// 🚦 4. GRACEFUL SHUTDOWN & STARTUP
// ==========================================

const { cleanupExpiredLocks } = require("./controllers/bookingController");

async function startServer() {
  try {
    await connectDB();
    await ensureDefaultUsers();
    
    server.listen(PORT, () => {
      console.log(`✅ [SETUP] Server & Socket.io operational on port ${PORT}`);
      
      // Execute cleanup every 1 minute
      setInterval(() => {
        cleanupExpiredLocks(io);
      }, 60000);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
    mongoose.connection.close(false, () => {
      process.exit(0);
    });
  });
});
