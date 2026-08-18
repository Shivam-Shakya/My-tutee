const fs = require("fs");
const path = require("path");
const express = require("express");
const multer = require("multer");
const Lecture = require("../models/Lecture");
const Payment = require("../models/Payment");
const Assignment = require("../models/Assignment");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

const uploadsRoot = path.join(__dirname, "..", "uploads", "lectures");
const videoDir = path.join(uploadsRoot, "videos");
const materialsDir = path.join(uploadsRoot, "materials");

[uploadsRoot, videoDir, materialsDir].forEach((dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "videoFile") {
      cb(null, videoDir);
      return;
    }

    cb(null, materialsDir);
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
    fileSize: 200 * 1024 * 1024,
    files: 6
  },
  fileFilter: (req, file, cb) => {
    const allowedVideoTypes = [
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "video/x-msvideo",
      "video/x-matroska"
    ];
    const allowedMaterialTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ];

    if (file.fieldname === "videoFile") {
      if (!allowedVideoTypes.includes(file.mimetype)) {
        cb(new Error("Only video files are allowed for lecture uploads"));
        return;
      }
      cb(null, true);
      return;
    }

    if (!allowedMaterialTypes.includes(file.mimetype)) {
      cb(new Error("Only PDF, DOC, DOCX, PPT, PPTX, and TXT files are allowed as materials"));
      return;
    }

    cb(null, true);
  }
});

const uploadFields = upload.fields([
  { name: "videoFile", maxCount: 1 },
  { name: "materials", maxCount: 5 }
]);

function normalizeClassLevel(value = "") {
  const normalized = value.replace(/th|st|nd|rd|Class /gi, "").trim();
  return normalized === "College" ? "Graduation" : normalized;
}

function toFilePayload(file, folderName) {
  return {
    fileName: file.filename,
    originalName: file.originalname,
    fileUrl: `/uploads/lectures/${folderName}/${file.filename}`,
    mimeType: file.mimetype,
    size: file.size
  };
}

function removeStoredFile(fileUrl) {
  if (!fileUrl) {
    return;
  }

  const absolutePath = path.join(__dirname, "..", fileUrl.replace(/^\//, ""));
  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }
}

function cleanupUploadedFiles(files = {}) {
  Object.values(files)
    .flat()
    .forEach((file) => {
      if (file?.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });
}

function handleUpload(req, res, next) {
  uploadFields(req, res, (error) => {
    if (error) {
      res.status(400).json({ message: error.message || "Upload failed" });
      return;
    }

    next();
  });
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

router.post("/", auth, handleUpload, async (req, res) => {
  try {
    const teacher = await ensureTeacher(req.user.id);
    if (!teacher) {
      cleanupUploadedFiles(req.files);
      return res.status(403).json({ message: "Only teachers can upload lectures" });
    }

    const { subject, classLevel, title, description, videoType, videoLink } = req.body;
    const trimmedVideoLink = (videoLink || "").trim();
    const videoFile = req.files?.videoFile?.[0];
    const materialFiles = req.files?.materials || [];

    if (!subject || !classLevel || !title || !videoType) {
      cleanupUploadedFiles(req.files);
      return res.status(400).json({ message: "Subject, class level, title, and video type are required" });
    }

    if (videoType === "link" && !trimmedVideoLink) {
      cleanupUploadedFiles(req.files);
      return res.status(400).json({ message: "Video link is required when using link upload type" });
    }

    if (videoType === "file" && !videoFile) {
      cleanupUploadedFiles(req.files);
      return res.status(400).json({ message: "Video file is required when using file upload type" });
    }

    const lecture = new Lecture({
      teacher: teacher._id,
      subject: subject.trim(),
      classLevel: classLevel.trim(),
      title: title.trim(),
      description: (description || "").trim(),
      videoType,
      videoLink: videoType === "link" ? trimmedVideoLink : "",
      videoFile: videoType === "file" && videoFile ? toFilePayload(videoFile, "videos") : null,
      materials: materialFiles.map((file) => toFilePayload(file, "materials"))
    });

    await lecture.save();

    const savedLecture = await Lecture.findById(lecture._id).populate("teacher", "name email subjects");

    // Notify students about the new lecture (async, don't block response)
    setImmediate(async () => {
      try {
        const normalizedSubject = String(subject).trim();
        const normalizedClassLevel = normalizeClassLevel(String(classLevel).trim());

        const studentAssignments = await Assignment.find({
          teacher: teacher._id,
          subject: normalizedSubject,
          classLevel: normalizedClassLevel,
          status: "active"
        }).select("student");

        const studentIds = [...new Set(studentAssignments.map((a) => String(a.student)).filter(Boolean))];

        if (studentIds.length > 0) {
          await User.updateMany(
            { _id: { $in: studentIds } },
            {
              $push: {
                notifications: {
                  type: "lecture-uploaded",
                  message: `${teacher.name} uploaded a new lecture: \"${title}\" for ${normalizedSubject}`,
                  from: teacher._id,
                  subject: normalizedSubject,
                  classLevel: normalizedClassLevel,
                  createdAt: new Date(),
                  read: false
                }
              }
            }
          );
        }
      } catch (notifyError) {
        console.error("Error notifying students about lecture:", notifyError);
      }
    });

    res.status(201).json({
      message: "Lecture uploaded successfully",
      lecture: savedLecture
    });
  } catch (error) {
    cleanupUploadedFiles(req.files);
    console.error("Create lecture error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/teacher-lectures", auth, async (req, res) => {
  try {
    const teacher = await ensureTeacher(req.user.id);
    if (!teacher) {
      return res.status(403).json({ message: "Only teachers can access this endpoint" });
    }

    const lectures = await Lecture.find({ teacher: teacher._id })
      .populate("teacher", "name email subjects")
      .sort({ createdAt: -1 });

    res.json({ lectures });
  } catch (error) {
    console.error("Get teacher lectures error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/student-lectures", auth, async (req, res) => {
  try {
    const student = await ensureStudent(req.user.id);
    if (!student) {
      return res.status(403).json({ message: "Only students can access this endpoint" });
    }

    const studentClassLevel = normalizeClassLevel(student.classLevel || student.profile?.currentClass || "");
    if (!studentClassLevel) {
      return res.json({ lectures: [], message: "Please set your class level in your profile" });
    }

    const now = new Date();
    const [validPayments, activeAssignments] = await Promise.all([
      Payment.find({
        student: student._id,
        status: "completed",
        validUntil: { $gte: now },
        classLevel: studentClassLevel
      }),
      Assignment.find({
        student: student._id,
        classLevel: studentClassLevel,
        status: "active"
      })
    ]);

    const paymentPairs = new Set(validPayments.map((payment) => `${payment.teacher.toString()}::${payment.subject}`));
    const eligiblePairs = activeAssignments
      .filter((assignment) => paymentPairs.has(`${assignment.teacher.toString()}::${assignment.subject}`))
      .map((assignment) => ({
        teacher: assignment.teacher,
        subject: assignment.subject
      }));

    if (eligiblePairs.length === 0) {
      return res.json({ lectures: [] });
    }

    const lectureQuery = {
      classLevel: studentClassLevel,
      status: "published",
      $or: eligiblePairs.map((pair) => ({ teacher: pair.teacher, subject: pair.subject }))
    };

    const lectures = await Lecture.find(lectureQuery)
      .populate("teacher", "name email subjects")
      .sort({ createdAt: -1 });

    res.json({ lectures });
  } catch (error) {
    console.error("Get student lectures error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", auth, handleUpload, async (req, res) => {
  try {
    const teacher = await ensureTeacher(req.user.id);
    if (!teacher) {
      cleanupUploadedFiles(req.files);
      return res.status(403).json({ message: "Only teachers can update lectures" });
    }

    const lecture = await Lecture.findById(req.params.id);
    if (!lecture) {
      cleanupUploadedFiles(req.files);
      return res.status(404).json({ message: "Lecture not found" });
    }

    if (lecture.teacher.toString() !== teacher._id.toString()) {
      cleanupUploadedFiles(req.files);
      return res.status(403).json({ message: "Not authorized to update this lecture" });
    }

    const {
      subject,
      classLevel,
      title,
      description,
      videoType,
      videoLink,
      removeMaterials,
      status
    } = req.body;

    const nextVideoType = videoType || lecture.videoType;
    const nextVideoFile = req.files?.videoFile?.[0];
    const nextMaterials = req.files?.materials || [];
    const shouldRemoveMaterials = removeMaterials === "true";

    if (subject) lecture.subject = subject.trim();
    if (classLevel) lecture.classLevel = classLevel.trim();
    if (title) lecture.title = title.trim();
    if (description !== undefined) lecture.description = description.trim();
    if (status) lecture.status = status;

    if (nextVideoType === "link") {
      if (!((videoLink || lecture.videoLink || "").trim())) {
        cleanupUploadedFiles(req.files);
        return res.status(400).json({ message: "Video link is required when using link upload type" });
      }

      if (lecture.videoFile?.fileUrl) {
        removeStoredFile(lecture.videoFile.fileUrl);
      }

      lecture.videoType = "link";
      lecture.videoLink = (videoLink || lecture.videoLink || "").trim();
      lecture.videoFile = null;
    } else {
      lecture.videoType = "file";
      if (nextVideoFile) {
        if (lecture.videoFile?.fileUrl) {
          removeStoredFile(lecture.videoFile.fileUrl);
        }
        lecture.videoFile = toFilePayload(nextVideoFile, "videos");
      }

      if (!lecture.videoFile) {
        cleanupUploadedFiles(req.files);
        return res.status(400).json({ message: "A video file is required for file upload type" });
      }

      lecture.videoLink = "";
    }

    if (shouldRemoveMaterials) {
      lecture.materials.forEach((material) => removeStoredFile(material.fileUrl));
      lecture.materials = [];
    }

    if (nextMaterials.length > 0) {
      lecture.materials.forEach((material) => removeStoredFile(material.fileUrl));
      lecture.materials = nextMaterials.map((file) => toFilePayload(file, "materials"));
    }

    await lecture.save();

    const updatedLecture = await Lecture.findById(lecture._id).populate("teacher", "name email subjects");

    res.json({
      message: "Lecture updated successfully",
      lecture: updatedLecture
    });
  } catch (error) {
    cleanupUploadedFiles(req.files);
    console.error("Update lecture error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const teacher = await ensureTeacher(req.user.id);
    if (!teacher) {
      return res.status(403).json({ message: "Only teachers can delete lectures" });
    }

    const lecture = await Lecture.findById(req.params.id);
    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    if (lecture.teacher.toString() !== teacher._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this lecture" });
    }

    if (lecture.videoFile?.fileUrl) {
      removeStoredFile(lecture.videoFile.fileUrl);
    }
    lecture.materials.forEach((material) => removeStoredFile(material.fileUrl));

    await Lecture.findByIdAndDelete(lecture._id);

    res.json({ message: "Lecture deleted successfully" });
  } catch (error) {
    console.error("Delete lecture error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;