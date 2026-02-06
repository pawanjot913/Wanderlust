const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingschema } = require("../schema.js");
const Joi = require("joi");
const { isLoggedIn, isOwner } = require("../middleware.js");
const listingController = require("../controller/listing.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js")
const upload = multer({ storage });


//index route
router.route("/")
    .get(wrapAsync(listingController.index))


//new route
router.get("/new", listingController.new)
const validatelisting = (req, res, next) => {
    let { error } = listingschema.validate(req.body);
    if (error) {
        let errmsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errmsg);
    } else {
        next();
    }
};
//create route
router.route("/")
    .post(isLoggedIn,upload.single("image"),validatelisting,wrapAsync(listingController.create));
   
//edit route

router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.edit))

//update route

router.put("/:id", isLoggedIn, isOwner, upload.single("image"),validatelisting, wrapAsync(listingController.update))

//delete route
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.delate))


//show route
router.get("/:id",wrapAsync(listingController.show))





module.exports = router;