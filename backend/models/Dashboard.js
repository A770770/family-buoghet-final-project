// models/Expense.js
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
        type: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    monthlyStats: {
        totalExpenses: Number,
        totalIncome: Number,
        expensesByCategory: [{
            category: String,
            amount: Number
        }],
        dailyExpenses: [{
            date: Date,
            amount: Number
        }]
    }
}, {
    timestamps: true
});

const Dashboard = mongoose.model('Dashboard', dashboardSchema);
module.exports = Dashboard;
