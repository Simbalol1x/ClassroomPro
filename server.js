// server.js (The Correct Full Code)

// --- IMPORTS ---
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const db = require('./models');
const userRoutes = require('./routes/userRoutes');
const classRoutes = require('./routes/classRoutes');

// --- APP INITIALIZATION ---
const app = express();

// --- MIDDLEWARE ---
// Enable CORS for all routes
app.use(cors());

// Basic security headers
app.use(helmet());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting to prevent brute-force attacks
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// --- API ROUTES ---
app.use('/api/users', userRoutes);
app.use('/api/classes', classRoutes);

// --- SERVE STATIC FILES (FRONTEND) ---
// This serves your index.html, app.js, and styles.css
app.use(express.static(path.join(__dirname, 'public')));

// --- CATCH-ALL FOR SPA ---
// This makes sure that if a user refreshes a page, the frontend routing can take over
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- DATABASE CONNECTION & SERVER START ---
const PORT = process.env.PORT || 3001;

/*  <-- ADD THIS LINE */
db.sequelize.sync().then(() => {
    console.log('Database connected and synchronized.');
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}.`);
    });
}).catch(err => {
    console.error('Failed to sync database:', err);
});
/*  <-- ADD THIS LINE */

module.exports = app;
