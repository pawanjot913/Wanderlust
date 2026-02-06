const User = require("../models/user.js");

// GET signup page
module.exports.getsignup = (req, res) => {
  res.render("user/signup.ejs");
};

// POST signup
module.exports.postsignup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);

    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to Wanderlust!");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

// LOGIN
module.exports.login = (req, res) => {
  req.flash("success", "Welcome back!");
  const redirectUrl = req.session.redirectUrl || "/listings";
  delete req.session.redirectUrl; // ✅ prevents redirect loops
  res.redirect(redirectUrl);
};


