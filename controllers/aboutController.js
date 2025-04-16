const pool = require('../config/db');

const getAboutPage = async (req, res) => {
    try {
        console.log("Session Data:", req.session); 

        const userId = req.session.userId;
        let user = null;

        if (userId) {
            const [rows] = await pool.execute('SELECT username FROM users WHERE id = ?', [userId]);
            console.log("Database Query Result:", rows);
            user = rows.length > 0 ? { username: rows[0].username } : null;
            console.log(username); 
        }

        res.render("about", {
            title: "About WanderMind",
            description: "WanderMind is an AI-powered smart travel planner...",
            features: [
                "AI-Powered Itinerary",
                "Smart Budgeting",
                "Real-Time Weather & Alerts",
                "Interactive Maps",
                "Collaboration",
                "AI Travel Chatbot",
            ],
            user: user || { username: "Guest" },  // Default username
        });
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).send("Internal Server Error");
    }
};



module.exports = { getAboutPage };
