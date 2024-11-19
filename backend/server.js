// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const connectDB = require('./db/index');

const app = express();
const server = http.createServer(app);

// מידלוורים
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));

// נתיבים
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/income', require('./routes/income'));

// התחברות למסד הנתונים
connectDB();

const PORT = process.env.PORT || 5004;
server.listen(PORT, () => {
    console.log(`השרת פועל בפורט ${PORT}`);
});
