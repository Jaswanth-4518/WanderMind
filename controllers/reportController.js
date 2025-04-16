// controllers/reportController.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI("AIzaSyDldw9xQfXAInjU9pQ3jFG164y5gewvap4");

exports.getReportPage = (req, res) => {
  res.render("report", { report: null, error: null });
};

exports.postReport = async (req, res) => {
  const { from, to } = req.body;

  const prompt = `
    I want to travel from ${from} to ${to}. 
    Consider current weather, traffic, safety, and travel advisories.
    Based on general patterns or live conditions (assume today's date), tell me if it is a good time to travel or not.
    Also provide a 2–3 line reasoned explanation.
  `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const report = response.text();

    res.render("report", { report, error: null });
  } catch (err) {
    console.error("Gemini API Error:", err);
    res.render("report", { report: null, error: "Could not generate the report. Try again later." });
  }
};
