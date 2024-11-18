// backend/config/config.js
require('dotenv').config();

module.exports = {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiration: '24h',
    mongoURI: process.env.MONGO_URI,
    port: process.env.PORT || 5004
};