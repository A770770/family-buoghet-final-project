const express = require('express');
const router = express.Router();
const Child = require('../models/Child');
const User = require('../models/User');
const Request = require('../models/Request');
const auth = require('../middleware/auth');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// יצירת ילד חדש
router.post('/', auth, async (req, res) => {
    try {
        const { name, monthlyBudget } = req.body;
        
        // יצירת סיסמה רנדומלית בת 6 תווים
        const password = crypto.randomBytes(3).toString('hex');
        
        const child = new Child({
            name,
            monthlyBudget,
            remainingBudget: monthlyBudget,
            password,
            parent: req.user.id,
            requests: []
        });

        await child.save();

        // הוספת הילד למערך הילדים של ההורה
        await User.findByIdAndUpdate(req.user.id, {
            $push: { children: child._id }
        });

        res.status(201).json({ child, password });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// קבלת כל הילדים של ההורה כולל הבקשות שלהם
router.get('/', auth, async (req, res) => {
    try {
        const children = await Child.find({ parent: req.user.id })
            .populate({
                path: 'requests',
                match: { status: 'pending' }
            });
        res.json(children);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// בדיקה אם יש בקשות חדשות
router.get('/requests/new', auth, async (req, res) => {
    try {
        const children = await Child.find({ parent: req.user.id });
        const childIds = children.map(child => child._id);
        
        const newRequests = await Request.find({
            childId: { $in: childIds },
            status: 'pending',
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // בקשות מה-24 שעות האחרונות
        });

        res.json({ hasNew: newRequests.length > 0 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// עדכון סטטוס בקשה
router.put('/requests/:requestId', auth, async (req, res) => {
    try {
        const { status, message } = req.body;
        const requestId = req.params.requestId;

        const request = await Request.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: 'הבקשה לא נמצאה' });
        }

        // וידוא שהבקשה שייכת לילד של ההורה המחובר
        const child = await Child.findById(request.childId);
        if (child.parent.toString() !== req.user.id) {
            return res.status(403).json({ message: 'אין הרשאה לעדכן בקשה זו' });
        }

        request.status = status;
        request.responseMessage = message;
        request.respondedAt = new Date();
        await request.save();

        // אם הבקשה אושרה, עדכון התקציב הנותר של הילד
        if (status === 'approved') {
            child.remainingBudget -= request.amount;
            await child.save();
        }

        res.json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// עדכון תקציב חודשי של ילד
router.put('/:childId/budget', auth, async (req, res) => {
    try {
        const { monthlyBudget } = req.body;
        const childId = req.params.childId;

        const child = await Child.findById(childId);
        if (!child) {
            return res.status(404).json({ message: 'הילד לא נמצא' });
        }

        if (child.parent.toString() !== req.user.id) {
            return res.status(403).json({ message: 'אין הרשאה לעדכן ילד זה' });
        }

        // חישוב ההפרש בין התקציב החדש לישן
        const budgetDiff = monthlyBudget - child.monthlyBudget;
        
        child.monthlyBudget = monthlyBudget;
        child.remainingBudget += budgetDiff; // עדכון התקציב הנותר בהתאם לשינוי
        
        await child.save();

        res.json(child);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// התחברות ילד עם סיסמה
router.post('/login', async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: 'נא להזין סיסמה' });
        }

        const child = await Child.findOne({ password })
            .populate('parent', 'email name')
            .select('+password');

        if (!child) {
            return res.status(401).json({ message: 'סיסמה שגויה' });
        }

        const token = jwt.sign(
            { 
                userId: child._id,
                role: 'child',
                name: child.name,
                parentId: child.parent._id
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: child._id,
                name: child.name,
                role: 'child',
                parentId: child.parent._id,
                monthlyBudget: child.monthlyBudget,
                remainingBudget: child.remainingBudget
            }
        });
    } catch (error) {
        console.error('Child login error:', error);
        res.status(500).json({ message: 'שגיאה בהתחברות' });
    }
});

// קבלת נתוני ילד
router.get('/:id/data', auth, async (req, res) => {
    try {
        const childId = req.params.id;
        
        const child = await Child.findById(childId)
            .populate('parent', 'email name')
            .populate('requests');

        if (!child) {
            return res.status(404).json({ message: 'הילד לא נמצא' });
        }

        // וידוא שהמשתמש המחובר הוא ההורה של הילד או הילד עצמו
        if (child.parent._id.toString() !== req.user.id && child._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'אין הרשאה לצפות בנתונים אלו' });
        }

        res.json(child);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
