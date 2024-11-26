const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    responseMessage: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    respondedAt: {
        type: Date
    }
});

const expenseSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    description: String,
    date: {
        type: Date,
        default: Date.now
    }
});

const childSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    monthlyBudget: {
        type: Number,
        required: true
    },
    remainingBudget: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true,
        select: false // לא יוחזר בשאילתות רגילות
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    expenses: [expenseSchema],
    requests: [requestSchema],
    lastNotificationCheck: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// וירטואלי: האם יש בקשות חדשות
childSchema.virtual('hasNewRequests').get(function() {
    if (!this.requests || !this.lastNotificationCheck) return false;
    return this.requests.some(req => 
        req.status === 'pending' && 
        req.createdAt > this.lastNotificationCheck
    );
});

// מתודה: עדכון תקציב חודשי
childSchema.methods.updateMonthlyBudget = async function(newBudget) {
    const budgetDiff = newBudget - this.monthlyBudget;
    this.monthlyBudget = newBudget;
    this.remainingBudget += budgetDiff;
    await this.save();
};

// מתודה: הוספת בקשה חדשה
childSchema.methods.addRequest = async function(requestData) {
    this.requests.push(requestData);
    await this.save();
    return this.requests[this.requests.length - 1];
};

// מתודה: עדכון סטטוס בקשה
childSchema.methods.updateRequestStatus = async function(requestId, status, message) {
    const request = this.requests.id(requestId);
    if (!request) throw new Error('הבקשה לא נמצאה');
    
    request.status = status;
    request.responseMessage = message;
    request.respondedAt = new Date();
    
    if (status === 'approved') {
        this.remainingBudget -= request.amount;
    }
    
    await this.save();
    return request;
};

module.exports = mongoose.model('Child', childSchema);
