const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Dashboard = require('../models/Dashboard'); // Ensure the model is imported
const auth = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');
const { validateUserId } = require('../middleware/validation');
const cache = require('../middleware/cache');

// const dashboardSchema = new mongoose.Schema({
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     totalBudget: { type: Number, default: 0 },
//     recentExpenses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Expense' }],
//     upcomingExpenses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Expense' }],
//     alerts: [{ message: String, type: String }],
//     monthlyStats: Object,
// }, { timestamps: true });

// module.exports = mongoose.model('Dashboard', dashboardSchema);

// נתיב מרכזי לקבלת נתוני דשבורד
router.get('/getDashboardData/:userId', 
    auth, 
    validateUserId,
    cache.route(300), // קאש ל-5 דקות
    dashboardController.getDashboardData
);

// נתיב לרענון נתוני דשבורד (ללא קאש)
router.get('/refreshDashboard/:userId',
    auth,
    validateUserId,
    dashboardController.getDashboardData
);

// נתיב לקבלת סטטיסטיקות חודשיות
router.get('/monthlyStats/:userId',
    auth,
    validateUserId,
    cache.route(600), // קאש ל-10 דקות
    dashboardController.getMonthlyStats
);

// נתיב לקבלת התראות בלבד
router.get('/alerts/:userId',
    auth,
    validateUserId,
    dashboardController.getAlerts
);

// נתיב לעדכון העדפות דשבורד
router.patch('/preferences/:userId',
    auth,
    validateUserId,
    dashboardController.updateDashboardPreferences
);

module.exports = router;