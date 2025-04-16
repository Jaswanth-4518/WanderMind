const pool = require('../config/db');

exports.getProfile = async (req, res) => {
    try {
        const userEmail = req.session.user?.email;
        if (!userEmail) {
            return res.render('profile', { error: 'User not logged in', user: null });
        }

        const connection = await pool.getConnection();
        const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [userEmail]);
        connection.release();

        if (rows.length === 0) {
            return res.render('profile', { error: 'User not found', user: null });
        }

        res.render('profile', { user: rows[0] });

    } catch (error) {
        console.error('❌ Error retrieving user data:', error);
        res.render('profile', { error: 'Error fetching user data', user: null });
    }
};

