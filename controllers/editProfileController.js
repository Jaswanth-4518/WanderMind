const pool = require('../config/db');

// Handle Profile Update
exports.updateProfile = async (req, res) => {
    try {
        const { username, phone, location, gender } = req.body;
        const email = req.session.user?.email;

        if (!email) {
            return res.status(401).send("Unauthorized");
        }

        const connection = await pool.getConnection();
        await connection.execute(
            "UPDATE users SET username = ?, phone = ?, location = ?, gender = ? WHERE email = ?",
            [username, phone, location, gender, email]
        );
        connection.release();

        // Update session data
        req.session.user = { ...req.session.user, username, phone, location, gender };

        res.redirect('/profile');

    } catch (error) {
        console.error("❌ Error updating profile:", error);
        res.status(500).send("An error occurred while updating profile.");
    }
};
