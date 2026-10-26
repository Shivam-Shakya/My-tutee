const router = require("express").Router();
const mongoose = require("mongoose");
const Assignment = require("../models/Assignment");
const TeacherAssignment = require("../models/TeacherAssignment");
const TestSubmission = require("../models/TestSubmission");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

/* CREATE assignment after successful payment */
router.post("/create", auth, async (req, res) => {
  try {
    const studentId = req.user.id;
    const {
      teacherId,
      subject,
      classLevel,
      amountPaid,
      paymentMethod,
      paymentId,
      timetable,
      pricePerHour,
      pricePerMonth
    } = req.body;

    // Validate required fields
    if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({ message: "Invalid student or teacher ID" });
    }

    const studentRecord = await User.findById(studentId).select("name role classLevel profile");
    if (!studentRecord || studentRecord.role !== "student") {
      return res.status(403).json({ message: "Only students can create assignments" });
    }

    if (!teacherId || !subject || amountPaid === undefined || amountPaid === null || Number.isNaN(Number(amountPaid))) {
      return res.status(400).json({ message: "Teacher, subject, and amount are required" });
    }

    // Verify teacher exists and get their schedule
    const teacher = await User.findOne({ _id: teacherId, role: "teacher" });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const student = studentRecord;
    const resolvedClassLevel = (classLevel
      || student?.classLevel
      || student?.profile?.currentClass?.replace(/th|st|nd|rd|Class /gi, '').trim()
      || "").replace(/^College$/i, "Graduation");

    if (!resolvedClassLevel) {
      return res.status(400).json({ message: "Class level is required" });
    }

    // Get teacher's saved schedule for this subject
    const teacherSubjectDetails = teacher.profile?.subjectDetails?.[subject] || {};
    const finalTimetable = timetable || teacherSubjectDetails.timetable || [];
    const finalPricePerHour = pricePerHour || teacherSubjectDetails.pricePerHour || "";
    const finalPricePerMonth = pricePerMonth || teacherSubjectDetails.pricePerMonth || "";

    // Check if assignment already exists
    const existingAssignment = await Assignment.findOne({
      student: studentId,
      teacher: teacherId,
      subject: subject,
      classLevel: resolvedClassLevel
    });

    if (existingAssignment) {
      return res.status(400).json({ message: "You are already assigned to this teacher for this subject" });
    }

    // Create new assignment with teacher's schedule
    const assignment = new Assignment({
      student: studentId,
      teacher: teacherId,
      subject,
      classLevel: resolvedClassLevel,
      amountPaid,
      paymentMethod: paymentMethod || "card",
      paymentId: paymentId || `PAY_${Date.now()}`,
      paymentStatus: "completed",
      timetable: finalTimetable,
      pricePerHour: finalPricePerHour,
      pricePerMonth: finalPricePerMonth,
      status: "active"
    });

    await assignment.save();

    teacher.notifications = teacher.notifications || [];
    teacher.notifications.unshift({
      type: "student-assigned",
      message: `${student.name || "A student"} assigned you for ${subject}`,
      from: student._id,
      subject,
      createdAt: new Date(),
      read: false
    });
    await teacher.save();

    // Populate student and teacher details for response
    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate("student", "name email phone")
      .populate("teacher", "name email subjects profile");

    res.status(201).json({
      message: "Assignment created successfully",
      assignment: populatedAssignment
    });
  } catch (error) {
    console.error("Create assignment error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Assignment already exists" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

/* GET assigned students for a teacher */
router.get("/my-students", auth, async (req, res) => {
  try {
    const teacherId = req.user.id;

    // Verify user is a teacher
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(403).json({ message: "Only teachers can access this endpoint" });
    }

    const assignments = await Assignment.find({
      teacher: teacherId,
      status: "active"
    })
      .populate("student", "name email phone profile")
      .sort({ createdAt: -1 });

    // Transform data for dashboard
    const students = assignments
      .filter((assignment) => {
        const studentId = assignment.student?._id?.toString();
        return !!studentId;
      })
      .map(assignment => ({
        id: assignment._id,
        studentId: assignment.student._id,
        name: assignment.student.name,
        email: assignment.student.email,
        phone: assignment.student.phone,
        subject: assignment.subject,
        classLevel: assignment.classLevel,
        status: assignment.status,
        progress: assignment.progress,
        timetable: assignment.timetable,
        pricePerHour: assignment.pricePerHour,
        amountPaid: assignment.amountPaid,
        enrolledAt: assignment.createdAt,
        lastActive: assignment.lastClassDate ? getRelativeTime(assignment.lastClassDate) : "New"
      }));

    res.json({ students });
  } catch (error) {
    console.error("Get my students error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* GET assigned teachers for a student */
router.get("/my-teachers", auth, async (req, res) => {
  try {
    const studentId = req.user.id;

    // Verify user is a student
    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(403).json({ message: "Only students can access this endpoint" });
    }

    const assignments = await Assignment.find({
      student: studentId,
      status: { $in: ["active", "inactive"] }
    })
      .populate("teacher", "name email subjects profile")
      .sort({ createdAt: -1 });

    // Transform data for dashboard
    const teachers = assignments.map(assignment => {
      // Get teacher's current schedule for this subject as fallback
      const teacherSubjectDetails = assignment.teacher?.profile?.subjectDetails?.[assignment.subject] || {};
      const timetable = (assignment.timetable && assignment.timetable.length > 0)
        ? assignment.timetable
        : teacherSubjectDetails.timetable || [];

      return {
        id: assignment._id,
        _id: assignment.teacher._id,
        name: assignment.teacher.name,
        email: assignment.teacher.email,
        subjects: assignment.teacher.subjects,
        profile: assignment.teacher.profile,
        assignedSubject: assignment.subject,
        status: assignment.status,
        progress: assignment.progress,
        timetable: timetable,
        pricePerHour: assignment.pricePerHour || teacherSubjectDetails.pricePerHour || "",
        pricePerMonth: assignment.pricePerMonth || teacherSubjectDetails.pricePerMonth || "",
        assignedAt: assignment.createdAt
      };
    });

    res.json({ teachers });
  } catch (error) {
    console.error("Get my teachers error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* UPDATE assignment status/progress */
router.put("/:id", auth, async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const userId = req.user.id;
    const { status, progress, lastClassDate } = req.body;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Verify user is either the teacher or student in this assignment
    if (assignment.teacher.toString() !== userId && assignment.student.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to update this assignment" });
    }

    // Update fields
    if (status) assignment.status = status;
    if (progress !== undefined) assignment.progress = progress;
    if (lastClassDate) assignment.lastClassDate = lastClassDate;

    await assignment.save();

    res.json({ message: "Assignment updated", assignment });
  } catch (error) {
    console.error("Update assignment error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* GET recent submissions for teacher dashboard */
router.get("/teacher-recent-submissions", auth, async (req, res) => {
  try {
    const teacherId = req.user.id;

    const teacher = await User.findById(teacherId).select("role");
    if (!teacher || teacher.role !== "teacher") {
      return res.status(403).json({ message: "Only teachers can access this endpoint" });
    }

    const activeAssignments = await Assignment.find({
      teacher: teacherId,
      status: "active"
    }).select("student subject classLevel");

    const activeEnrollmentMappings = activeAssignments;

    if (activeEnrollmentMappings.length === 0) {
      return res.json({ submissions: [] });
    }

    const assignedStudentIds = [
      ...new Set(activeEnrollmentMappings.map((assignment) => assignment.student.toString()))
    ];
    const assignedStudentIdSet = new Set(assignedStudentIds);

    const allowedSubjectClassPairs = new Set(
      activeEnrollmentMappings.map((assignment) => `${assignment.subject}::${assignment.classLevel}`)
    );

    const assignmentDocs = await TeacherAssignment.find({
      teacher: teacherId,
      "submissions.0": { $exists: true }
    })
      .select("title subject classLevel submissions")
      .populate("submissions.student", "name");

    const assignmentSubmissions = assignmentDocs.flatMap((assignmentDoc) => {
      const pairKey = `${assignmentDoc.subject}::${assignmentDoc.classLevel}`;
      if (!allowedSubjectClassPairs.has(pairKey)) return [];

      return (assignmentDoc.submissions || [])
        .filter((submission) => {
          const studentRef = submission.student;
          const studentId = (studentRef?._id || studentRef)?.toString();
          return studentId && assignedStudentIdSet.has(studentId);
        })
        .map((submission) => {
          const studentRef = submission.student;
          const studentId = (studentRef?._id || studentRef)?.toString() || "student";
          const studentName = studentRef?.name || "Student";
          const safeStatus = submission.status || "submitted";

          return {
            id: `assignment-${assignmentDoc._id}-${submission._id || `${studentId}-${new Date(submission.submittedAt || Date.now()).getTime()}`}`,
            studentName,
            course: `${assignmentDoc.subject} - ${assignmentDoc.classLevel}`,
            subject: assignmentDoc.subject,
            classLevel: assignmentDoc.classLevel,
            itemName: assignmentDoc.title,
            itemType: "assignment",
            submittedAt: submission.submittedAt,
            status: safeStatus
          };
        });
    });

    const testSubmissionsDocs = await TestSubmission.find({
      teacher: teacherId,
      student: { $in: assignedStudentIds }
    })
      .populate("student", "name")
      .populate("test", "title subject classLevel")
      .sort({ submittedAt: -1 })
      .limit(200);

    const testSubmissions = testSubmissionsDocs
      .filter((submission) => {
        if (!submission.test || !submission.student) return false;
        const pairKey = `${submission.test.subject}::${submission.test.classLevel}`;
        return allowedSubjectClassPairs.has(pairKey);
      })
      .map((submission) => ({
        id: `test-${submission._id}`,
        studentName: submission.student?.name || "Student",
        course: `${submission.test?.subject || "Subject"} - ${submission.test?.classLevel || "Class"}`,
        subject: submission.test?.subject || "",
        classLevel: submission.test?.classLevel || "",
        itemName: submission.test?.title || "Test",
        itemType: "test",
        submittedAt: submission.submittedAt,
        status: "submitted"
      }));

    const combinedSubmissions = [...assignmentSubmissions, ...testSubmissions]
      .sort((a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime())
      .slice(0, 20);

    res.json({ submissions: combinedSubmissions });
  } catch (error) {
    console.error("Get teacher recent submissions error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* GET student performance analytics for teacher */
router.get("/analytics/student-performance", auth, async (req, res) => {
  try {
    const teacherId = req.user.id;

    const teacher = await User.findById(teacherId).select("role");
    if (!teacher || teacher.role !== "teacher") {
      return res.status(403).json({ message: "Only teachers can access this endpoint" });
    }

    const activeAssignments = await Assignment.find({
      teacher: teacherId,
      status: "active"
    }).select("student subject classLevel");

    const assignedStudentIds = [
      ...new Set(
        activeAssignments.map((assignment) => assignment.student.toString())
      )
    ];

    if (assignedStudentIds.length === 0) {
      return res.json({ performance: [], averageScore: 0, totalTests: 0 });
    }

    // Get test submissions from assigned students
    const submissions = await TestSubmission.find({
      teacher: teacherId,
      student: { $in: assignedStudentIds }
    })
      .populate("student", "name")
      .populate("test", "title subject")
      .lean();

    if (submissions.length === 0) {
      return res.json({ performance: [], averageScore: 0, totalTests: 0 });
    }

    // Calculate performance metrics
    let totalScore = 0;
    let totalQuestions = 0;
    const passCount = submissions.filter((s) => {
      const percentage = s.totalQuestions > 0 ? (s.correctAnswers / s.totalQuestions) * 100 : 0;
      return percentage >= 50; // Pass if >= 50%
    }).length;

    submissions.forEach((submission) => {
      totalScore += submission.correctAnswers || 0;
      totalQuestions += submission.totalQuestions || 0;
    });

    const averagePercentage = totalQuestions > 0 ? (totalScore / totalQuestions) * 100 : 0;
    const failCount = submissions.length - passCount;
    const passPercentage = submissions.length > 0 ? (passCount / submissions.length) * 100 : 0;

    // Group by week for chart data
    const weeklySums = {};
    const weeklySubmissions = {};

    submissions.forEach((submission) => {
      const date = new Date(submission.submittedAt);
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
      const weekKey = weekStart.toLocaleDateString();

      if (!weeklySums[weekKey]) {
        weeklySums[weekKey] = 0;
        weeklySubmissions[weekKey] = 0;
      }

      weeklySums[weekKey] += submission.totalQuestions > 0
        ? (submission.correctAnswers / submission.totalQuestions) * 100
        : 0;
      weeklySubmissions[weekKey] += 1;
    });

    const performanceData = Object.entries(weeklySums)
      .map(([week, sum], index) => ({
        name: `Week ${index + 1}`,
        avgScore: Math.round(sum / (weeklySubmissions[week] || 1))
      }))
      .slice(-6);

    res.json({
      performance: performanceData.length > 0 ? performanceData : [
        { name: 'No data', avgScore: 0 }
      ],
      averageScore: Math.round(averagePercentage),
      totalTests: submissions.length,
      passFailRatio: {
        passed: passCount,
        failed: failCount,
        passPercentage: Math.round(passPercentage)
      }
    });
  } catch (error) {
    console.error("Get student performance analytics error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* GET course enrollment analytics for teacher */
router.get("/analytics/course-enrollment", auth, async (req, res) => {
  try {
    const teacherId = req.user.id;

    const teacher = await User.findById(teacherId).select("role");
    if (!teacher || teacher.role !== "teacher") {
      return res.status(403).json({ message: "Only teachers can access this endpoint" });
    }

    const activeAssignments = await Assignment.find({
      teacher: teacherId,
      status: "active"
    }).select("student subject classLevel");

    // Group by subject and count unique students
    const enrollmentMap = new Map();
    const uniqueStudents = new Set();

    activeAssignments.forEach((assignment) => {
      const courseKey = `${assignment.subject} - ${assignment.classLevel}`;
      if (!enrollmentMap.has(courseKey)) {
        enrollmentMap.set(courseKey, new Set());
      }
      enrollmentMap.get(courseKey).add(assignment.student.toString());
      uniqueStudents.add(assignment.student.toString());
    });

    const enrollmentData = Array.from(enrollmentMap.entries())
      .map(([course, students]) => ({
        name: course,
        students: students.size
      }))
      .sort((a, b) => b.students - a.students);

    res.json({
      enrollment: enrollmentData.length > 0 ? enrollmentData : [],
      totalStudents: uniqueStudents.size
    });
  } catch (error) {
    console.error("Get course enrollment analytics error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* GET assignment status analytics for teacher */
router.get("/analytics/assignment-status", auth, async (req, res) => {
  try {
    const teacherId = req.user.id;

    const teacher = await User.findById(teacherId).select("role");
    if (!teacher || teacher.role !== "teacher") {
      return res.status(403).json({ message: "Only teachers can access this endpoint" });
    }

    const activeAssignments = await Assignment.find({
      teacher: teacherId,
      status: "active"
    }).select("student subject classLevel");

    const activeEnrollmentMappings = activeAssignments;

    if (activeEnrollmentMappings.length === 0) {
      return res.json({
        status: { submitted: 0, pending: 0 },
        total: 0
      });
    }

    const assignedStudentIds = [
      ...new Set(activeEnrollmentMappings.map((assignment) => assignment.student.toString()))
    ];
    const assignedStudentIdSet = new Set(assignedStudentIds);

    const allowedSubjectClassPairs = new Set(
      activeEnrollmentMappings.map((assignment) => `${assignment.subject}::${assignment.classLevel}`)
    );

    // Get teacher assignments with submissions
    const assignments = await TeacherAssignment.find({
      teacher: teacherId
    })
      .select("subject classLevel submissions")
      .lean();

    let totalAssignments = 0;
    let submittedCount = 0;
    let pendingCount = 0;

    assignments.forEach((assignment) => {
      const pairKey = `${assignment.subject}::${assignment.classLevel}`;
      if (!allowedSubjectClassPairs.has(pairKey)) return;

      const submissions = assignment.submissions || [];
      submissions.forEach((submission) => {
        const studentRef = submission.student;
        const studentId = (studentRef?._id || studentRef)?.toString();

        if (studentId && assignedStudentIdSet.has(studentId)) {
          totalAssignments += 1;
          const status = (submission.status || "").toLowerCase();
          if (status === "submitted" || status === "graded") {
            submittedCount += 1;
          } else {
            pendingCount += 1;
          }
        }
      });
    });

    if (totalAssignments === 0) {
      return res.json({
        status: { submitted: 0, pending: 0 },
        total: 0,
        submittedPercentage: 0,
        pendingPercentage: 0
      });
    }

    res.json({
      status: {
        submitted: submittedCount,
        pending: pendingCount
      },
      total: totalAssignments,
      submittedPercentage: Math.round((submittedCount / totalAssignments) * 100),
      pendingPercentage: Math.round((pendingCount / totalAssignments) * 100)
    });
  } catch (error) {
    console.error("Get assignment status analytics error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* GET dashboard stats for teacher */
router.get("/teacher-stats", auth, async (req, res) => {
  try {
    const teacherId = req.user.id;

    const activeStudents = await Assignment.countDocuments({
      teacher: teacherId,
      status: "active"
    });

    const totalEarnings = await Assignment.aggregate([
      { $match: { teacher: new mongoose.Types.ObjectId(teacherId), paymentStatus: "completed" } },
      { $group: { _id: null, total: { $sum: "$amountPaid" } } }
    ]);

    const subjects = await Assignment.distinct("subject", { teacher: teacherId });

    res.json({
      totalStudents: activeStudents,
      totalSubjects: subjects.length,
      totalEarnings: totalEarnings[0]?.total || 0,
      subjects
    });
  } catch (error) {
    console.error("Get teacher stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* GET dashboard stats for student */
router.get("/student-stats", auth, async (req, res) => {
  try {
    const studentId = req.user.id;

    const activeTeachers = await Assignment.countDocuments({
      student: studentId,
      status: "active"
    });

    const subjects = await Assignment.distinct("subject", { student: studentId });

    const avgProgress = await Assignment.aggregate([
      { $match: { student: new mongoose.Types.ObjectId(studentId), status: "active" } },
      { $group: { _id: null, avg: { $avg: "$progress" } } }
    ]);

    res.json({
      totalTeachers: activeTeachers,
      totalSubjects: subjects.length,
      avgProgress: Math.round(avgProgress[0]?.avg || 0),
      subjects
    });
  } catch (error) {
    console.error("Get student stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Helper function to get relative time
function getRelativeTime(date) {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} mins ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return new Date(date).toLocaleDateString();
}

module.exports = router;
