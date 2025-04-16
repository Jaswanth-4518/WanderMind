const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController'); // Assuming this controller handles the fetching and rendering of users
const authMiddleware = require('../middleware/authMiddleware');
const isAdminMiddleware = require('../middleware/isAdminMiddleware');

// Admin routes
router.get('/users', authMiddleware, isAdminMiddleware, adminController.getAllUsers); // Ensure this route is correct

module.exports = router;
