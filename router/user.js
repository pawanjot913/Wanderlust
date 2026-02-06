const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const passport = require("passport");
const { saveredirectUrl } = require("../middleware.js");
const userController = require("../controller/user.js");
// signup form
router.route("/signup")
    .get(userController.getsignup)
    .post(userController.postsignup);

router.route("/login")
    .get((req, res) => {
        res.render("user/login.ejs");
    })
    .post(saveredirectUrl, passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true,
    }), userController.login);


router.get("/logout", (req, res, next) => {
    req.logOut((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "logged you out!");
        res.redirect("/listings");
    })
});


module.exports = router;
