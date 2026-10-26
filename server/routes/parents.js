const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const User = require("../models/User");
const Assignment = require("../models/Assignment");
const Payment = require("../models/Payment");
const ScheduledClass = require("../models/ScheduledClass");
const Test = require("../models/Test");
const Doubt = require("../models/Doubt");
const Lecture = require("../models/Lecture");
const TestSubmission = require("../models/TestSubmission");

/* ───── LINK STUDENT (Manual linking from profile) ───── */
router.post("/link-student", auth, async (req, res) => {
  try {
    const { studentEmail } = req.body;
    const parentId = req.user.id;

    // Check if requesting user is a parent
    const parent = await User.findById(parentId);
    if (!parent || parent.role !== "parent") {
      return res.status(403).json({ message: "Only parents can link students" });
    }

    if (!studentEmail) {
      return res.status(400).json({ message: "Student email is required" });
    }

    // Find student by email
    const student = await User.findOne({ email: studentEmail, role: "student" });
    if (!student) {
      return res.status(400).json({ message: "Student not found. Please check the email ID." });
    }

    // Update parent with linked student
    parent.studentEmail = studentEmail;
    parent.linkedStudentId = student._id;
    parent.studentLinkingStatus = "linked";
    parent.studentLinkingError = "";

    await parent.save();

    res.json({
      message: "Student linked successfully",
      parent: {
        id: parent._id,
        name: parent.name,
        studentEmail: parent.studentEmail,
        linkedStudentId: parent.linkedStudentId,
        studentLinkingStatus: parent.studentLinkingStatus
      }
    });
  } catch (error) {
    console.error("Link student error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ───── GET LINKED STUDENT DETAILS ───── */
router.get("/student-details", auth, async (req, res) => {
  try {
    const parentId = req.user.id;

    // Get parent
    const parent = await User.findById(parentId);
    if (!parent || parent.role !== "parent") {
      return res.status(403).json({ message: "Only parents can access this" });
    }

    if (!parent.linkedStudentId) {
      return res.status(400).json({ message: "No student linked" });
    }

    // Get linked student
    const student = await User.findById(parent.linkedStudentId).select("-password");
    if (!student) {
      return res.status(404).json({ message: "Linked student not found" });
    }

    res.json(student);
  } catch (error) {
    console.error("Get student details error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ───── UNLINK STUDENT ───── */
router.post("/unlink-student", auth, async (req, res) => {
  try {
    const parentId = req.user.id;

    const parent = await User.findById(parentId);
    if (!parent || parent.role !== "parent") {
      return res.status(403).json({ message: "Only parents can unlink students" });
    }

    parent.linkedStudentId = null;
    parent.studentEmail = "";
    parent.studentLinkingStatus = "pending";
    parent.studentLinkingError = "";

    await parent.save();

    res.json({ message: "Student unlinked successfully" });
  } catch (error) {
    console.error("Unlink student error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ───── GET STUDENT DATA BY EMAIL (for Parent Dashboard) ───── */
router.get("/student-data-by-email/:email", auth, async (req, res) => {
  try {
    const parentId = req.user.id;
    const studentEmail = String(req.params.email || "").trim().toLowerCase();
    const escapedStudentEmail = studentEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Verify parent role
    const parent = await User.findById(parentId);
    if (!parent || parent.role !== "parent") {
      return res.status(403).json({ message: "Only parents can access this" });
    }

    // Find student by email
    const student = await User.findOne({ email: new RegExp(`^${escapedStudentEmail}$`, "i"), role: "student" }).select("-password");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const studentId = student._id;
    const now = new Date();

    // Fetch active completed payments to define enrolled subject-teacher mapping.
    const payments = await Payment.find({
      student: studentId,
      status: "completed",
      validUntil: { $gte: now }
    })
      .select("student teacher subject classLevel validUntil status")
      .sort({ createdAt: -1 });

    const normalizedPairs = payments
      .map((payment) => ({
        teacherId: payment.teacher?.toString(),
        subject: String(payment.subject || "").trim(),
        classLevel: payment.classLevel
      }))
      .filter((item) => item.teacherId && item.subject);

    const uniquePairKeys = new Set(normalizedPairs.map((item) => `${item.teacherId}::${item.subject}`));
    const uniqueSubjects = [...new Set(normalizedPairs.map((item) => item.subject))];
    const uniqueTeacherIds = [...new Set(normalizedPairs.map((item) => item.teacherId))];

    // Fetch assignments strictly belonging to the student for enrolled subjects.
    const assignmentQuery = { student: studentId };
    if (uniqueSubjects.length > 0) {
      assignmentQuery.subject = { $in: uniqueSubjects };
    }
    if (uniqueTeacherIds.length > 0) {
      assignmentQuery.teacher = { $in: uniqueTeacherIds };
    }

    const assignments = await Assignment.find(assignmentQuery)
      .populate("teacher", "name email")
      .limit(20)
      .sort({ createdAt: -1 });

    // Build fallback enrolled pairs from active assignments too.
    assignments.forEach((assignment) => {
      const teacherId = assignment.teacher?._id?.toString?.() || assignment.teacher?.toString?.();
      const subject = String(assignment.subject || "").trim();
      if (teacherId && subject) {
        uniquePairKeys.add(`${teacherId}::${subject}`);
      }
    });

    const enrolledPairs = [...uniquePairKeys].map((pairKey) => {
      const [teacherId, subject] = pairKey.split("::");
      return { teacherId, subject };
    });

    const enrolledSubjects = [...new Set(enrolledPairs.map((item) => item.subject))];
    const enrolledTeacherIds = [...new Set(enrolledPairs.map((item) => item.teacherId))];

    // Fetch student's scheduled classes mapped to enrolled subjects/teachers.
    const scheduledClassQuery = {
      enrolledStudents: studentId
    };
    if (enrolledSubjects.length > 0) {
      scheduledClassQuery.subject = { $in: enrolledSubjects };
    }
    if (enrolledTeacherIds.length > 0) {
      scheduledClassQuery.teacher = { $in: enrolledTeacherIds };
    }

    const scheduledClasses = await ScheduledClass.find(scheduledClassQuery)
      .populate("teacher", "name email")
      .sort({ date: -1 });

    // Fetch student's test submissions.
    const testSubmissions = await TestSubmission.find({
      student: studentId
    })
      .populate("test", "title subject classLevel")
      .limit(20)
      .sort({ createdAt: -1 });

    // Fetch tests only for enrolled teacher-subject combinations.
    const testOrFilters = enrolledPairs.map((pair) => ({ teacher: pair.teacherId, subject: pair.subject }));
    const tests = testOrFilters.length
      ? await Test.find({ $or: testOrFilters }).populate("teacher", "name email").limit(20).sort({ createdAt: -1 })
      : [];

    // Fetch student's doubts for enrolled subjects.
    const doubtQuery = { student: studentId };
    if (enrolledSubjects.length > 0) {
      doubtQuery.subject = { $in: enrolledSubjects };
    }

    const doubts = await Doubt.find(doubtQuery)
      .populate("teacher", "name email")
      .limit(20)
      .sort({ createdAt: -1 });

    // Fetch lectures for enrolled teacher-subject combinations.
    const lectureOrFilters = enrolledPairs.map((pair) => ({ teacher: pair.teacherId, subject: pair.subject }));
    const lectures = lectureOrFilters.length
      ? await Lecture.find({ $or: lectureOrFilters }).populate("teacher", "name email").limit(20).sort({ createdAt: -1 })
      : [];

    const normalizeSubject = (value) => {
      const normalized = String(value || "").trim();
      return normalized || "No Subject Available";
    };

    const normalizedClasses = scheduledClasses.map((item) => ({
      ...item.toObject(),
      subject: normalizeSubject(item.subject)
    }));

    const normalizedAssignments = assignments.map((item) => ({
      ...item.toObject(),
      subject: normalizeSubject(item.subject)
    }));

    const normalizedTests = tests.map((item) => ({
      ...item.toObject(),
      subject: normalizeSubject(item.subject)
    }));

    const normalizedDoubts = doubts.map((item) => ({
      ...item.toObject(),
      subject: normalizeSubject(item.subject)
    }));

    const normalizedLectures = lectures.map((item) => ({
      ...item.toObject(),
      subject: normalizeSubject(item.subject)
    }));

    const normalizedSubmissions = testSubmissions.map((item) => ({
      ...item.toObject(),
      subject: normalizeSubject(item.test?.subject)
    }));

    // Calculate student progress data
    const testCount = normalizedSubmissions.length;
    const passedTests = normalizedSubmissions.filter((submission) => {
      const total = Number(submission.totalQuestions || 0);
      const correct = Number(submission.correctAnswers || 0);
      if (!total) return false;
      return ((correct / total) * 100) >= 50;
    }).length;

    const assignmentCount = normalizedAssignments.length;
    const submittedAssignments = normalizedAssignments.filter((assignment) => assignment.status === "completed").length;

    console.log("[Parent student-data-by-email]", {
      parentId,
      studentId: studentId.toString(),
      enrolledSubjects,
      enrolledTeachers: enrolledTeacherIds.length,
      counts: {
        classes: normalizedClasses.length,
        assignments: normalizedAssignments.length,
        tests: normalizedTests.length,
        submissions: normalizedSubmissions.length,
        doubts: normalizedDoubts.length,
        lectures: normalizedLectures.length
      }
    });

    res.json({
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        classLevel: student.classLevel,
        profile: student.profile
      },
      courses: enrolledSubjects,
      scheduledClasses: normalizedClasses,
      assignments: normalizedAssignments,
      tests: normalizedTests,
      testSubmissions: normalizedSubmissions,
      doubts: normalizedDoubts,
      lectures: normalizedLectures,
      stats: {
        totalClasses: normalizedClasses.length,
        totalAssignments: assignmentCount,
        submittedAssignments: submittedAssignments,
        totalTests: testCount,
        passedTests: passedTests,
        unresolvedDoubts: normalizedDoubts.filter((doubt) => doubt.status !== "solved").length
      }
    });
  } catch (error) {
    console.error("Get student data by email error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
