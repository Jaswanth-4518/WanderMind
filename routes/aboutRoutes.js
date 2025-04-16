const express = require("express");
const router = express.Router();
const aboutController = require("../controllers/aboutController");

// Serve the About Us page
router.get("/about", aboutController.getAboutPage);

module.exports = router;
