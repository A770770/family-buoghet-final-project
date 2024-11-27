const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Child = require('../models/Child');
const Request = require('../models/Request');
const auth = require('../middleware/auth');

// Get pending requests for a parent
router.get('/pending-requests', auth, async (req, res) => {
    try {
        const parentId = req.user.id;

        // בדיקת הרשאות
        if (!req.user.role || req.user.role !== 'parent') {
            return res.status(403).json({ message: 'אין הרשאת גישה - נדרשת הרשאת הורה' });
        }

        // מצא את ההורה
        const parent = await User.findById(parentId);
        if (!parent) {
            return res.status(404).json({ message: 'משתמש לא נמצא' });
        }

        // מצא את כל הילדים של ההורה
        const children = await Child.find({ parent: parentId });
        if (!children.length) {
            return res.json([]); // אם אין ילדים, מחזיר מערך ריק
        }

        const childIds = children.map(child => child._id);

        // מצא את כל הבקשות הממתינות מהילדים של ההורה
        const pendingRequests = await Request.find({
            childId: { $in: childIds },
            status: 'pending'
        })
        .populate('childId', 'name')
        .sort({ createdAt: -1 });

        // הוסף את זמן ההמתנה לכל בקשה
        const requestsWithWaitingTime = pendingRequests.map(request => {
            const waitingTime = Math.floor((Date.now() - new Date(request.createdAt).getTime()) / 1000 / 60); // בדקות
            return {
                id: request._id,
                childId: request.childId,
                amount: request.amount,
                description: request.description,
                category: request.category,
                status: request.status,
                createdAt: request.createdAt,
                waitingTime
            };
        });

        res.json(requestsWithWaitingTime);
    } catch (error) {
        console.error('Error in getting pending requests:', error);
        res.status(500).json({ message: 'שגיאת שרת' });
    }
});

// Handle request approval
router.post('/requests/:requestId/approve', auth, async (req, res) => {
    try {
        // מצא את הבקשה ומלא את פרטי הילד
        const request = await Request.findById(req.params.requestId);
        if (!request) {
            return res.status(404).json({ message: 'בקשה לא נמצאה' });
        }

        // מצא את הילד
        const child = await Child.findById(request.childId);
        if (!child) {
            return res.status(404).json({ message: 'ילד לא נמצא' });
        }

        // וודא שההורה מורשה לטפל בבקשה זו
        if (child.parent.toString() !== req.user.id) {
            return res.status(403).json({ message: 'אין לך הרשאה לטפל בבקשה זו' });
        }

        // וודא שהבקשה במצב ממתין
        if (request.status !== 'pending') {
            return res.status(400).json({ message: 'לא ניתן לטפל בבקשה זו' });
        }

        // וודא שיש מספיק תקציב
        if (child.remainingBudget < request.amount) {
            return res.status(400).json({ message: 'אין מספיק תקציב לאישור הבקשה' });
        }

        // עדכן את הבקשה
        request.status = 'approved';
        request.respondedAt = new Date();
        await request.save();

        // עדכן את התקציב של הילד
        child.remainingBudget -= request.amount;
        await child.save();

        res.json({ 
            message: 'הבקשה אושרה בהצלחה', 
            request,
            child: {
                _id: child._id,
                name: child.name,
                remainingBudget: child.remainingBudget
            }
        });
    } catch (error) {
        console.error('Error in approving request:', error);
        res.status(500).json({ message: 'שגיאת שרת' });
    }
});

// Handle request rejection
router.post('/requests/:requestId/reject', auth, async (req, res) => {
    try {
        // מצא את הבקשה ומלא את פרטי הילד
        const request = await Request.findById(req.params.requestId);
        if (!request) {
            return res.status(404).json({ message: 'בקשה לא נמצאה' });
        }

        // מצא את הילד
        const child = await Child.findById(request.childId);
        if (!child) {
            return res.status(404).json({ message: 'ילד לא נמצא' });
        }

        // וודא שההורה מורשה לטפל בבקשה זו
        if (child.parent.toString() !== req.user.id) {
            return res.status(403).json({ message: 'אין לך הרשאה לטפל בבקשה זו' });
        }

        // וודא שהבקשה במצב ממתין
        if (request.status !== 'pending') {
            return res.status(400).json({ message: 'לא ניתן לטפל בבקשה זו' });
        }

        // עדכן את הבקשה
        request.status = 'rejected';
        request.respondedAt = new Date();
        if (req.body.message) {
            request.responseMessage = req.body.message;
        }
        await request.save();

        res.json({ 
            message: 'הבקשה נדחתה', 
            request,
            child: {
                _id: child._id,
                name: child.name,
                remainingBudget: child.remainingBudget
            }
        });
    } catch (error) {
        console.error('Error in rejecting request:', error);
        res.status(500).json({ message: 'שגיאת שרת' });
    }
});

module.exports = router;
