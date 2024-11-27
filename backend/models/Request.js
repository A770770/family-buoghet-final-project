const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    childId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Child', 
        required: true 
    },
    amount: { 
        type: Number, 
        required: true,
        min: 0
    },
    category: { 
        type: String, 
        required: true,
        enum: ['משחקים', 'בגדים', 'ממתקים', 'צעצועים', 'ספרים', 'בילויים', 'אחר']
    },
    description: { 
        type: String, 
        required: true,
        maxlength: 500
    },
    status: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected'], 
        default: 'pending'
    },
    responseMessage: {
        type: String,
        maxlength: 1000
    },
    createdAt: { 
        type: Date, 
        default: Date.now,
        index: true
    },
    respondedAt: { 
        type: Date 
    }
}, {
    timestamps: true
});

// וירטואלי - זמן המתנה בשעות
requestSchema.virtual('waitingTime').get(function() {
    if (this.respondedAt) {
        return Math.round((this.respondedAt - this.createdAt) / (1000 * 60 * 60));
    }
    return Math.round((Date.now() - this.createdAt) / (1000 * 60 * 60));
});

// אינדקסים לביצועים טובים יותר
requestSchema.index({ childId: 1, status: 1 });
requestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Request', requestSchema);
