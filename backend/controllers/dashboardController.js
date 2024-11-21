const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const Request = require('../models/Request');
const User = require('../models/User');
const Dashboard = require('../models/Dashboard');

// פונקציית עזר לחישוב סטטיסטיקות חודשיות
const calculateMonthlyStats = async (userId, startDate, endDate) => {
    const expenses = await Expense.find({
        userId,
        date: { $gte: startDate, $lte: endDate }
    });

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    // חישוב הוצאות לפי קטגוריה
    const expensesByCategory = expenses.reduce((acc, exp) => {
        if (!acc[exp.category]) {
            acc[exp.category] = 0;
        }
        acc[exp.category] += exp.amount;
        return acc;
    }, {});

    // חישוב הוצאות יומיות
    const dailyExpenses = expenses.reduce((acc, exp) => {
        const date = exp.date.toISOString().split('T')[0];
        if (!acc[date]) {
            acc[date] = 0;
        }
        acc[date] += exp.amount;
        return acc;
    }, {});

    return {
        totalExpenses,
        totalIncome: 0, // יש להוסיף לוגיקה של הכנסות
        expensesByCategory: Object.entries(expensesByCategory).map(([category, amount]) => ({
            category,
            amount
        })),
        dailyExpenses: Object.entries(dailyExpenses).map(([date, amount]) => ({
            date,
            amount
        }))
    };
};

// פונקציית עזר לבדיקת התראות
const checkAlerts = async (budget, expenses) => {
    const alerts = [];
    if (!budget) {
        alerts.push({
            message: 'לא הוגדר תקציב חודשי',
            type: 'warning'
        });
        return alerts;
    }

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const budgetLimit = budget.amount;
    
    if (totalExpenses >= budgetLimit * 0.9) {
        alerts.push({
            message: 'הגעת ל-90% מהתקציב החודשי',
            type: 'warning'
        });
    }

    if (totalExpenses >= budgetLimit) {
        alerts.push({
            message: 'חרגת מהתקציב החודשי!',
            type: 'error'
        });
    }

    return alerts;
};

// פונקציית עזר לקבלת הוצאות אחרונות
const getRecentExpenses = async (userId) => {
    return await Expense.find({ userId })
        .sort({ date: -1 })
        .limit(5)
        .select('title amount category date');
};

// פונקציית עזר לקבלת הוצאות קרובות
const getUpcomingExpenses = async (userId) => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return await Expense.find({
        userId,
        dueDate: { $gte: today, $lte: nextWeek }
    })
    .sort({ dueDate: 1 })
    .limit(5)
    .select('title amount dueDate');
};

// נוסיף פונקציית עזר פנימית
const refreshDashboardInternal = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('משתמש לא נמצא');
    }

    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const budget = await Budget.findOne({ userId });
    const expenses = await Expense.find({
        userId,
        date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
    });

    const pendingRequests = user.role === 'parent' 
        ? await Request.find({ parentId: userId, status: 'pending' })
            .populate('childId', 'username')
            .select('amount description category requestDate')
        : await Request.find({ childId: userId, status: 'pending' })
            .select('amount description category requestDate status');

    const alerts = await checkAlerts(budget, expenses);
    
    if (pendingRequests.length > 0) {
        alerts.push({
            message: `יש ${pendingRequests.length} בקשות ממתינות`,
            type: 'info'
        });
    }

    const dashboardData = {
        userId,
        totalBudget: budget?.amount || 0,
        recentExpenses: await getRecentExpenses(userId),
        upcomingExpenses: await getUpcomingExpenses(userId),
        pendingRequests: {
            count: pendingRequests.length,
            items: pendingRequests
        },
        alerts,
        monthlyStats: await calculateMonthlyStats(userId, firstDayOfMonth, lastDayOfMonth)
    };

    await Dashboard.findOneAndUpdate(
        { userId }, 
        dashboardData,
        { upsert: true, new: true }
    );

    return dashboardData;
};

// קבלת נתוני דשבורד
exports.getDashboardData = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'משתמש לא נמצא' });
        }

        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const budget = await Budget.findOne({ userId });
        const expenses = await Expense.find({
            userId,
            date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
        });

        const monthlyStats = await calculateMonthlyStats(userId, firstDayOfMonth, lastDayOfMonth);
        const alerts = await checkAlerts(budget, expenses);

        if (user.role === 'parent') {
            const pendingRequests = await Request.find({ 
                parentId: userId,
                status: 'pending'
            });
            
            if (pendingRequests.length > 0) {
                alerts.push({
                    message: `יש ${pendingRequests.length} בקשות ממתינות לאישור`,
                    type: 'info'
                });
            }
        }

        const dashboardData = {
            userId,
            totalBudget: budget?.amount || 0,
            recentExpenses: await getRecentExpenses(userId),
            upcomingExpenses: await getUpcomingExpenses(userId),
            alerts,
            monthlyStats
        };

        await Dashboard.findOneAndUpdate({ userId }, dashboardData, { upsert: true, new: true });
        res.json(dashboardData);

    } catch (error) {
        console.error('שגיאה בקבלת נתוני דשבורד:', error);
        res.status(500).json({ message: 'שגיאה בשרת' });
    }
};

// קבלת סטטיסטיקות חודשיות
exports.getMonthlyStats = async (req, res) => {
    try {
        const userId = req.params.userId;
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const stats = await calculateMonthlyStats(userId, firstDayOfMonth, lastDayOfMonth);
        res.json(stats);
    } catch (error) {
        console.error('שגיאה בקבלת סטטיסטיקות:', error);
        res.status(500).json({ message: 'שגיאה בשרת' });
    }
};

// קבלת התראות
exports.getAlerts = async (req, res) => {
    try {
        const userId = req.params.userId;
        const budget = await Budget.findOne({ userId });
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const expenses = await Expense.find({
            userId,
            date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
        });

        const alerts = await checkAlerts(budget, expenses);
        res.json(alerts);
    } catch (error) {
        console.error('שגיאה בקבלת התראות:', error);
        res.status(500).json({ message: 'שגיאה בשרת' });
    }
};

// עדכון העדפות דשבורד
exports.updateDashboardPreferences = async (req, res) => {
    try {
        const userId = req.params.userId;
        const preferences = req.body;

        const dashboard = await Dashboard.findOneAndUpdate(
            { userId },
            { $set: { preferences } },
            { new: true, upsert: true }
        );

        res.json({
            message: 'העדפות הדשבורד עודכנו בהצלחה',
            dashboard
        });
    } catch (error) {
        console.error('שגיאה בעדכון העדפות:', error);
        res.status(500).json({ message: 'שגיאה בשרת' });
    }
};

// נעדכן את הפונקציה המקורית
exports.refreshDashboard = async (req, res) => {
    try {
        const userId = req.params.userId;
        const dashboardData = await refreshDashboardInternal(userId);
        res.json(dashboardData);
    } catch (error) {
        console.error('שגיאה ברענון הדשבורד:', error);
        res.status(500).json({ message: 'שגיאה בשרת' });
    }
};

// נייצא את הפונקציה הפנימית לשימוש בקונטרולרים אחרים
exports.refreshDashboardInternal = refreshDashboardInternal;

module.exports = {
    getDashboardData: exports.getDashboardData,
    getMonthlyStats: exports.getMonthlyStats,
    getAlerts: exports.getAlerts,
    updateDashboardPreferences: exports.updateDashboardPreferences,
    refreshDashboard: exports.refreshDashboard,
    refreshDashboardInternal: exports.refreshDashboardInternal
};