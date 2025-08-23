// server.js (FINAL AND CORRECT VERSION FOR VERCEL)

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const userRoutes = require('./routes/userRoutes');
const classRoutes = require('./routes/classRoutes');

const app = express();

// --- MIDDLEWARE ---

// THE PERMISSION SLIP for your GitHub website. THIS IS THE MOST IMPORTANT PART.
const corsOptions = {
    origin: 'https://simbalol1x.github.io'
};
app.use(cors(corsOptions));

// Other security and setup
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);


// --- API ROUTES ---
// No '/api' prefix
app.use('/users', userRoutes);
app.use('/classes', classRoutes);


// THIS IS THE ONLY LINE AT THE END FOR VERCEL
module.exports = app;
