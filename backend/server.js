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

const allowedOrigins = [
    process.env.CLIENT_URL || 'http://localhost:3000',
    'http://localhost:3001'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
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