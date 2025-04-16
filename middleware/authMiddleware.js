module.exports = (req, res, next) => {
    if (req.session.user) {
        return next(); // Proceed if user is authenticated
    } else {
        console.log('User not authenticated, redirecting to login');
        res.redirect('/login'); // Redirect to login if not authenticated
    }
};
