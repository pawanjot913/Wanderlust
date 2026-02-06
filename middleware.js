// Check if user is logged in
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    const url = req.originalUrl;

    // Don't save redirect for login/signup/booking POSTs
    if (
      !url.startsWith("/login") &&
      !url.startsWith("/signup") &&
      !url.startsWith("/bookings")
    ) {
      req.session.redirectUrl = url;
    }

    req.flash("error", "You must be logged in");
    return res.redirect("/login");
  }
  next();
};

// Save redirect URL for later
module.exports.saveredirectUrl = (req, res, next) => {
  if (
    !req.session.redirectUrl &&
    !req.originalUrl.startsWith("/login") &&
    !req.originalUrl.startsWith("/signup") &&
    !req.originalUrl.startsWith("/bookings")
  ) {
    req.session.redirectUrl = req.originalUrl;
  }
  next();
};

// Check listing ownership
module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  const listing = await require("./models/listing")(id); // adjust require
  if (!listing.owner.equals(res.locals.CurrUser._id)) {
    req.flash("error", "You are not the owner");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

// Check review author
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewid } = req.params;
  const rev = await require("./models/review").findById(reviewid);
  if (!rev.author.equals(res.locals.CurrUser._id)) {
    req.flash("error", "You are not the author");
    return res.redirect(`/listings/${id}`);
  }
  next();
};
    