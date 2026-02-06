const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware");
const OpenAI = require("openai");

// Create OpenAI client (CommonJS)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// GET form page
router.get("/", isLoggedIn, (req, res) => {
  res.render("itinerary/index"); // form page
});

// POST form to generate itinerary
router.post("/", isLoggedIn, async (req, res) => {
  const { prompt } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // <-- Free-tier compatible
      messages: [
        { role: "system", content: "You are a helpful travel planner." },
        { role: "user", content: prompt }
      ]
    });

    const itinerary = completion.choices[0].message.content;
    res.render("itinerary/result", { itinerary });
  } catch (err) {
    console.error("Failed to generate itinerary:", err);
     // Check if quota exceeded
    if (err.code === "insufficient_quota" || err.status === 429) {
      req.flash("error", "Free quota exceeded. Please try again later or reduce usage.");
    } else {
      req.flash("error", "Failed to generate itinerary. Please try again.");
    }

    res.redirect("/itinerary");
    
  }
});

module.exports = router;
