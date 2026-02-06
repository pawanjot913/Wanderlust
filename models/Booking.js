const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  listing: { type: Schema.Types.ObjectId, ref: "Listing", required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  guests: { type: Number, default: 1 },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ["pending","confirmed","rejected"], default: "pending" }
}, { timestamps: true });

// Prevent OverwriteModelError
const Booking = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);

module.exports = Booking;
