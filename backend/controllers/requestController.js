// controllers/requestController.js
const Request = require('../models/Request');
const User = require('../models/User');
const Alert = require('../models/Alert');
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const Income = require('../models/Income'); // Added Income model
const Child = require('../models/Child'); // Added Child model
const { refreshDashboardInternal } = require('./dashboardController');

exports.createRequest = async (req, res) => {
    try {
        const { amount, description, category } = req.body;
        const childId = req.user.id;
        
        // מציאת ההורה המקושר
        const child = await User.findById(childId);
        if (!child || !child.parentId) {
            return res.status(400).json({ error: 'לא נמצא הורה מקושר' });
        }

        const request = new Request({
            childId,
            parentId: child.parentId,
            amount,
            description,
            category,
            requestDate: new Date(),
            status: 'pending'
        });

        await request.save();

        // יצירת התראה להורה
        await Alert.create({
            userId: child.parentId,
            type: 'new_request',
            message: `התקבלה בקשה חדשה מ-${child.username}`,
            relatedData: {
                requestId: request._id,
                amount,
                description
            }
        });

        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ error: 'שגיאה ביצירת הבקשה' });
    }
};

exports.getRequests = async (req, res) => {
    try {
        const { id, role } = req.user;
        const { status, startDate, endDate } = req.query;

        let query = {};
        
        // הורה רואה את כל הבקשות של הילדים שלו
        // ילד רואה רק את הבקשות שלו
        if (role === 'parent') {
            query.parentId = id;
        } else {
            query.childId = id;
        }

        if (status) {
            query.status = status;
        }

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const requests = await Request.find(query)
            .sort({ date: -1 })
            .populate('childId', 'username')
            .exec();

        res.json(requests);

    } catch (error) {
        res.status(500).json({ error: 'שגיאה בקבלת הבקשות' });
    }
};

exports.getMyRequests = async (req, res) => {
    try {
        const userId = req.user.id;
        const requests = await Request.find({
            $or: [
                { childId: userId },
                { parentId: userId }
            ]
        }).sort({ requestDate: -1 });
        
        res.json(requests);
    } catch (error) {
        console.error('Error getting my requests:', error);
        res.status(500).json({ error: 'שגיאה בקבלת הבקשות' });
    }
};

exports.respondToRequest = async (req, res) => {
    const { requestId } = req.params;
    const { action, message } = req.body;
    const parentId = req.user.id;

    try {
        // מציאת הבקשה
        const request = await Request.findById(requestId).populate('childId');
        if (!request) {
            return res.status(404).json({ message: 'הבקשה לא נמצאה' });
        }

        const child = request.childId;
        if (!child) {
            return res.status(404).json({ message: 'הילד לא נמצא' });
        }

        // בדיקה שההורה הוא אכן ההורה של הילד
        if (child.parent.toString() !== parentId) {
            return res.status(403).json({ message: 'אין לך הרשאה לטפל בבקשה זו' });
        }

        // עדכון סטטוס הבקשה
        request.status = action;
        request.responseMessage = message;
        request.respondedAt = new Date();
        await request.save();

        if (action === 'approve') {
            // עדכון תקציב הילד
            child.remainingBudget += request.amount;
            await child.save();

            // מציאת תקציב ההורה
            const parentBudget = await Budget.findOne({ userId: parentId });
            if (!parentBudget) {
                return res.status(404).json({ message: 'לא נמצא תקציב להורה' });
            }

            // עדכון תקציב ההורה
            parentBudget.amount -= request.amount;
            await parentBudget.save();

            // יצירת הוצאה להורה
            await Expense.create({
                userId: parentId,
                amount: request.amount,
                category: 'העברה לילד',
                description: `העברה ל${child.username}: ${request.description}`,
                date: new Date()
            });

            // רענון הדשבורד של שני הצדדים
            await refreshDashboardInternal(parentId);
            await refreshDashboardInternal(request.childId._id);
        }

        res.json({ 
            message: action === 'approve' ? 'הבקשה אושרה' : 'הבקשה נדחתה',
            child: await Child.findById(child._id),
            request
        });
    } catch (error) {
        console.error('Error in respondToRequest:', error);
        res.status(500).json({ 
            message: 'שגיאה בטיפול בבקשה',
            error: error.message 
        });
    }
};

exports.getPendingRequestsCount = async (req, res) => {
    try {
        const parentId = req.user.id;
        console.log('Getting pending requests for parent:', {
            parentId,
            userInfo: req.user
        });

        // בדיקת כל הילדים במערכת
        const allChildren = await Child.find({}).select('_id name parent');
        console.log('All children:', allChildren.map(child => ({
            id: child._id,
            name: child.name,
            parent: child.parent
        })));

        // בדיקת כל הבקשות הממתינות במערכת
        const allRequests = await Request.find({ status: 'pending' })
            .populate('childId', 'name parent');
        
        console.log('All pending requests:', allRequests.map(req => ({
            id: req._id,
            childName: req.childId?.name,
            childId: req.childId?._id,
            childParent: req.childId?.parent,
            amount: req.amount,
            status: req.status
        })));

        // מצא את כל הילדים של ההורה הזה
        const children = await Child.find({
            parent: parentId
        }).select('_id');

        const childrenIds = children.map(child => child._id);

        console.log('Found children:', {
            parentId,
            childrenCount: children.length,
            childrenIds: childrenIds.map(id => id.toString())
        });
        
        // מצא את כל הבקשות הממתינות מהילדים של ההורה
        const count = await Request.countDocuments({
            childId: { $in: childrenIds },
            status: 'pending'
        });

        console.log('Pending requests:', { 
            parentId,
            childrenIds: childrenIds.map(id => id.toString()),
            count
        });
        
        res.json({ count });
    } catch (error) {
        console.error('Error getting pending count:', error);
        res.status(500).json({ error: 'שגיאה בקבלת מספר הבקשות הממתינות' });
    }
};

exports.deleteRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { id, role } = req.user;

        const request = await Request.findById(requestId);
        if (!request) {
            return res.status(404).json({ error: 'הבקשה לא נמצאה' });
        }

        // רק הילד שיצר את הבקשה יכול למחוק אותה, וזה רק אם היא עדיין ממתינה
        if (role === 'child' && (request.childId.toString() !== id || request.status !== 'pending')) {
            return res.status(403).json({ error: 'אין הרשאה למחוק בקשה זו' });
        }

        await Request.findByIdAndDelete(requestId);
        res.json({ message: 'הבקשה נמחקה בהצלחה' });

    } catch (error) {
        res.status(500).json({ error: 'שגיאה במחיקת הבקשה' });
    }
};

module.exports = exports;