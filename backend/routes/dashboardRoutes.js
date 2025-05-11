const express = require('express');
const router = express.Router();
const { getGenderDistribution } = require('../controllers/dashboardController');
const authMiddleware = require("../middleware/authMiddleware");

router.get('/gender-distribution', authMiddleware, getGenderDistribution);

module.exports = router;