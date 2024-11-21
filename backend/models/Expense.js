// models/Expense.js
const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['מזון', 'תחבורה', 'בילויים', 'קניות', 'חינוך', 'בריאות', 'ביגוד', 'אחר', 'העברה לילד']
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Expense', expenseSchema);
