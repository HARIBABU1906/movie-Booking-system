const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    showId: { type: mongoose.Schema.Types.ObjectId, ref: "Show", required: true },
    seats: [{ type: String, required: true }], // e.g., ["A1", "A2"] array of Seat ID strings
    totalPrice: { type: Number, required: true, min: 0 },
    bookingCode: { type: String, required: true, unique: true },
    
    // Status handles payment simulation flow & locks
    status: { 
      type: String, 
      enum: ["PENDING", "CONFIRMED", "CANCELLED", "PAYMENT_FAILED"], 
      default: "PENDING" 
    },
    paymentId: { type: String, default: null }, // Mock Stripe/Razorpay ref
    paymentMethod: { 
      type: String, 
      enum: ["CARD", "UPI", "QR"], 
      default: "CARD" 
    },
    
    // 🚀 Advanced feature: downloadable ticket and QRCode string
    ticketPdfUrl: { type: String, default: null },
    ticketQrCode: { type: String, default: null } 
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
