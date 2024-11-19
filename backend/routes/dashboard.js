const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Dashboard = require('../models/Dashboard');
const auth = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');
const { validateUserId } = require('../middleware/validation');

// נתיב מרכזי לקבלת נתוני דשבורד
router.get('/getDashboardData/:userId', 
    auth, 
    validateUserId,
    dashboardController.getDashboardData
);

// נתיב לרענון נתוני דשבורד
router.get('/refreshDashboard/:userId',
    auth,
    validateUserId,
    dashboardController.getDashboardData
);

// מוודאים שהפונקציה קיימת לפני שמשתמשים בה
if (dashboardController.updateMonthlyIncome) {
    router.post('/updateIncome/:userId',
        auth,
        validateUserId,
        dashboardController.updateMonthlyIncome
    );
}

module.exports = router;