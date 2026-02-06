const express = require("express");
const Booking = require("../models/Booking");
const Listing = require("../models/listing");
const { isLoggedIn } = require("../middleware");

const router = express.Router();

// Route: GET /bookings/my
router.get("/my", isLoggedIn, async (req, res) => {
  try {
    
    const bookings = await Booking.find({ user: req.user._id }).populate("listing");
    
    res.render("bookings/myBookings", { bookings });
  } catch (err) {
    console.error("Error loading bookings:", err);
    req.flash("error", "Failed to load your bookings");
    res.redirect("/listings");
  }
});


router.post("/:listingId", isLoggedIn, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.listingId);
    const { checkIn, checkOut, guests } = req.body;

    if (!listing) return res.status(404).send("Listing not found");

    const days = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
    const totalPrice = listing.price * days;

    const booking = new Booking({
      listing: listing._id,
      user: req.user._id,
      checkIn,
      checkOut,
      guests,
      totalPrice,
    });

    await booking.save();
    req.flash("success", "Booking successful!");
    res.redirect("/bookings/my");
  } catch (err) {
    console.error(err);
    res.status(500).send("Booking failed");
  }
});
router.get("/requests", isLoggedIn, async (req, res) => {
  try {
    const listings = await Listing.find({ owner: req.user._id });
    const listingIds = listings.map(l => l._id);
    const bookings = await Booking.find({ listing: { $in: listingIds } })
                                  .populate("listing user");
    res.render("bookings/requests", { bookings });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching booking requests");
  }
});
// Approve booking
router.post("/:id/approve", isLoggedIn, async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate("listing");
  if (!booking) return res.status(404).send("Booking not found");

  // only the listing owner can approve
  if (booking.listing.owner.toString() !== req.user._id.toString()) {
    return res.status(403).send("Not authorized");
  }

  booking.status = "confirmed";
  await booking.save();
  res.redirect("/bookings/requests");
});

// Reject booking
router.post("/:id/reject", isLoggedIn, async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate("listing");
  if (!booking) return res.status(404).send("Booking not found");

  if (booking.listing.owner.toString() !== req.user._id.toString()) {
    return res.status(403).send("Not authorized");
  }

  booking.status = "rejected";
  await booking.save();
  res.redirect("/bookings/requests");
});


module.exports = router; // ✅ CommonJS export
