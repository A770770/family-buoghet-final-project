const Income = require('../models/Income');
const Budget = require('../models/Budget');

exports.addIncome = async (req, res) => {
    try {
        const { amount, source, description, userId } = req.body;
        console.log('מוסיף הכנסה:', { amount, source, description, userId });

        // בדיקת תקציב קיים
        let currentBudget = await Budget.findOne({ userId });
        console.log('תקציב נוכחי:', currentBudget);

        // יצירת הכנסה חדשה
        const newIncome = new Income({
            amount: Number(amount),
            source,
            description,
            userId,
            date: new Date()
        });

        // שמירת ההכנסה
        const savedIncome = await newIncome.save();
        console.log('הכנסה נשמרה:', savedIncome);

        // עדכון או יצירת תקציב
        if (currentBudget) {
            // עדכון תקציב קיים
            const updateResult = await Budget.findOneAndUpdate(
                { userId },
                { 
                    $inc: { 
                        amount: Number(amount),
                        remainingAmount: Number(amount)
                    }
                },
                { new: true }
            );
            console.log('תקציב עודכן:', updateResult);
            currentBudget = updateResult;
        } else {
            // יצירת תקציב חדש
            const today = new Date();
            const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            
            const newBudget = new Budget({
                userId,
                amount: Number(amount),
                remainingAmount: Number(amount),
                categories: [],
                startDate: today,
                endDate: endOfMonth
            });
            
            currentBudget = await newBudget.save();
            console.log('תקציב חדש נוצר:', currentBudget);
        }

        res.status(201).json({
            message: 'ההכנסה נוספה בהצלחה',
            income: savedIncome,
            budgetStatus: {
                totalAmount: currentBudget.amount,
                remainingAmount: currentBudget.remainingAmount
            }
        });

    } catch (error) {
        console.error('Error adding income:', error);
        res.status(500).json({ 
            message: 'שגיאה בהוספת הכנסה',
            error: error.message
        });
    }
}; 