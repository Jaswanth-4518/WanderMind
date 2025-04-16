const db = require('../config/db.js'); // Adjust path to your database connection file

const userModel = {
    findUserByEmail: async (email) => {
        try {
            const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error checking existing user:', error);
            return null;
        }
    },
    

    registerUser: async (username, phone, email, password, gender, location) => {
        try {
            return await db.query('INSERT INTO users (username, phone, email, password, gender, location) VALUES (?, ?, ?, ?, ?, ?)', 
                [username, phone, email, password, gender, location]);
        } catch (error) {
            throw error;
        }
    }
};

module.exports = userModel;
