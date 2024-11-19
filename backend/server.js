// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// ייבוא נתיבים מאוחדים
const authRoutes = require('./routes/auth');
const connectDB = require('./db'); // ייבוא החיבור למסד הנתונים
// const dashboardRoutes = require('./routes/dashboard');

// הגדרות ראשוניות
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

// מידלוורים
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));


// שימוש בנתיבים המאוחדים
app.use('/api/auth', authRoutes);
// app.use('/api/dashboard', dashboardRoutes);
console.log('Registering routes...');
console.log('Routes registered successfully');

// לוגינג
app.use((req, res, next) => {
    console.log('Request Body:', req.body);
    next();
});

// טיפול בשגיאות JSON
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ error: 'Invalid JSON' });
    }
    next();
});

// בדיקת בריאות
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date(),
        env: process.env.NODE_ENV
    });
});

// הוסף אחרי שורה 44
// טיפול בשגיאות כלליות
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ 
        message: 'שגיאת שרת פנימית', 
        error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
});

// התחברות למסד הנתונים והפעלת השרת
const startServer = async () => {
    try {
        await connectDB(); // חיבור למסד הנתונים מתוך הקובץ db.js
        console.log('Connected to MongoDB');
        
        const PORT = process.env.PORT || 5004;
        server.listen(PORT, () => {
            console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
        });
        
        // // ניהול Socket.IO
        // io.on('connection', (socket) => {
        //     console.log('Client connected');
            
        //     socket.on('disconnect', () => {
        //         console.log('Client disconnected');
        //     });
            
        //     // אירועי זמן אמת
        //     socket.on('expense:added', (data) => {
        //         socket.broadcast.emit('expense:update', data);
        //     });
            
        //     socket.on('budget:updated', (data) => {
        //         socket.broadcast.emit('budget:update', data);
        //     });
        // });
        
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

// טיפול בסגירה נקייה
const gracefulShutdown = () => {
    console.log('Received kill signal, shutting down gracefully');
    server.close(() => {
        console.log('Closed out remaining connections');
        process.exit(0);
    });

    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

module.exports = server;
