const express = require('express');
const router = express.Router();
const authController = require("../controllers/authController");
const profileController = require('../controllers/profileController');
const editProfileController = require('../controllers/editProfileController');

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login');
};

// Serve login page
router.get('/login', (req, res) => {
    const error = req.session.error;  // Retrieve error message
    req.session.error = null;  // Clear error after displaying
    res.render('login', { error }); // Pass error to EJS
});


// Handle login
router.post('/login', authController.login);

// Serve register page
router.get('/register', (req, res) => res.render('register'));

// Handle registration
router.post('/register', authController.register);

// Logout user
router.post('/logout', authController.logout);

// Profile route (requires authentication)
router.get('/profile', isAuthenticated, profileController.getProfile);

// Edit profile page route
router.get('/edit-profile', isAuthenticated, (req, res) => {
    res.render('edit-profile', { user: req.session.user });
});

// Handle edit profile form submission
router.post('/edit-profile', isAuthenticated, editProfileController.updateProfile);

// OTP Routes
router.post("/send-otp", authController.sendOTP);
router.post("/verify-otp", authController.verifyOTP);

// Forgot Password Routes
router.get('/forgot-password', (req, res) => res.render('forgot-password')); // Serve forgot password page
router.post('/forgot-password', authController.sendOTP); // Handle sending OTP

// Reset Password Routes
router.get('/reset-password', (req, res) => res.render('reset-password')); // Serve reset password page
router.post('/reset-password', authController.resetPassword); // Handle password reset

module.exports = router;
