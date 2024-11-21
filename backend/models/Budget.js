// models/Budget.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        enum: ['food', 'transportation', 'bills', 'entertainment', 'shopping', 'other']
    },
    limit: {
        type: Number,
        required: true,
        min: 0
    },
    used: {
        type: Number,
        default: 0,
        min: 0
    }
});

const budgetSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    type: {
        type: String,
        enum: ['main', 'monthly', 'savings'],
        default: 'main'
    },
    categoryUsage: {
        type: Map,
        of: Number,
        default: {}
    },
    startDate: Date,
    endDate: Date,
    isActive: {
        type: Boolean,
        default: true
    }
});

// מתודה לעדכון שימוש בקטגוריה
budgetSchema.methods.updateCategoryUsage = async function(category, amount) {
    if (!this.categoryUsage) {
        this.categoryUsage = {};
    }
    
    if (this.categoryUsage[category]) {
        this.categoryUsage[category] += amount;
    } else {
        this.categoryUsage[category] = amount;
    }
    
    return this.save();
};

const Budget = mongoose.model('Budget', budgetSchema);

module.exports = Budget;