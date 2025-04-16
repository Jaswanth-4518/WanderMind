const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

exports.renderMessagePage = (req, res) => {
    res.render('message', { botResponse: null }); // Render page with no response initially
};

exports.chatWithGemini = async (req, res) => {
    try {
        const userMessage = req.body.message;
        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: "Hello" }] },
                { role: "model", parts: [{ text: "Great to meet you. What would you like to know?" }] },
            ],
        });

        let result = await chat.sendMessage(userMessage);
        let botResponse = result.response.text();

        res.render('message', { botResponse });
    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).send("Error processing request.");
    }
};
