const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const Assignment = require('../models/Assignment');

// POST /api/notifications/start-class - Teacher starts a class, notify students
router.post('/start-class', authMiddleware, async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { subjectName, slot } = req.body;

    // Find all students assigned to this teacher for this subject
    const assignments = await Assignment.find({
      teacher: teacherId,
      subject: subjectName,
      status: 'active'
    }).populate('student', 'name email');

    const teacher = await User.findById(teacherId);

    // Get unique students
    const students = assignments.map(a => a.student);
    const notifiedCount = students.length;

    // In a real app, you would send actual notifications here
    // For now, we'll store notifications in the user documents
    for (const student of students) {
      if (student) {
        await User.findByIdAndUpdate(student._id, {
          $push: {
            notifications: {
              type: 'class-started',
              message: `${teacher.name} has started the ${subjectName} class (${slot.day} at ${slot.time})`,
              from: teacherId,
              subject: subjectName,
              slot: slot,
              createdAt: new Date(),
              read: false
            }
          }
        });
      }
    }

    res.json({
      success: true,
      message: 'Class started successfully',
      notifiedCount
    });
  } catch (error) {
    console.error('Start class error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/notifications/join-class - Student joins a class, notify teacher
router.post('/join-class', authMiddleware, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { teacherId, subjectName, slot } = req.body;

    const student = await User.findById(studentId);
    const teacher = await User.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Add notification to teacher
    await User.findByIdAndUpdate(teacherId, {
      $push: {
        notifications: {
          type: 'student-joined',
          message: `${student.name} has joined the ${subjectName} class (${slot.day} at ${slot.time})`,
          from: studentId,
          subject: subjectName,
          slot: slot,
          createdAt: new Date(),
          read: false
        }
      }
    });

    res.json({
      success: true,
      message: 'Joined class successfully'
    });
  } catch (error) {
    console.error('Join class error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/notifications - Get user's notifications
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const notifications = user.notifications || [];

    res.json({
      success: true,
      notifications: notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/notifications/mark-read - Mark notifications as read
router.put('/mark-read', authMiddleware, async (req, res) => {
  try {
    const { notificationIds } = req.body;

    await User.findByIdAndUpdate(req.user.id, {
      $set: {
        'notifications.$[elem].read': true
      }
    }, {
      arrayFilters: [{ 'elem._id': { $in: notificationIds } }]
    });

    res.json({ success: true, message: 'Notifications marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
