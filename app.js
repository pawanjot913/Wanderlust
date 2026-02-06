if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}



const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingschema,reviewSchema}= require("./schema.js");
const Review = require("./models/review.js"); 
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const listings = require("./router/listing.js");
const review = require("./router/review.js");
const user = require("./models/user.js");
const userRoutes = require("./router/user.js");
const bookingRoutes = require("./router/Booking"); // ✅ CommonJS require
const itineraryRoutes = require("./router/itinerary.js");
app.locals.mapToken = process.env.MAP_TOKEN;


const Mongo_Url = process.env.MONGODB_URL ;

main().then(()=>{
    console.log("connected to DB");
}).catch(err=>{
    console.log(err);
})

async function main(){
    await mongoose.connect(Mongo_Url);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method")); 
app.engine("ejs", ejsMate);



app.use(express.static(path.join(__dirname,"/public")));

const store = MongoStore.create({ mongoUrl: Mongo_Url
    ,
    crypto: {
    secret: process.env.secret,   
}, touchAfter: 24 * 3600,
});

store.on("error", (err)=>  {
    console.log("Session Store Error", err);
});
const sessionOptions ={
    store: store,
    secret: process.env.secret ,
    resave: false,
    saveUninitialized : true,
   cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
}


};

app.get("/",(req,res)=>{
    res.send("hi, i am root");
});
app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());



app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.CurrUser = req.user;
    next();
});

app.use ("/listings",listings);
app.use("/listings/:id/reviews",review);
app.use("/", userRoutes);
app.use("/bookings", bookingRoutes);
app.use("/itinerary", itineraryRoutes);





 app.all("/*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
 })
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went Wrong!" } = err;
    res.status(statusCode).render("listings/error.ejs", { statusCode, message });
});






app.listen(8080,()=>{
    console.log("server is listening to port 8080");
});