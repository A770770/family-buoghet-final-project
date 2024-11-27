const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Child = require('../models/Child');
const Request = require('../models/Request');
const auth = require('../middleware/auth');

// Get pending requests for a specific parent
router.get('/:parentId/pending-requests', auth, async (req, res) => {
    try {
        const parentId = req.params.parentId;

        // וודא שהמשתמש מנסה לגשת לנתונים שלו
        if (req.user.id !== parentId) {
            return res.status(403).json({ message: 'אין לך הרשאה לגשת לנתונים אלה' });
        }

        // מצא את ההורה ואת הילדים שלו
        const parent = await User.findById(parentId);
        if (!parent || parent.role !== 'parent') {
            return res.status(404).json({ message: 'הורה לא נמצא' });
        }

        // מצא את כל הילדים של ההורה
        const children = await Child.find({ parentId: parentId });
        const childIds = children.map(child => child._id);

        // מצא את כל הבקשות הממתינות מהילדים של ההורה
        const pendingRequests = await Request.find({
            childId: { $in: childIds },
            status: 'pending'
        }).populate('childId', 'name');

        res.json(pendingRequests);
    } catch (error) {
        console.error('Error in getting pending requests:', error);
        res.status(500).json({ message: 'שגיאת שרת' });
    }
});

module.exports = router;
