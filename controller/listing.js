const Listing = require("../models/listing.js");
const review = require("../models/review.js");
const user = require("../models/user.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
    const alllistings = await Listing.find({});
    //    const hi = await Listing.find({});
    //    console.log(hi);
    res.render("listings/index.ejs", { alllistings });
}

module.exports.new = (req, res) => {
    res.render("listings/new.ejs");
}

module.exports.create = async (req, res) => {

    const geoData = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
    })
        .send()
        

    // If no listing in req.body (form naming issue)
    if (!req.body.listing) {
        req.flash("error", "Invalid form data!");
        return res.redirect("/listings/new");
    }

    const listing = new Listing(req.body.listing);

    // attach owner (must be logged in)
    listing.owner = req.user._id;

    // if an image was uploaded by Multer
    if (req.file) {
        listing.image = { url: req.file.path, filename: req.file.filename };
    }
    listing.geometry = geoData.body.features[0].geometry;

    await listing.save();
    req.flash("success", "New Listing Created!");
    res.redirect(`/listings/${listing._id}`);
};



module.exports.edit = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Cannot edit a listing that does not exist!");
        return res.redirect("/listings");
    }
    let originalImage = listing.image.url;
    originalImage = originalImage.replace("/upload", "/upload/w_250/h_250,c_fill,g_auto/");
    req.flash("success", "Listing Edited Succesfully!");
    res.render("listings/edit.ejs", { listing, originalImage });
}


module.exports.update = async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }

    req.flash("success", "Listing Updated Succesfully!");
    res.redirect(`/listings/${id}`);
}

module.exports.delate = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findByIdAndDelete(id);

    if (!listing) {
        req.flash("error", "Cannot delete. Listing not found!");
        return res.redirect("/listings");
    }
    req.flash("success", "Listing Deleted Succesfully!");
    res.redirect("/listings");

}

module.exports.show = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({
        path: "reviews",
        populate: { path: "author" }
    });
    if (!listing) {
        req.flash("error", "Listing you are requested does not exist!")
        return res.redirect("/listings");
    }

    res.render("listings/show", { listing });

}