const mongoose = require("mongoose");

const screenSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Screen 1", "IMAX"
  seatLayout: {
    rows: { type: Number, required: true, default: 10 },
    cols: { type: Number, required: true, default: 10 },
    // Advanced: Different pricing for different seats (Silver, Gold, VIP)
    categories: [
      {
        name: { type: String, required: true },
        priceMultiplier: { type: Number, default: 1 }, 
        rows: [{ type: String }] // e.g., ["A", "B", "C"] are VIP
      }
    ]
  }
});

const theaterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, default: "" },
    city: { type: String, required: true, default: "Default City" }, 
    district: { type: String },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    screens: [screenSchema], // 🚀 Embedded Screens Array with Layouts
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Theater", theaterSchema);
