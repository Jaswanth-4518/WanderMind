const express = require("express");
const router = express.Router();

// Route to render report.ejs
router.get("/report", (req, res) => {
  res.render("report");
});

module.exports = router;