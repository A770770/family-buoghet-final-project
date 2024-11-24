const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const { refreshDashboardInternal } = require('./dashboardController');
const Income = require('../models/Income');
const mongoose = require('mongoose');

// הוספת הוצאה חדשה
exports.addExpense = async (req, res) => {
    try {
        const { amount, category, description } = req.body;
        const userId = req.user.id;
        const userObjectId = new mongoose.Types.ObjectId(userId);

        // בישוב היתרה הזמינה
        const totalIncome = await Income.aggregate([
            { $match: { userId: userObjectId } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const totalExpenses = await Expense.aggregate([
            { $match: { userId: userObjectId } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const availableBalance = (totalIncome[0]?.total || 0) - (totalExpenses[0]?.total || 0);

        // בדיקה אם יש מספיק כסף
        if (availableBalance < amount) {
            return res.status(400).json({ 
                error: 'אין מספיק כסף בקופה',
                availableBalance,
                requestedAmount: amount
            });
        }

        // יצירת ההוצאה
        const expense = new Expense({
            userId: userObjectId,
            amount: Number(amount),
            category,
            description,
            date: new Date()
        });

        await expense.save();

        // חישוב היתרה המעודכנת
        const updatedTotalExpenses = await Expense.aggregate([
            { $match: { userId: userObjectId } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const currentBalance = (totalIncome[0]?.total || 0) - (updatedTotalExpenses[0]?.total || 0);

        res.status(201).json({
            message: 'ההוצאה נוספה בהצלחה',
            expense,
            currentBalance,
            availableBalance: currentBalance // מחזיר את היתרה המעודכנת
        });

    } catch (error) {
        console.error('שגיאה בהוספת הוצאה:', error);
        res.status(500).json({ error: 'שגיאה בהוספת ההוצאה' });
    }
};
// קבלת כל ההוצאות של משתמש
exports.getExpenses = async (req, res) => {
    try {
        const { 
            userId,
            startDate,
            endDate,
            category,
            isRecurring,
            sortBy = 'date',
            sortOrder = 'desc',
            page = 1,
            limit = 10
        } = req.query;

        const query = { userId };

        // הוספת פילטרים
        if (startDate && endDate) {
            query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }
        if (category) {
            query.category = category;
        }
        if (isRecurring !== undefined) {
            query.isRecurring = isRecurring === 'true';
        }

        const expenses = await Expense.find(query)
            .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Expense.countDocuments(query);

        res.json({
            expenses,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page,
                limit
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'שגיאה בקבלת ההוצאות', error: error.message });
    }
};

// עדכון הוצאה
exports.updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const expense = await Expense.findById(id);
        if (!expense) {
            return res.status(404).json({ message: 'ההוצאה לא נמצאה' });
        }

        // אם יש שינוי בסכום, צריך לעדכן גם את התקציב
        if (updateData.amount && updateData.amount !== expense.amount) {
            const currentBudget = await Budget.getCurrentBudget(expense.userId);
            if (currentBudget) {
                // מחזירים את הסכום הישן
                await currentBudget.updateCategoryUsage(expense.category, -expense.amount);
                // מוסיפים את הסכום החדש
                await currentBudget.updateCategoryUsage(updateData.category || expense.category, updateData.amount);
            }
        }

        const updatedExpense = await Expense.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        );

        res.json({ 
            message: 'ההוצאה עודכנה בהצלחה', 
            expense: updatedExpense 
        });

    } catch (error) {
        res.status(500).json({ message: 'שגיאה בעדכון ההוצאה', error: error.message });
    }
};

// מחיקת הוצאה
exports.deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        
        const expense = await Expense.findById(id);
        if (!expense) {
            return res.status(404).json({ message: 'ההוצאה לא נמצאה' });
        }

        // עדכון התקציב לפני המחיקה
        const currentBudget = await Budget.getCurrentBudget(expense.userId);
        if (currentBudget) {
            await currentBudget.updateCategoryUsage(expense.category, -expense.amount);
        }

        await Expense.findByIdAndDelete(id);
        res.json({ message: 'ההוצאה נמחקה בהצלחה' });

    } catch (error) {
        res.status(500).json({ message: 'שגיאה במחיקת ההוצאה', error: error.message });
    }
};

// קבלת סיכום הוצאות לפי קטגוריות
exports.getExpenseSummary = async (req, res) => {
    try {
        const { userId, startDate, endDate } = req.query;

        const summary = await Expense.aggregate([
            {
                $match: {
                    userId: userId,
                    date: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    }
                }
            },
            {
                $group: {
                    _id: '$category',
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json(summary);

    } catch (error) {
        res.status(500).json({ message: 'שגיאה בקבלת סיכום ההוצאות', error: error.message });
    }
};

// קבלת היסטוריית הוצאות
exports.getExpenseHistory = async (req, res) => {
    try {
        const { userId } = req.query;

        const expenses = await Expense.find({ userId }).sort({ date: -1 });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: 'שגיאה בקבלת היסטוריית ההוצאות', error: error.message });
    }
};
module.exports = exports;


