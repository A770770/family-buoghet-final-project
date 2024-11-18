// backend/routes/dashboard.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

// הוסף את middleware האימות לכל הנתיבים
router.use(auth);

// נתיב לקבלת נתוני דשבורד
router.get('/getDashboardData/:userId', dashboardController.getDashboardData);

module.exports = router;