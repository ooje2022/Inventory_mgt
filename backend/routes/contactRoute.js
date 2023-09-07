const express = require("express");
const { contactUs } = require("../controllers/contactController");
const router = express.Router();
const { protect } = require("../controllers/authController");

router.post("/", protect, contactUs);

module.exports = router;
