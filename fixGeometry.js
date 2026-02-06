require("dotenv").config();
const mongoose = require("mongoose");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const Listing = require("./models/listing");

mongoose.connect("mongodb://127.0.0.1:27017/wanderlust")
.then(()=> console.log("DB Connected"));

const geocodingClient = mbxGeocoding({
    accessToken: process.env.MAP_TOKEN
});

async function fixListings() {

    const listings = await Listing.find({
        geometry: { $exists: false }
    });

    console.log("Fixing:", listings.length);

    for(let listing of listings){

        const response = await geocodingClient.forwardGeocode({
            query: listing.location,
            limit: 1
        }).send();

        listing.geometry = response.body.features[0].geometry;

        await listing.save();

        console.log("Fixed:", listing.title);
    }

    mongoose.connection.close();
}

fixListings();
