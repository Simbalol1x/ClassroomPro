// routes/classRoutes.js (Fully Upgraded and Secure)

const express = require('express');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { Class, User, Enrollment, Announcement, AnnouncementView, sequelize } = require('../models');
const { authenticateToken, authorizeTeacher, authorizeStudent, authorizeClassMember, authorizeClassTeacher } = require('../authMiddleware');
const { generateClassCode } = require('../utils/helpers');

const router = express.Router();

// Get taught classes (SQL Injection Patched)
router.get('/taught', authenticateToken, authorizeTeacher, async (req, res, next) => {
    try {
        const classes = await Class.findAll({
            where: { teacherId: req.user.id },
            attributes: {
                include: [
                    [sequelize.literal('(SELECT COUNT(*) FROM "Enrollments" WHERE "Enrollments"."classId" = "Class"."id")'), 'studentCount'],
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*) FROM "Announcements" AS A
                            WHERE A."classId" = "Class"."id" AND A.id NOT IN (
                                SELECT AV."announcementId" FROM "AnnouncementViews" AS AV WHERE AV."userId" = :userId
                            )
                        )`),
                        'unreadAnnouncements'
                    ]
                ]
            },
            replacements: { userId: req.user.id },
            order: [['className', 'ASC']]
        });
        res.json({ classes });
    } catch (e) {
        next(e);
    }
});

// Get enrolled classes
router.get('/enrolled', authenticateToken, authorizeStudent, async (req, res, next) => {
    try {
        const enrollments = await Enrollment.findAll({
            where: { studentId: req.user.id },
            include: [{
                model: Class,
                required: true,
                include: [{ model: User, as: 'Teacher', attributes: ['firstName', 'lastName'] }]
            }],
            order: [[Class, 'className', 'ASC']]
        });
        
        const classes = enrollments.map(enrollment => {
            const classData = enrollment.Class.toJSON();
            classData.Enrollment = {
                enrollmentDate: enrollment.enrollmentDate,
                coursePoints: enrollment.coursePoints
            };
            return classData;
        });
        
        res.json({ classes });
    } catch (e) {
        next(e);
    }
});

// Create a new class (Using Transaction)
router.post('/', authenticateToken, authorizeTeacher, async (req, res, next) => {
    try {
        const newClass = await sequelize.transaction(async (t) => {
            const { className, description, joinPassword } = req.body;
            if (!className) {
                const error = new Error('Class name is required.');
                error.status = 400;
                throw error;
            }

            const joinPasswordHash = joinPassword ? await bcrypt.hash(joinPassword, 10) : null;
            
            return await Class.create({
                className,
                description,
                classCode: generateClassCode(),
                teacherId: req.user.id,
                joinPasswordHash
            }, { transaction: t });
        });
        res.status(201).json({ message: 'Class created successfully!', class: newClass });
    } catch (e) {
        if (e.name === 'SequelizeUniqueConstraintError') {
            e.status = 409;
            e.message = 'A class with this code already exists (rare collision, try again).';
        }
        next(e);
    }
});

// Get a single class's details
router.get('/:classId', authenticateToken, authorizeClassMember, async (req, res, next) => {
    try {
        const targetClass = await Class.findByPk(req.params.classId, {
            include: [{ model: User, as: 'Teacher', attributes: ['id', 'firstName', 'lastName'] }]
        });
        if (!targetClass) {
            const error = new Error('Class not found.');
            error.status = 404;
            return next(error);
        }
        res.json(targetClass);
    } catch (e) {
        next(e);
    }
});

// Update a class
router.put('/:classId', authenticateToken, authorizeClassTeacher, async (req, res, next) => {
    try {
        const { className, description, joinPassword } = req.body;
        if (!className) {
            const error = new Error('Class name is required.');
            error.status = 400;
            return next(error);
        }
        const targetClass = await Class.findByPk(req.params.classId);
        targetClass.className = className;
        targetClass.description = description;
        if (joinPassword) {
            targetClass.joinPasswordHash = await bcrypt.hash(joinPassword, 10);
        } else if (joinPassword === '') {
            targetClass.joinPasswordHash = null;
        }
        await targetClass.save();
        res.json({ message: 'Class updated successfully!', class: targetClass });
    } catch (e) {
        next(e);
    }
});

// Delete a class
router.delete('/:classId', authenticateToken, authorizeClassTeacher, async (req, res, next) => {
    try {
        const targetClass = await Class.findByPk(req.params.classId);
        if (!targetClass) {
            const error = new Error('Class not found.');
            error.status = 404;
            return next(error);
        }
        await targetClass.destroy();
        res.json({ message: 'Class deleted successfully.' });
    } catch (e) {
        next(e);
    }
});

// Join a class
router.post('/join', authenticateToken, authorizeStudent, async (req, res, next) => {
    try {
        const { classCode, classJoinPassword } = req.body;
        if (!classCode) return res.status(400).json({ message: 'Class code is required.' });
        
        const targetClass = await Class.findOne({ where: { classCode } });
        if (!targetClass) return res.status(404).json({ message: 'Class not found with this code.' });

        if (targetClass.joinPasswordHash) {
            if (!classJoinPassword) return res.status(401).json({ message: 'This class requires a password to join.' });
            const isMatch = await bcrypt.compare(classJoinPassword, targetClass.joinPasswordHash);
            if (!isMatch) return res.status(401).json({ message: 'Incorrect class password.' });
        }

        const [enrollment, created] = await Enrollment.findOrCreate({
            where: { studentId: req.user.id, classId: targetClass.id },
            defaults: { studentId: req.user.id, classId: targetClass.id }
        });

        if (!created) return res.status(409).json({ message: 'You are already enrolled in this class.' });
        
        res.status(201).json({ message: `Successfully joined ${targetClass.className}!` });
    } catch (e) {
        next(e);
    }
});

// Leave a class
router.delete('/leave/:classId', authenticateToken, authorizeStudent, async (req, res, next) => {
    try {
        const result = await Enrollment.destroy({ where: { studentId: req.user.id, classId: req.params.classId } });
        if (result === 0) return res.status(404).json({ message: 'You are not enrolled in this class or it does not exist.' });
        res.json({ message: 'Successfully left the class.' });
    } catch (e) {
        next(e);
    }
});

// Get class roster/leaderboard
router.get('/:classId/roster', authenticateToken, authorizeClassMember, async (req, res, next) => {
    try {
        const targetClass = await Class.findByPk(req.params.classId, {
            attributes: ['id', 'className', 'teacherId'],
            include: [{
                model: User,
                as: 'EnrolledStudents',
                attributes: ['id', 'firstName', 'lastName', 'email'],
                through: { attributes: ['enrollmentDate', 'coursePoints'] }
            }]
        });
        if (!targetClass) return res.status(404).json({ message: 'Class not found.' });
        
        const isTeacherView = req.user.role === 'teacher' && targetClass.teacherId === req.user.id;
        const roster = targetClass.EnrolledStudents.map(student => ({
            id: student.id,
            firstName: student.firstName,
            lastName: student.lastName,
            email: isTeacherView ? student.email : undefined,
            Enrollment: student.Enrollment
        }));
        
        res.json({ classId: targetClass.id, className: targetClass.className, roster: roster, isTeacherView });
    } catch (e) {
        next(e);
    }
});

// Remove a student from a class
router.delete('/:classId/students/:studentId', authenticateToken, authorizeClassTeacher, async (req, res, next) => {
    try {
        const { classId, studentId } = req.params;
        const result = await Enrollment.destroy({ where: { studentId, classId } });
        if (result === 0) return res.status(404).json({ message: 'Student not found in this class or already removed.' });
        res.json({ message: 'Student removed successfully from the class.' });
    } catch (e) {
        next(e);
    }
});

// Update a student's score
router.put('/:classId/students/:studentId/score', authenticateToken, authorizeClassTeacher, async (req, res, next) => {
    try {
        const { classId, studentId } = req.params;
        const { coursePoints } = req.body;

        if (typeof coursePoints !== 'number' || coursePoints < 0) {
            return res.status(400).json({ message: 'Invalid score. Course points must be a non-negative number.' });
        }
        
        const enrollment = await Enrollment.findOne({ where: { classId, studentId } });
        if (!enrollment) return res.status(404).json({ message: 'Student enrollment not found in this class.' });

        enrollment.coursePoints = coursePoints;
        await enrollment.save();

        res.json({ message: 'Student score updated successfully.', enrollment });
    } catch (e) {
        next(e);
    }
});


// --- Announcement Routes ---

router.get('/:classId/announcements', authenticateToken, authorizeClassMember, async (req, res, next) => {
    try {
        const announcements = await Announcement.findAll({
            where: { classId: req.params.classId },
            order: [['createdAt', 'DESC']]
        });
        res.json(announcements);
    } catch (e) {
        next(e);
    }
});

router.post('/:classId/announcements', authenticateToken, authorizeClassTeacher, async (req, res, next) => {
    try {
        const { title, content } = req.body;
        if (!title || !content) return res.status(400).json({ message: 'Title and content are required.' });

        const announcement = await Announcement.create({ title, content, classId: req.params.classId });
        res.status(201).json(announcement);
    } catch (e) {
        next(e);
    }
});

router.put('/:classId/announcements/:announcementId', authenticateToken, authorizeClassTeacher, async (req, res, next) => {
    try {
        const { title, content } = req.body;
        if (!title || !content) return res.status(400).json({ message: 'Title and content are required.' });

        const announcement = await Announcement.findByPk(req.params.announcementId);
        if (!announcement) return res.status(404).json({ message: 'Announcement not found.' });
        if (announcement.classId !== parseInt(req.params.classId)) {
            return res.status(403).json({ message: 'Announcement does not belong to this class.' });
        }

        announcement.title = title;
        announcement.content = content;
        await announcement.save();
        res.json(announcement);
    } catch (e) {
        next(e);
    }
});

router.delete('/:classId/announcements/:announcementId', authenticateToken, authorizeClassTeacher, async (req, res, next) => {
    try {
        const announcement = await Announcement.findByPk(req.params.announcementId);
        if (!announcement) return res.status(404).json({ message: 'Announcement not found.' });
        if (announcement.classId !== parseInt(req.params.classId)) {
            return res.status(403).json({ message: 'Announcement does not belong to this class.' });
        }
        await announcement.destroy();
        res.json({ message: 'Announcement deleted successfully.' });
    } catch (e) {
        next(e);
    }
});

// Mark announcements as read
router.post('/:classId/announcements/mark-as-read', authenticateToken, authorizeClassMember, async (req, res, next) => {
    try {
        const { classId } = req.params;
        const announcements = await Announcement.findAll({ where: { classId }, attributes: ['id'] });
        if (announcements.length > 0) {
            const viewsToCreate = announcements.map(ann => ({ userId: req.user.id, announcementId: ann.id }));
            await AnnouncementView.bulkCreate(viewsToCreate, { ignoreDuplicates: true });
        }
        res.status(200).json({ message: 'Announcements marked as read.' });
    } catch (e) {
        next(e);
    }
});


module.exports = router;