const mongoose = require('mongoose');

const dashboardSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    totalBudget: {
        type: Number,
        default: 0
    },
    recentExpenses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Expense'
    }],
    upcomingExpenses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Expense'
    }],
    alerts: [{
        message: String,
        type: String
    }],
    monthlyStats: {
        type: Object,
        default: {}
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Dashboard', dashboardSchema);
