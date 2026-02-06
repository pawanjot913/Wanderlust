const Listing = require("../models/listing.js");
const review = require("../models/review.js");
const user = require("../models/user.js");


module.exports.createReview =async(req,res)=>{
    const { id } = req.params;
    let listing = await Listing.findById(id);
    let newReview =  new review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);

    await newReview.save(); 
    await listing.save();
    req.flash("success", "Review Added Succesfully!");
    res.redirect(`/listings/${id}`);
}

module.exports.deleteReview = async(req,res)=>{
    let {id,reviewId} = req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted Succesfully!");
    res.redirect(`/listings/${id}`);
}
