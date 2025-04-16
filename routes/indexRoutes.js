const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middleware/authMiddleware');
const { chatController } = require('../controllers/chatController');


router.get('/', (req, res) => {
    res.redirect('/about'); // Redirect to about page when server starts
});
router.get('/about', (req, res) => {
    res.render('about', {
        user: req.session.user || null,
    });
});
// Root route: Redirect based on authentication status
router.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/index'); // Redirect to index if authenticated
    } else {
        res.redirect('/login'); // Redirect to login if not authenticated
    }
});

// Render the index page
router.get('/index', isAuthenticated, (req, res) => {
    res.render('index', {
        response: '',
        user: req.session.user || null,
    });
});

// Handle POST requests to the index page
router.post('/index', isAuthenticated, chatController);

// Render other authenticated pages
router.get('/map', isAuthenticated, (req, res) => {
    res.render('map', {
        response: '',
        user: req.session.user || null,
    });
});

router.get('/images', isAuthenticated, (req, res) => {
    res.render('images', {
        response: '',
        user: req.session.user || null,
    });
});

router.get('/response', isAuthenticated, (req, res) => {
    const data = `{
        "placesToVisit": [
            {
                "name": "Kanaka Durga Temple",
                "lat": 16.5077,
                "lng": 80.6477,
                "expenses": { "entryFee": 20, "food": 200, "transport": 50 },
                "longDescription": "Located atop Indrakila Hill, Kanaka Durga Temple offers stunning views of the Krishna River and is a significant Hindu pilgrimage site."
            },
            {
                "name": "Undavalli Caves",
                "lat": 16.5481,
                "lng": 80.6135,
                "expenses": { "entryFee": 15, "food": 150, "transport": 100 },
                "longDescription": "These ancient rock-cut caves feature intricate carvings, including a large monolithic statue of Lord Vishnu in a reclining posture."
            },
            {
                "name": "Victoria Jubilee Museum",
                "lat": 16.5056,
                "lng": 80.6420,
                "expenses": { "entryFee": 20, "food": 100, "transport": 50 },
                "longDescription": "This museum houses a rich collection of sculptures, paintings, and artifacts showcasing Andhra Pradesh’s history and culture."
            }
        ],
        "overallBudgetBreakdown": {
            "transport": { "busToVijayawada": 500, "busBackToHyderabad": 500, "localTransport": 300 },
            "accommodation": 1200,
            "food": 900,
            "entryFees": 65,
            "buffer": 535
        }
    }`;
    const json = JSON.parse(data);
    res.render('response', {
        response: '',
        json: json,
        user: req.session.user || null,
    });
});

// Export the router
module.exports = router;
