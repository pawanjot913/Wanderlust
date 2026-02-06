require("dotenv").config();
const OpenAI = require("openai");

// ✅ Create OpenAI client directly
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function test() {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Use GPT-3.5
      messages: [
        { role: "system", content: "You are a helpful travel planner." },
        { role: "user", content: "Plan a 3-day trip to Paris" }
      ]
    });

    console.log("Generated itinerary:\n");
    console.log(completion.choices[0].message.content);
  } catch (err) {
    console.error("Failed to generate itinerary:", err);
  }
}

test();
