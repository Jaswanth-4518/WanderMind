  const fetch = require("node-fetch");
  require("dotenv").config();
  const { GoogleGenerativeAI } = require("@google/generative-ai");

  const apiKey = process.env.geminikey;

  if (!apiKey) {
    console.error("🚨 Missing Gemini API key. Check your .env file.");
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
  };

  /** Fetches latitude & longitude using OpenStreetMap */
  const getCoordinates = async (location) => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.length === 0) throw new Error("Location not found.");

      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    } catch (error) {
      console.error("❌ Error fetching coordinates:", error);
      return null;
    }
  };

  /** Calculates real distance between two locations */
  const getDistance = async (presentLocation, tourLocation) => {
    try {
      const start = await getCoordinates(presentLocation);
      const end = await getCoordinates(tourLocation);

      if (!start || !end) throw new Error("Invalid location data.");

      const R = 6371; // Radius of Earth in km
      const dLat = (end.lat - start.lat) * (Math.PI / 180);
      const dLon = (end.lon - start.lon) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(start.lat * (Math.PI / 180)) *
          Math.cos(end.lat * (Math.PI / 180)) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c; // Distance in km

      return distance.toFixed(2);
    } catch (error) {
      console.error("❌ Error calculating distance:", error);
      return 0;
    }
  };

  /** Extracts valid JSON from AI response */
  const extractJSON = (text) => {
    try {
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) return null;

      let extractedJSON = match[0];

      // Ensure property names are properly quoted
      extractedJSON = extractedJSON.replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":');

      // Ensure double quotes are used for string values
      extractedJSON = extractedJSON.replace(/:\s*'([^']*)'/g, ': "$1"');

      // Fix trailing commas (remove ", }" or ", ]")
      extractedJSON = extractedJSON.replace(/,(\s*[}\]])/g, '$1');

      return extractedJSON;
    } catch (error) {
      console.error("⚠️ JSON Extraction Error:", error);
      return null;
    }
  };


  /** Handles the chat request */
  const chatController = async (req, res) => {
    try {
      const { presentLocation, tourLocation, budget, days, transport, category } = req.body;

      if (!presentLocation || !tourLocation || !budget || !days || !transport || !category) {
        return res.render("index", {
          response: "❌ Please fill in all fields.",
          user: req.session.user || null,
        });
      }

      if (isNaN(budget) || isNaN(days) || budget <= 0 || days <= 0) {
        return res.render("index", {
          response: "⚠️ Please enter valid numbers for budget and days.",
          user: req.session.user || null,
        });
      }

      // Fetch real travel distance
      const distanceInKm = await getDistance(presentLocation, tourLocation);
      let estimatedTravelCost = 0;
      let estimatedTimeInHours = 0;
  if (transport.toLowerCase() === "car") {
    const averageSpeed = 50; // avg km/h considering mixed traffic
    estimatedTimeInHours = (distanceInKm / averageSpeed).toFixed(1);
  }

      // Estimate cost based on transport mode
      if (transport.toLowerCase() === "car") estimatedTravelCost = distanceInKm * 10; // ₹10 per km
      if (transport.toLowerCase() === "bus") estimatedTravelCost = distanceInKm * 2; // ₹2 per km
      if (transport.toLowerCase() === "train") estimatedTravelCost = distanceInKm * 1.5; // ₹1.5 per km
      if (transport.toLowerCase() === "flight") estimatedTravelCost = distanceInKm * 5; // ₹5 per km

      // Create query for Gemini AI
      const query = `I am planning a ${days}-day budget trip to ${tourLocation} from ${presentLocation} with a budget of ${budget} rupees. I will be using ${transport} transport.
      The trip should focus on the category "${category}". Please include places and activities that match this category.
      Please return the response **STRICTLY** in valid JSON format without any extra text:
      
      {
        "tripOverview": {
          "presentLocation": "${presentLocation}",
          "destination": "${tourLocation}",
          "category": "${category}",
          "totalDays": ${days},
          "budget": ${budget},
          "transportMode": "${transport}",
          "travelDistance": {
            "distanceInKm": ${distanceInKm},
            "estimatedTravelCost": ${estimatedTravelCost.toFixed(2)}
          }
        },
        "transportSuggestions": ${
          transport === "public" ? `{
            "publicOptions": [
              { "type": "train", "name": "Train Name"},
              { "type": "bus", "name": "Bus Name"},
              { "type": "flight", "airline": "Airline Name"}
            ],
            "tip": "Consider renting a car or using private cabs for last-mile connectivity or remote areas."
          }` : `{
            "drivingDistance": {
              "distanceInKm": ${distanceInKm},
              "estimatedTimeInHours": ${estimatedTimeInHours},
              "estimatedFuelCost": ${(distanceInKm / 15 * 100).toFixed(2)}
            },
            "stopovers": [
              { "name": "Stopover Place 1", "whyToStop": "Good food and rest area" },
              { "name": "Stopover Place 2", "whyToStop": "Scenic view and fuel station" }
            ],
            "tip": "Ensure your vehicle is serviced and carry offline maps for areas with low connectivity."
          }`
        },
        "itinerary": [
          ${Array.from({ length: days }, (_, i) => `{
            "day": ${i + 1},
            "placesToVisit": [
              {
                "name": "string",
                "lat": 0.0,
                "lng": 0.0,
                "distanceFromTourLocation": 0.0,
                "imageURL": "string", 
                "category": "string",
                "expenses": { "entryFee": 0, "food": 0, "transport": 0 },
                "longDescription": "string"
              }
            ],

            "foodAndAccommodation": {
              "restaurants": [{ "name": "string", "averageMealCost": 0 }],
              "hotels": [{ "name": "string", "averageRoomPrice": 0 }]
            },
            "activities": [{ "name": "string", "cost": 0 }],
            "transportationDetails": {
              "localTransportOptions": [ "string" ],
              "estimatedFares": { "bus": 0, "train": 0, "taxi": 0 }
            },
            "dailyBudgetBreakdown": {
              "transport": 0,
              "accommodation": 0,
              "food": 0,
              "entryFees": 0,
              "miscellaneous": 0
            },
            "travelTips": {
              "weather": "string",
              "safetyTips": [ "string" ],
              "bestVisitingHours": "string"
            }
          }`).join(",")}
        ],
        "overallBudgetBreakdown": {
          "transport": 0,
          "accommodation": 0,
          "food": 0,
          "entryFees": 0,
          "buffer": 0
        }
      }`;

      console.log("🔍 Query to Gemini AI:", query);

      const chatSession = model.startChat({ generationConfig });
      const result = await chatSession.sendMessage(query);

      let responseText = await result.response.text();
      console.log("✅ AI Response (Raw):", responseText);

      responseText = extractJSON(responseText);

      if (!responseText) {
        console.error("🚨 AI returned invalid JSON:", responseText);
        return res.render("index", {
          response: "⚠️ AI response is incorrect. Try again.",
          user: req.session.user || null,
        });
      }

      try {
        const jsonResponse = JSON.parse(responseText);

        // **Sort places based on distance**
        jsonResponse.itinerary.forEach((day) => {
          if (day.placesToVisit && Array.isArray(day.placesToVisit)) {
            day.placesToVisit.sort((a, b) => a.distanceFromTourLocation - b.distanceFromTourLocation);
          }
        });

        res.render("response", {
          json: jsonResponse,
          user: req.session.user || null,
        });
      } catch (jsonError) {
        console.error("⚠️ JSON Parse Error:", jsonError);
        res.render("index", {
          response: "🚨 AI response format is incorrect. Please try again later.",
          user: req.session.user || null,
        });
      }
    } catch (error) {
      console.error("❌ Error in chatController:", error);
      res.render("index", { response: "🚨 Error processing your request.", user: req.session.user || null });
    }
  };

  module.exports = { chatController };
