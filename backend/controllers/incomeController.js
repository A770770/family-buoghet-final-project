const Income = require('../models/Income');
const Budget = require('../models/Budget');

exports.addIncome = async (req, res) => {
    try {
        const { amount, source, description, userId } = req.body;

        // בדיקת הרשאות
        if (req.user.id !== userId && req.user.role !== 'parent') {
            return res.status(403).json({ message: 'אין הרשאה לבצע פעולה זו' });
        }

        const newIncome = new Income({
            amount,
            source,
            description,
            userId,
            date: new Date()
        });

        await newIncome.save();

        // עדכון התקציב
        const budget = await Budget.findOne({ userId });
        if (budget) {
            budget.amount += amount;
            budget.remainingAmount += amount;
            await budget.save();
        }

        res.status(201).json({
            message: 'ההכנסה נוספה בהצלחה',
            income: newIncome
        });

    } catch (error) {
        console.error('Error adding income:', error);
        res.status(500).json({ message: 'שגיאה בהוספת הכנסה' });
    }
}; 