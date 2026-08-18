const fs = require("fs");
const path = require("path");
const express = require("express");
const multer = require("multer");
const Doubt = require("../models/Doubt");
const Assignment = require("../models/Assignment");
const Payment = require("../models/Payment");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

const uploadsRoot = path.join(__dirname, "..", "uploads", "doubts");
if (!fs.existsSync(uploadsRoot)) {
  fs.mkdirSync(uploadsRoot, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsRoot);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const safeName = path.basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 50);

    cb(null, `${Date.now()}-${safeName || "file"}${extension}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain"
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      cb(new Error("Only JPG, PNG, WEBP, PDF, DOC, DOCX, and TXT files are allowed"));
      return;
    }

    cb(null, true);
  }
});

function handleUpload(req, res, next) {
  upload.single("attachment")(req, res, (error) => {
    if (error) {
      res.status(400).json({ message: error.message || "Attachment upload failed" });
      return;
    }
    next();
  });
}

function normalizeClassLevel(value = "") {
  const normalized = value.replace(/th|st|nd|rd|Class /gi, "").trim();
  return normalized === "College" ? "Graduation" : normalized;
}

function toFilePayload(file) {
  return {
    fileName: file.filename,
    originalName: file.originalname,
    fileUrl: `/uploads/doubts/${file.filename}`,
    mimeType: file.mimetype,
    size: file.size
  };
}

function removeStoredFile(fileUrl) {
  if (!fileUrl) return;

  const absolutePath = path.join(__dirname, "..", fileUrl.replace(/^\//, ""));
  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }
}

async function ensureTeacher(userId) {
  const teacher = await User.findById(userId);
  if (!teacher || teacher.role !== "teacher") {
    return null;
  }
  return teacher;
}

async function ensureStudent(userId) {
  const student = await User.findById(userId);
  if (!student || student.role !== "student") {
    return null;
  }
  return student;
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

async function findEligibleTeacherForStudent({ studentId, subject, classLevel }) {
  const now = new Date();
  const [payments, assignments] = await Promise.all([
    Payment.find({
      student: studentId,
      subject,
      classLevel,
      status: "completed",
      validUntil: { $gte: now }
    }).select("teacher student subject classLevel"),
    Assignment.find({
      student: studentId,
      subject,
      classLevel,
      status: "active"
    })
      .select("teacher student subject classLevel createdAt")
      .sort({ createdAt: -1 })
  ]);

  if (payments.length === 0 || assignments.length === 0) {
    return null;
  }

  const validTeacherIds = new Set(payments.map((payment) => payment.teacher.toString()));
  const eligibleAssignment = assignments.find((assignment) => validTeacherIds.has(assignment.teacher.toString()));

  return eligibleAssignment?.teacher || null;
}

/* STUDENT: submit doubt */
router.post("/student", auth, handleUpload, async (req, res) => {
  try {
    const student = await ensureStudent(req.user.id);
    if (!student) {
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(403).json({ message: "Only students can submit doubts" });
    }

    const { subject, title, description } = req.body;
    const normalizedSubject = (subject || "").trim();
    const normalizedTitle = (title || "").trim();
    const normalizedDescription = (description || "").trim();
    const studentClassLevel = normalizeClassLevel(student.classLevel || student.profile?.currentClass || "");

    if (!normalizedSubject || !normalizedTitle || !normalizedDescription) {
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ message: "Subject, doubt title, and doubt description are required" });
    }

    if (!studentClassLevel) {
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ message: "Please update your class level in profile before submitting a doubt" });
    }

    const teacherId = await findEligibleTeacherForStudent({
      studentId: student._id,
      subject: normalizedSubject,
      classLevel: studentClassLevel
    });

    if (!teacherId) {
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(403).json({ message: "No eligible assigned teacher found for this subject and class level" });
    }

    const doubt = await Doubt.create({
      teacher: teacherId,
      student: student._id,
      subject: normalizedSubject,
      classLevel: studentClassLevel,
      title: normalizedTitle,
      description: normalizedDescription,
      attachment: req.file ? toFilePayload(req.file) : null,
      status: "pending"
    });

    const populated = await Doubt.findById(doubt._id)
      .populate("student", "name email")
      .populate("teacher", "name email");

    res.status(201).json({ message: "Doubt submitted successfully", doubt: populated });

      // Notify teacher about the new doubt (async, don't block response)
      setImmediate(async () => {
        try {
          await User.findByIdAndUpdate(teacherId, {
            $push: {
              notifications: {
                type: 'doubt-submitted',
                message: `${student.name} submitted a doubt: "${normalizedTitle}" in ${normalizedSubject}`,
                from: student._id,
                subject: normalizedSubject,
                classLevel: studentClassLevel,
                createdAt: new Date(),
                read: false
              }
            }
          });
        } catch (notifyError) {
          console.error("Error notifying teacher about doubt:", notifyError);
        }
      });
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error("Submit doubt error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* STUDENT: list own doubts */
router.get("/student", auth, async (req, res) => {
  try {
    const student = await ensureStudent(req.user.id);
    if (!student) {
      return res.status(403).json({ message: "Only students can access this endpoint" });
    }

    const doubts = await Doubt.find({ student: student._id })
      .populate("teacher", "name email")
      .sort({ updatedAt: -1 });

    const filtered = [];
    for (const doubt of doubts) {
      const allowed = await isAssignedAndPaid({
        studentId: student._id,
        teacherId: doubt.teacher?._id || doubt.teacher,
        subject: doubt.subject,
        classLevel: doubt.classLevel
      });

      if (allowed) {
        filtered.push(doubt);
      }
    }

    res.json({ doubts: filtered });
  } catch (error) {
    console.error("Get student doubts error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* TEACHER: list assigned student doubts */
router.get("/teacher", auth, async (req, res) => {
  try {
    const teacher = await ensureTeacher(req.user.id);
    if (!teacher) {
      return res.status(403).json({ message: "Only teachers can access this endpoint" });
    }

    const doubts = await Doubt.find({ teacher: teacher._id })
      .populate("student", "name email")
      .sort({ updatedAt: -1 });

    const filtered = [];
    for (const doubt of doubts) {
      const allowed = await isAssignedAndPaid({
        studentId: doubt.student?._id || doubt.student,
        teacherId: teacher._id,
        subject: doubt.subject,
        classLevel: doubt.classLevel
      });

      if (allowed) {
        filtered.push(doubt);
      }
    }

    res.json({ doubts: filtered });
  } catch (error) {
    console.error("Get teacher doubts error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* TEACHER: solve a doubt */
router.patch("/teacher/:id/solve", auth, async (req, res) => {
  try {
    const teacher = await ensureTeacher(req.user.id);
    if (!teacher) {
      return res.status(403).json({ message: "Only teachers can resolve doubts" });
    }

    const { solution } = req.body;
    const normalizedSolution = (solution || "").trim();

    if (!normalizedSolution) {
      return res.status(400).json({ message: "Solution is required" });
    }

    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) {
      return res.status(404).json({ message: "Doubt not found" });
    }

    if (doubt.teacher.toString() !== teacher._id.toString()) {
      return res.status(403).json({ message: "Not authorized to resolve this doubt" });
    }

    const allowed = await isAssignedAndPaid({
      studentId: doubt.student,
      teacherId: teacher._id,
      subject: doubt.subject,
      classLevel: doubt.classLevel
    });

    if (!allowed) {
      return res.status(403).json({ message: "Doubt is no longer eligible under active assignment/payment" });
    }

    doubt.solution = normalizedSolution;
    doubt.status = "solved";
    doubt.solvedAt = new Date();
    await doubt.save();

    const populated = await Doubt.findById(doubt._id)
      .populate("student", "name email")
      .populate("teacher", "name email");

    res.json({ message: "Doubt resolved successfully", doubt: populated });

      // Notify student about the resolved doubt (async, don't block response)
      setImmediate(async () => {
        try {
          await User.findByIdAndUpdate(doubt.student, {
            $push: {
              notifications: {
                type: 'doubt-solved',
                message: `${teacher.name} resolved your doubt: "${doubt.title}"`,
                from: teacher._id,
                subject: doubt.subject,
                classLevel: doubt.classLevel,
                createdAt: new Date(),
                read: false
              }
            }
          });
        } catch (notifyError) {
          console.error("Error notifying student about resolved doubt:", notifyError);
        }
      });
  } catch (error) {
    console.error("Resolve doubt error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* CLEANUP: remove orphaned attachment if doubt deleted in future */
router.delete("/:id", auth, async (req, res) => {
  try {
    const teacher = await ensureTeacher(req.user.id);
    if (!teacher) {
      return res.status(403).json({ message: "Only teachers can delete doubts" });
    }

    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) {
      return res.status(404).json({ message: "Doubt not found" });
    }

    if (doubt.teacher.toString() !== teacher._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this doubt" });
    }

    if (doubt.attachment?.fileUrl) {
      removeStoredFile(doubt.attachment.fileUrl);
    }

    await Doubt.findByIdAndDelete(doubt._id);

    res.json({ message: "Doubt deleted successfully" });
  } catch (error) {
    console.error("Delete doubt error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;