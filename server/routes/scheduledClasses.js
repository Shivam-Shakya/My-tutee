const router = require("express").Router();
const ScheduledClass = require("../models/ScheduledClass");
const Assignment = require("../models/Assignment");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

/* CREATE a new scheduled class (Teacher only) */
router.post("/create", auth, async (req, res) => {
  try {
    const teacherId = req.user.id;

    // Verify user is a teacher
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(403).json({ message: "Only teachers can schedule classes" });
    }

    const {
      subject,
      course,
      subSubject,
      classLevel,
      title,
      description,
      date,
      time,
      duration,
      platform,
      meetingLink,
      maxStudents,
      studentIds
    } = req.body;

    // Validate required fields
    if (!subject || !classLevel || !title || !date || !time) {
      return res.status(400).json({ message: "Subject, class level, title, date, and time are required" });
    }

    const assignmentMatches = await Assignment.find({
      teacher: teacherId,
      subject,
      classLevel,
      status: "active"
    }).select("student");

    const mappedStudentIds = assignmentMatches
      .map((item) => item.student?.toString())
      .filter(Boolean);

    const manualStudentIds = Array.isArray(studentIds)
      ? studentIds.map((id) => id?.toString()).filter(Boolean)
      : [];

    const enrolledStudents = [...new Set([...mappedStudentIds, ...manualStudentIds])];

    // Create new scheduled class
    const scheduledClass = new ScheduledClass({
      teacher: teacherId,
      subject,
      course: course || "",
      subSubject: subSubject || "",
      classLevel,
      title,
      description: description || "",
      date: new Date(date),
      time,
      duration: duration || 60,
      platform: platform || "internal",
      meetingLink: meetingLink || "",
      maxStudents: maxStudents || 50,
      enrolledStudents
    });

    await scheduledClass.save();

    // Populate teacher details
    const populatedClass = await ScheduledClass.findById(scheduledClass._id)
      .populate("teacher", "name email subjects");

    res.status(201).json({
      message: "Class scheduled successfully",
      scheduledClass: populatedClass
    });

      // Notify enrolled students about the new class (async, don't block response)
      setImmediate(async () => {
        try {
          if (enrolledStudents.length > 0) {
            await User.updateMany(
              { _id: { $in: enrolledStudents } },
              {
                $push: {
                  notifications: {
                    type: 'class-scheduled',
                    message: `${teacher.name} scheduled a new class: "${title}" on ${new Date(date).toLocaleDateString()}`,
                    from: teacherId,
                    subject,
                    classLevel,
                    createdAt: new Date(),
                    read: false
                  }
                }
              }
            );
          }
        } catch (notifyError) {
          console.error("Error notifying students about scheduled class:", notifyError);
        }
      });
  } catch (error) {
    console.error("Create scheduled class error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* GET all scheduled classes for a teacher */
router.get("/teacher-classes", auth, async (req, res) => {
  try {
    const teacherId = req.user.id;

    // Verify user is a teacher
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(403).json({ message: "Only teachers can access this endpoint" });
    }

    const classes = await ScheduledClass.find({
      teacher: teacherId,
      status: { $in: ["scheduled", "ongoing"] }
    })
      .populate("enrolledStudents", "name email")
      .sort({ date: 1, time: 1 });

    res.json({ classes });
  } catch (error) {
    console.error("Get teacher classes error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* GET all classes for a student (assigned teacher-subject-class mappings) */
router.get("/student-classes", auth, async (req, res) => {
  try {
    const studentId = req.user.id;

    // Verify user is a student
    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(403).json({ message: "Only students can access this endpoint" });
    }

    // Get student's class level from profile
    const studentClassLevel = (student.classLevel
      || student.profile?.currentClass?.replace(/th|st|nd|rd|Class /gi, '').trim()
      || "").replace(/^College$/i, "Graduation");

    if (!studentClassLevel) {
      return res.json({ classes: [], message: "Please set your class level in your profile" });
    }

    const activeAssignments = await Assignment.find({
      student: studentId,
      status: "active"
    }).select("teacher subject classLevel");

    const assignmentPairs = activeAssignments
      .filter((item) => item.classLevel === studentClassLevel)
      .map((item) => ({
        teacher: item.teacher,
        subject: item.subject,
        classLevel: item.classLevel
      }));

    const orConditions = [
      {
        enrolledStudents: studentId,
        status: { $in: ["scheduled", "ongoing"] },
        date: { $gte: new Date() }
      }
    ];

    assignmentPairs.forEach((pair) => {
      orConditions.push({
        teacher: pair.teacher,
        subject: pair.subject,
        classLevel: pair.classLevel,
        status: { $in: ["scheduled", "ongoing"] },
        date: { $gte: new Date() }
      });
    });

    const classes = await ScheduledClass.find({
      $or: orConditions
    })
      .populate("teacher", "name email subjects profile")
      .sort({ date: 1, time: 1 });

    // Keep enrolledStudents in sync for mapped classes
    for (const classItem of classes) {
      const isEnrolled = classItem.enrolledStudents
        .some((id) => id.toString() === studentId.toString());

      if (!isEnrolled) {
        classItem.enrolledStudents.push(studentId);
        await classItem.save();
      }
    }

    const mappedSubjects = [...new Set(classes.map((item) => item.subject).filter(Boolean))];
    res.json({ classes, paidSubjects: mappedSubjects });
  } catch (error) {
    console.error("Get student classes error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* UPDATE a scheduled class (Teacher only) */
router.put("/:id", auth, async (req, res) => {
  try {
    const classId = req.params.id;
    const teacherId = req.user.id;

    const scheduledClass = await ScheduledClass.findById(classId);
    if (!scheduledClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Verify teacher owns this class
    if (scheduledClass.teacher.toString() !== teacherId) {
      return res.status(403).json({ message: "Not authorized to update this class" });
    }

    const {
      title,
      description,
      date,
      time,
      duration,
      platform,
      meetingLink,
      status,
      maxStudents,
      recordingUrl
    } = req.body;

    // Update fields
    if (title) scheduledClass.title = title;
    if (description !== undefined) scheduledClass.description = description;
    if (date) scheduledClass.date = new Date(date);
    if (time) scheduledClass.time = time;
    if (duration) scheduledClass.duration = duration;
    if (platform) scheduledClass.platform = platform;
    if (meetingLink !== undefined) scheduledClass.meetingLink = meetingLink;
    if (status) scheduledClass.status = status;
    if (maxStudents) scheduledClass.maxStudents = maxStudents;
    if (recordingUrl) scheduledClass.recordingUrl = recordingUrl;

    await scheduledClass.save();

    const updatedClass = await ScheduledClass.findById(classId)
      .populate("teacher", "name email subjects")
      .populate("enrolledStudents", "name email");

    res.json({
      message: "Class updated successfully",
      scheduledClass: updatedClass
    });
  } catch (error) {
    console.error("Update scheduled class error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* DELETE (cancel) a scheduled class */
router.delete("/:id", auth, async (req, res) => {
  try {
    const classId = req.params.id;
    const teacherId = req.user.id;

    const scheduledClass = await ScheduledClass.findById(classId);
    if (!scheduledClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Verify teacher owns this class
    if (scheduledClass.teacher.toString() !== teacherId) {
      return res.status(403).json({ message: "Not authorized to cancel this class" });
    }

    // Mark as cancelled instead of deleting
    scheduledClass.status = "cancelled";
    await scheduledClass.save();

    res.json({ message: "Class cancelled successfully" });
  } catch (error) {
    console.error("Delete scheduled class error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* GET upcoming classes count for dashboard */
router.get("/upcoming-count", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    let count = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (user.role === "teacher") {
      count = await ScheduledClass.countDocuments({
        teacher: userId,
        status: "scheduled",
        date: { $gte: today }
      });
    } else if (user.role === "student") {
      const activeAssignments = await Assignment.find({
        student: userId,
        status: "active"
      }).select("teacher subject classLevel");

      const orConditions = [
        {
          enrolledStudents: userId,
          status: "scheduled",
          date: { $gte: today }
        }
      ];

      activeAssignments.forEach((assignment) => {
        orConditions.push({
          teacher: assignment.teacher,
          subject: assignment.subject,
          classLevel: assignment.classLevel,
          status: "scheduled",
          date: { $gte: today }
        });
      });

      count = await ScheduledClass.countDocuments({ $or: orConditions });
    }

    res.json({ count });
  } catch (error) {
    console.error("Get upcoming count error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
