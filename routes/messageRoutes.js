const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// GET request to render message.ejs
router.get('/message', messageController.renderMessagePage);

// POST request to handle chatbot messages
router.post('/message', messageController.chatWithGemini);

module.exports = router;
