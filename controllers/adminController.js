const pool = require('../config/db');

exports.getAllUsers = async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [users] = await connection.execute('SELECT id, username, email, location, phone, gender, role FROM users');
        connection.release();

        res.render('admin/users', { users, user: req.session.user });

    } catch (error) {
        console.error('❌ Error fetching users:', error);
        res.status(500).send('Internal server error');
    }
};
