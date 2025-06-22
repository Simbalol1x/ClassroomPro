// routes/userRoutes.js (Now with Robust Input Validation)

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User } = require('../models');
const nodemailer = require('nodemailer');
const { generateResetToken } = require('../utils/helpers');
const { authenticateToken } = require('../authMiddleware');
// --- IMPORT THE NEW VALIDATION TOOLS ---
const { body, validationResult } = require('express-validator');


const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

// ... (transporter setup is unchanged) ...
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: (process.env.EMAIL_PORT === "465"),
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
});


// --- THIS IS THE BOUNCER'S CHECKLIST FOR THE REGISTER ROUTE ---
const registerValidationRules = [
    // email must be a valid email and we'll automatically clean it up
    body('email', 'Please provide a valid email address').isEmail().trim().normalizeEmail(),
    
    // firstName cannot be empty and we'll trim whitespace
    body('firstName', 'First name is required').not().isEmpty().trim(),
    
    // lastName cannot be empty and we'll trim whitespace
    body('lastName', 'Last name is required').not().isEmpty().trim(),
    
    // role must be either 'student' or 'teacher'
    body('role', 'A valid role is required').isIn(['student', 'teacher']),
    
    // password must meet our complexity requirements
    body('password', 'Password must be at least 8 characters long and contain an uppercase letter, a lowercase letter, a number, and a special character.')
        .isLength({ min: 8 })
        .matches(PWD_REGEX)
];


// --- APPLY THE CHECKLIST TO THE REGISTER ROUTE ---
router.post('/register', registerValidationRules, async (req, res) => {
    // 1. The bouncer (middleware) first runs. Then, we check the bouncer's report.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // If the report is not clean, reject the request with the list of errors.
        return res.status(400).json({ message: "Validation failed.", errors: errors.array() });
    }

    // 2. If validation passes, we proceed with our existing logic.
    try {
        const { email, password, firstName, lastName, role } = req.body;
        // NOTE: The manual check `if (![...].every(Boolean))` is no longer needed!
        
        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = await User.create({ email, passwordHash, firstName, lastName, role });
        
        const payload = { id: newUser.id, email: newUser.email, role: newUser.role, firstName: newUser.firstName, lastName: newUser.lastName };
        const token = jwt.sign({ user: payload }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        res.status(201).json({ message: "User registered successfully!", token, user: payload });
    } catch (e) {
        if (e.name === 'SequelizeUniqueConstraintError') return res.status(409).json({ message: 'This email is already registered.' });
        if (e.name === 'SequelizeValidationError') return res.status(400).json({ message: e.errors.map(err => err.message).join('. ') });
        console.error("Registration error:", e);
        res.status(500).json({ message: 'Server registration error.' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "Email and password are required." });

        const user = await User.findOne({ where: { email: (email || "").toLowerCase() } });
        if (!user || !(await bcrypt.compare(password || "", user.passwordHash))) return res.status(401).json({ message: 'Invalid credentials.' });
        
        const payload = { id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName };
        const token = jwt.sign({ user: payload }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        res.json({ token, user: payload });
    } catch (e) {
        console.error("Login error:", e);
        res.status(500).json({ message: 'Server login error.' });
    }
});

// All other user routes... this file has no dynamic parameters and is safe.
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const { firstName, lastName } = req.body;
        if (!firstName || !firstName.trim() || !lastName || !lastName.trim()) {
            return res.status(400).json({ message: "First name and last name are required." });
        }
        const user = await User.findByPk(req.user.id);
        user.firstName = firstName.trim();
        user.lastName = lastName.trim();
        await user.save();
        const updatedPayload = { id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName };
        res.json({ message: 'Profile updated successfully!', user: updatedPayload });
    } catch (e) { res.status(500).json({ message: "Error updating profile." }); }
});

router.put('/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmNewPassword } = req.body;
        if (newPassword !== confirmNewPassword) return res.status(400).json({ message: "New passwords do not match." });
        if (!PWD_REGEX.test(newPassword)) return res.status(400).json({ message: "New password does not meet complexity requirements." });
        const user = await User.findByPk(req.user.id);
        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isMatch) return res.status(401).json({ message: "Incorrect current password." });
        user.passwordHash = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.json({ message: 'Password changed successfully!' });
    } catch(e) { res.status(500).json({ message: "Error changing password." }); }
});

router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required." });
        }
        const user = await User.findOne({ where: { email: email.toLowerCase() } });
        
        if (user) {
            user.resetPasswordToken = generateResetToken();
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
            await user.save();

            // Construct reset URL (ensure FRONTEND_BASE_URL is in your .env)
            const resetUrl = `${process.env.FRONTEND_BASE_URL || 'http://localhost:3001'}/reset-password/${user.resetPasswordToken}`;
            
            const mailOptions = {
                to: user.email,
                from: process.env.EMAIL_FROM || process.env.EMAIL_USER, // Use a specific FROM or default to user
                subject: 'Password Reset Request',
                text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
                      `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
                      `${resetUrl}\n\n` +
                      `If you did not request this, please ignore this email and your password will remain unchanged.\n`
            };

            await transporter.sendMail(mailOptions);
        }
        // Always send a generic message to prevent email enumeration
        res.status(200).json({ message: "If your email is registered, you will receive password reset instructions." });
    } catch(e) { res.status(500).json({ message: 'Error processing forgot password request.' }); }
});

// In input_file_5.js
router.post('/reset-password', async (req, res) => {
     try {
        // Also get confirmPassword from the body
        const { token, newPassword, confirmPassword } = req.body;
        if (!token || !newPassword || !confirmPassword) { // Check for all fields
            return res.status(400).json({ message: "Token and both password fields are required." });
        }
        // Add this server-side check
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match." });
        }
        if (!PWD_REGEX.test(newPassword)) {
            return res.status(400).json({ message: "Password does not meet complexity requirements." });
        }
        const user = await User.findOne({ where: { resetPasswordToken: token, resetPasswordExpires: { [Op.gt]: Date.now() } } });
        if (!user) return res.status(400).json({ message: "Password reset token is invalid or has expired." });
        
        user.passwordHash = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();
        
        res.status(200).json({ message: "Password has been successfully reset." });
    } catch (e) { 
        console.error("Error resetting password:", e); // It's good to log the error
        res.status(500).json({ message: 'Error resetting password.' });
    }
});

// The incorrect route was here and has been removed.
module.exports = router;