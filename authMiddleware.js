// authMiddleware.js (Updated with authorizeClassTeacher)

const jwt = require('jsonwebtoken');
const { User, Class, Enrollment } = require('./models'); // Import Class and Enrollment
const JWT_SECRET = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    jwt.verify(token, JWT_SECRET, (err, decodedPayload) => {
        if (err) {
            console.error('Token verification error:', err.message);
            if (err.name === 'JsonWebTokenError') {
                 return res.status(403).json({ message: 'Access denied. Invalid token format.' });
            } else if (err.name === 'TokenExpiredError') {
                 return res.status(403).json({ message: 'Access denied. Token has expired.' });
            }
            return res.status(403).json({ message: 'Access denied. Token verification failed.' });
        }
        
        if (!decodedPayload || !decodedPayload.user) {
            console.error('Token verification error: Decoded payload or user object is missing.');
            return res.status(403).json({ message: 'Access denied. Invalid token payload.' });
        }
        req.user = decodedPayload.user;
        next();
    });
}

function authorizeTeacher(req, res, next) {
    if (req.user && req.user.role === 'teacher') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Teacher privileges required.' });
    }
}

function authorizeStudent(req, res, next) {
    if (req.user && req.user.role === 'student') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Student privileges required.' });
    }
}

// Function to authorize anyone who is a member of the class (teacher or enrolled student)
async function authorizeClassMember(req, res, next) {
    try {
        const { classId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const targetClass = await Class.findByPk(classId);
        if (!targetClass) {
            return res.status(404).json({ message: 'Class not found.' });
        }

        // Check if user is the teacher
        if (userRole === 'teacher' && targetClass.teacherId === userId) {
            return next(); // Teacher is a member, proceed
        }

        // If not the teacher, check if the user is an enrolled student
        if (userRole === 'student') {
            const enrollment = await Enrollment.findOne({
                where: {
                    studentId: userId,
                    classId: classId
                }
            });

            if (enrollment) {
                return next(); // Student is enrolled, proceed
            }
        }

        // If neither, deny access
        return res.status(403).json({ message: 'You are not authorized to access this class.' });

    } catch (e) {
        console.error('Authorization error in authorizeClassMember:', e);
        res.status(500).json({ message: 'An error occurred during authorization.' });
    }
}

// NEW: Function to authorize a user who is the specific teacher of the class
async function authorizeClassTeacher(req, res, next) {
    try {
        const { classId } = req.params;
        const userId = req.user.id;

        // First, ensure the user has the teacher role globally
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Access denied. Teacher privileges required.' });
        }

        const targetClass = await Class.findByPk(classId);
        if (!targetClass) {
            return res.status(404).json({ message: 'Class not found.' });
        }

        // Now, check if this specific teacher owns this specific class
        if (targetClass.teacherId === userId) {
            return next(); // The user is the teacher of this class, proceed
        }

        // If not the owner, deny access
        return res.status(403).json({ message: 'You are not authorized to manage this class.' });

    } catch (e) {
        console.error('Authorization error in authorizeClassTeacher:', e);
        res.status(500).json({ message: 'An error occurred during authorization.' });
    }
}


module.exports = {
    authenticateToken,
    authorizeTeacher, // Keep this for general teacher actions
    authorizeStudent,
    authorizeClassMember,
    authorizeClassTeacher // EXPORT THE NEW FUNCTION
};