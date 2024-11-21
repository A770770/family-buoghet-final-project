// routes/expenseRoutes.js
const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const auth = require('../middleware/auth');

// הוספת הוצאה חדשה
router.post('/', auth, expenseController.addExpense);

// קבלת כל ההוצאות של משתמש
router.get('/', auth, expenseController.getExpenses);

// עדכון הוצאה
router.put('/:id', auth, expenseController.updateExpense);

// מחיקת הוצאה
router.delete('/:id', auth, expenseController.deleteExpense);

// קבלת סיכום הוצאות לפי קטגוריות
router.get('/summary', auth, expenseController.getExpenseSummary);

module.exports = router;