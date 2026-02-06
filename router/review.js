const express = require("express");
const router = express.Router({mergeParams: true});
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {reviewSchema}= require("../schema.js");
const Review = require("../models/review.js"); 
const Joi = require("joi");
const { isLoggedIn,isReviewAuthor } = require("../middleware.js");
const reviewcontroller = require("../controller/review.js")

const validateReview = (req,res,next) =>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errmsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errmsg);
    }else{
        next();
    }

}

router.post("/",isLoggedIn,validateReview,wrapAsync(reviewcontroller.createReview))

//delete review

router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(reviewcontroller.deleteReview));







module.exports = router;