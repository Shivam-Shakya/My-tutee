const router = require("express").Router();
const Message = require("../models/Message");
const Assignment = require("../models/Assignment");
const Payment = require("../models/Payment");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

function normalizeClassLevel(value = "") {
  const normalized = value.replace(/th|st|nd|rd|Class /gi, "").trim();
  return normalized === "College" ? "Graduation" : normalized;
}

async function isAssignedAndPaid({ studentId, teacherId, subject, classLevel }) {
  const now = new Date();

  const [payment, assignment] = await Promise.all([
    Payment.findOne({
      student: studentId,
      teacher: teacherId,
      subject,
      classLevel,
      status: "completed",
      validUntil: { $gte: now }
    }),
    Assignment.findOne({
      student: studentId,
      teacher: teacherId,
      subject,
      classLevel,
      status: "active"
    })
  ]);

  return Boolean(payment && assignment);
}

async function getEligiblePairsForStudent(studentId) {
  const now = new Date();
  const [payments, assignments] = await Promise.all([
    Payment.find({
      student: studentId,
      status: "completed",
      validUntil: { $gte: now }
    }).select("student teacher subject classLevel"),
    Assignment.find({
      student: studentId,
      status: "active"
    }).select("student teacher subject classLevel createdAt")
  ]);

  const paymentSet = new Set(
    payments.map((p) => `${p.student.toString()}::${p.teacher.toString()}::${p.subject}::${p.classLevel}`)
  );

  return assignments
    .filter((a) => paymentSet.has(`${a.student.toString()}::${a.teacher.toString()}::${a.subject}::${a.classLevel}`))
    .map((a) => ({
      student: a.student.toString(),
      teacher: a.teacher.toString(),
      subject: a.subject,
      classLevel: a.classLevel,
      enrolledAt: a.createdAt
    }));
}

async function getEligiblePairsForTeacher(teacherId) {
  const now = new Date();
  const [payments, assignments] = await Promise.all([
    Payment.find({
      teacher: teacherId,
      status: "completed",
      validUntil: { $gte: now }
    }).select("student teacher subject classLevel"),
    Assignment.find({
      teacher: teacherId,
      status: "active"
    }).select("student teacher subject classLevel createdAt")
  ]);

  const paymentSet = new Set(
    payments.map((p) => `${p.student.toString()}::${p.teacher.toString()}::${p.subject}::${p.classLevel}`)
  );

  return assignments
    .filter((a) => paymentSet.has(`${a.student.toString()}::${a.teacher.toString()}::${a.subject}::${a.classLevel}`))
    .map((a) => ({
      student: a.student.toString(),
      teacher: a.teacher.toString(),
      subject: a.subject,
      classLevel: a.classLevel,
      enrolledAt: a.createdAt
    }));
}

/* STUDENT: send message to assigned teacher */
router.post("/student/send", auth, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { teacherId, subject, classLevel, content } = req.body;

    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(403).json({ message: "Only students can send messages from this endpoint" });
    }

    if (!teacherId || !subject || !classLevel || !content?.trim()) {
      return res.status(400).json({ message: "Teacher, subject, class level, and message content are required" });
    }

    const teacher = await User.findOne({ _id: teacherId, role: "teacher" });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const normalizedClassLevel = normalizeClassLevel(classLevel);
    const allowed = await isAssignedAndPaid({
      studentId,
      teacherId,
      subject,
      classLevel: normalizedClassLevel
    });

    if (!allowed) {
      return res.status(403).json({ message: "You can only message teachers assigned to your paid subject and class level" });
    }

    const message = await Message.create({
      teacher: teacherId,
      student: studentId,
      subject,
      classLevel: normalizedClassLevel,
      sender: studentId,
      senderRole: "student",
      content: content.trim()
    });

    const populated = await Message.findById(message._id)
      .populate("student", "name email")
      .populate("teacher", "name email")
      .populate("sender", "name role");

    res.status(201).json({ message: "Message sent", data: populated });
  } catch (error) {
    console.error("Student send message error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* TEACHER: reply to assigned student */
router.post("/teacher/reply", auth, async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { studentId, subject, classLevel, content } = req.body;

    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(403).json({ message: "Only teachers can reply from this endpoint" });
    }

    if (!studentId || !subject || !classLevel || !content?.trim()) {
      return res.status(400).json({ message: "Student, subject, class level, and message content are required" });
    }

    const student = await User.findOne({ _id: studentId, role: "student" });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const normalizedClassLevel = normalizeClassLevel(classLevel);
    const allowed = await isAssignedAndPaid({
      studentId,
      teacherId,
      subject,
      classLevel: normalizedClassLevel
    });

    if (!allowed) {
      return res.status(403).json({ message: "You can only reply to students assigned to you for paid subject and class level" });
    }

    const message = await Message.create({
      teacher: teacherId,
      student: studentId,
      subject,
      classLevel: normalizedClassLevel,
      sender: teacherId,
      senderRole: "teacher",
      content: content.trim()
    });

    const populated = await Message.findById(message._id)
      .populate("student", "name email")
      .populate("teacher", "name email")
      .populate("sender", "name role");

    res.status(201).json({ message: "Reply sent", data: populated });
  } catch (error) {
    console.error("Teacher reply message error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* STUDENT: list eligible conversation threads */
router.get("/student/threads", auth, async (req, res) => {
  try {
    const studentId = req.user.id;

    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(403).json({ message: "Only students can access this endpoint" });
    }

    const pairs = await getEligiblePairsForStudent(studentId);
    if (pairs.length === 0) {
      return res.json({ threads: [] });
    }

    const teacherIds = [...new Set(pairs.map((pair) => pair.teacher))];
    const teachers = await User.find({ _id: { $in: teacherIds }, role: "teacher" }).select("name email");
    const teacherMap = new Map(teachers.map((teacher) => [teacher._id.toString(), teacher]));

    const threads = await Promise.all(
      pairs.map(async (pair) => {
        const latest = await Message.findOne({
          student: studentId,
          teacher: pair.teacher,
          subject: pair.subject,
          classLevel: pair.classLevel
        })
          .sort({ createdAt: -1 })
          .select("content createdAt senderRole");

        const teacher = teacherMap.get(pair.teacher);

        return {
          studentId,
          teacherId: pair.teacher,
          teacherName: teacher?.name || "Unknown",
          teacherEmail: teacher?.email || "",
          subject: pair.subject,
          classLevel: pair.classLevel,
          enrolledAt: pair.enrolledAt,
          latestMessage: latest?.content || "",
          latestSenderRole: latest?.senderRole || "",
          latestAt: latest?.createdAt || pair.enrolledAt
        };
      })
    );

    threads.sort((a, b) => new Date(b.latestAt) - new Date(a.latestAt));
    res.json({ threads });
  } catch (error) {
    console.error("Student threads error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* TEACHER: list eligible conversation threads */
router.get("/teacher/threads", auth, async (req, res) => {
  try {
    const teacherId = req.user.id;

    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(403).json({ message: "Only teachers can access this endpoint" });
    }

    const pairs = await getEligiblePairsForTeacher(teacherId);
    if (pairs.length === 0) {
      return res.json({ threads: [] });
    }

    const studentIds = [...new Set(pairs.map((pair) => pair.student))];
    const students = await User.find({ _id: { $in: studentIds }, role: "student" }).select("name email");
    const studentMap = new Map(students.map((student) => [student._id.toString(), student]));

    const threads = await Promise.all(
      pairs.map(async (pair) => {
        const latest = await Message.findOne({
          student: pair.student,
          teacher: teacherId,
          subject: pair.subject,
          classLevel: pair.classLevel
        })
          .sort({ createdAt: -1 })
          .select("content createdAt senderRole");

        const student = studentMap.get(pair.student);

        return {
          studentId: pair.student,
          studentName: student?.name || "Unknown",
          studentEmail: student?.email || "",
          teacherId,
          subject: pair.subject,
          classLevel: pair.classLevel,
          enrolledAt: pair.enrolledAt,
          latestMessage: latest?.content || "",
          latestSenderRole: latest?.senderRole || "",
          latestAt: latest?.createdAt || pair.enrolledAt
        };
      })
    );

    threads.sort((a, b) => new Date(b.latestAt) - new Date(a.latestAt));
    res.json({ threads });
  } catch (error) {
    console.error("Teacher threads error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* SHARED: get conversation by pair+subject+class */
router.get("/conversation", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { teacherId, studentId, subject, classLevel } = req.query;

    if (!teacherId || !studentId || !subject || !classLevel) {
      return res.status(400).json({ message: "Teacher, student, subject, and class level are required" });
    }

    const user = await User.findById(userId);
    if (!user || (user.role !== "teacher" && user.role !== "student")) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (user.role === "teacher" && userId !== teacherId) {
      return res.status(403).json({ message: "Not authorized for this conversation" });
    }

    if (user.role === "student" && userId !== studentId) {
      return res.status(403).json({ message: "Not authorized for this conversation" });
    }

    const normalizedClassLevel = normalizeClassLevel(classLevel);
    const allowed = await isAssignedAndPaid({
      studentId,
      teacherId,
      subject,
      classLevel: normalizedClassLevel
    });

    if (!allowed) {
      return res.status(403).json({ message: "Conversation is available only for assigned paid teacher-student pairs" });
    }

    const messages = await Message.find({
      teacher: teacherId,
      student: studentId,
      subject,
      classLevel: normalizedClassLevel
    })
      .populate("sender", "name role")
      .sort({ createdAt: 1 });

    res.json({ messages });
  } catch (error) {
    console.error("Get conversation error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;