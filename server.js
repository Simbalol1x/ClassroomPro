// server.js (Now with a Master Failsafe)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { sequelize } = require('./models');
const allRoutes = require('./routes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 150,
    standardHeaders: true,
    legacyHeaders: false,
});

if (process.env.NODE_ENV === 'production') {
    app.use(limiter);
}

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', allRoutes);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// --- THIS IS THE NEW DAMAGE CONTROL OFFICER MIDDLEWARE ---
app.use((err, req, res, next) => {
    console.error("--- UNHANDLED ERROR ---");
    console.error(err); // Log the full error for your own records

    // Don't leak stack traces to the client in production
    const isProduction = process.env.NODE_ENV === 'production';
    const message = isProduction ? 'An unexpected server error occurred.' : err.message;
    const stack = isProduction ? null : err.stack;
    
    // Set a status code from the error if one exists, otherwise default to 500 (Internal Server Error)
    const statusCode = err.status || 500;
    
    // Send a clean, safe JSON response
    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
        stack // This will be null in production
    });
});


const PORT = process.env.PORT || 3000;

if (!process.env.JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined in the .env file.");
    process.exit(1);
}

app.listen(PORT, async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection successful.');
        console.log(`Server is running on http://localhost:${PORT}`);
    } catch (error) {
        console.error('FATAL: Server start failed:', error);
        process.exit(1);
    }
});