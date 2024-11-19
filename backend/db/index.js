const mongoose = require('mongoose');
const config = require('../config/config');

const connectDB = async () => {
    try {
        await mongoose.connect(config.mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('התחברות למסד הנתונים הצליחה');
    } catch (error) {
        console.error('שגיאה בהתחברות למסד הנתונים:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;