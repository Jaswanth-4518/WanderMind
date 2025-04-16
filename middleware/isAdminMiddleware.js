function isAdmin(req, res, next) {
    console.log('Checking if user is admin:', req.session.user); // Debug session

    if (req.session.user && req.session.user.role === 'admin') {
        return next(); // Proceed if user is an admin
    }
    console.log('Access denied, user is not admin');
    return res.status(403).send('Access denied. You are not an admin.'); // Deny access if not admin
}

module.exports = isAdmin;
