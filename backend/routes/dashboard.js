const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

// קבלת נתוני דשבורד
router.get('/getDashboardData/:userId', auth, dashboardController.getDashboardData);

// קבלת סטטיסטיקות חודשיות
router.get('/monthly-stats/:userId', auth, dashboardController.getMonthlyStats);

// קבלת התראות
router.get('/alerts/:userId', auth, dashboardController.getAlerts);

// עדכון העדפות דשבורד
router.put('/preferences/:userId', auth, dashboardController.updateDashboardPreferences);

// רענון דשבורד
router.get('/refresh/:userId', auth, dashboardController.refreshDashboard);

module.exports = router;
