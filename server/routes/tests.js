const fs = require("fs");
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const Test = require("../models/Test");
const TestSubmission = require("../models/TestSubmission");
const Assignment = require("../models/Assignment");
const Payment = require("../models/Payment");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

const uploadsRoot = path.join(__dirname, "..", "uploads", "tests");
const questionDir = path.join(uploadsRoot, "questions");

[uploadsRoot, questionDir].forEach((dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

function normalizeClassLevel(value = "") {
  const normalized = value.replace(/th|st|nd|rd|Class /gi, "").trim();
  return normalized === "College" ? "Graduation" : normalized;
}

function removeStoredFile(fileUrl) {
  if (!fileUrl) return;

  const absolutePath = path.join(__dirname, "..", fileUrl.replace(/^\//, ""));
  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }
}

function inferCorrectAnswerFromSolution(solution = "") {
  const normalizedSolution = String(solution || "").trim();
  if (!normalizedSolution) {
    return "";
  }

  const patterns = [
    /^answer\s*[:\-]?\s*([ABCD])\b/i,
    /^correct\s*answer\s*[:\-]?\s*([ABCD])\b/i,
    /^option\s*([ABCD])\b/i,
    /^\(?([ABCD])\)?[\s.:\-]/i
  ];

  for (const pattern of patterns) {
    const match = normalizedSolution.match(pattern);
    if (match?.[1]) {
      return match[1].toUpperCase();
    }
  }

  return "";
}

function parseQuestions(rawQuestions) {
  if (!rawQuestions) return [];

  let parsed = rawQuestions;
  if (typeof rawQuestions === "string") {
    try {
      parsed = JSON.parse(rawQuestions);
    } catch (error) {
      throw new Error("Questions payload must be valid JSON");
    }
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Questions payload must be an array");
  }

  return parsed.map((item, index) => {
    const questionText = String(item?.questionText || "").trim();
    const options = [item?.optionA, item?.optionB, item?.optionC, item?.optionD].map((option) => String(option || "").trim());
    const solution = String(item?.solution || "").trim();
    const providedCorrectAnswer = String(item?.correctAnswer || "").trim().toUpperCase();
    const marks = Math.max(1, Number(item?.marks || 1));

    if (!questionText) {
      throw new Error(`Question ${index + 1} text is required`);
    }

    if (options.some((option) => !option)) {
      throw new Error(`Question ${index + 1} must include four options`);
    }

    if (!solution) {
      throw new Error(`Question ${index + 1} must include a solution`);
    }

    if (!["A", "B", "C", "D"].includes(providedCorrectAnswer)) {
      throw new Error(`Question ${index + 1} must include a valid correct answer`);
    }

    return {
      questionText,
      options,
      solution,
      correctAnswer: providedCorrectAnswer,
      marks
    };
  });
}

function sanitizeTestForStudent(test, submission = null) {
  const testObject = test.toObject ? test.toObject() : test;
  const shouldShowReview = Boolean(submission);

  return {
    ...testObject,
    questions: (testObject.questions || []).map((question, index) => {
      const base = {
        questionIndex: index,
        questionText: question.questionText,
        options: Array.isArray(question.options) ? question.options : [],
        solution: shouldShowReview ? question.solution || "" : ""
      };

      if (!shouldShowReview) {
        return base;
      }

      const submittedAnswer = submission.answers.find((answer) => answer.questionIndex === index);
      const resolvedCorrectAnswer = question.correctAnswer || inferCorrectAnswerFromSolution(question.solution);
      return {
        ...base,
        correctAnswer: resolvedCorrectAnswer,
        selectedOption: submittedAnswer?.selectedOption || "",
        isCorrect: Boolean(submittedAnswer?.isCorrect)
      };
    }),
    submission
  };
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
  const assignment = await Assignment.findOne({
    student: studentId,
    teacher: teacherId,
    subject,
    classLevel,
    status: "active"
  }).select("amountPaid");

  if (!assignment) {
    return false;
  }

  if (Number(assignment.amountPaid) === 0) {
    return true;
  }

  const payment = await Payment.findOne({
    student: studentId,
    teacher: teacherId,
    subject,
    classLevel,
    status: "completed",
    validUntil: { $gte: new Date() }
  }).select("_id");

  return Boolean(payment);
}

/* TEACHER: create test */
router.post("/", auth, async (req, res) => {
  try {
    const teacher = await ensureTeacher(req.user.id);
    if (!teacher) {
      return res.status(403).json({ message: "Only teachers can create tests" });
    }

    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({ message: "Invalid request payload. Send JSON body with test details." });
    }

    const {
      subject,
      classLevel,
      title,
      description,
      durationMinutes,
      questions,
      status
    } = req.body;

    const normalizedDurationMinutes = Math.max(1, Number(durationMinutes || 0));

    if (!subject || !classLevel || !title) {
      return res.status(400).json({ message: "Subject, class level, and test title are required" });
    }

    if (!Number.isFinite(normalizedDurationMinutes) || normalizedDurationMinutes <= 0) {
      return res.status(400).json({ message: "Test duration must be greater than 0 minutes" });
    }

    const parsedQuestions = parseQuestions(questions);
    if (parsedQuestions.length === 0) {
      return res.status(400).json({ message: "Add at least one question to create a test" });
    }

    const normalizedClassLevel = normalizeClassLevel(classLevel);

    const test = await Test.create({
      teacher: teacher._id,
      subject: String(subject).trim(),
      classLevel: normalizedClassLevel,
      title: String(title).trim(),
      description: String(description || "").trim(),
      durationMinutes: normalizedDurationMinutes,
      testDateTime: new Date(),
      questionFile: null,
      questions: parsedQuestions,
      isVisible: false,
      assignedStudents: [],
      status: status === "draft" ? "draft" : "published"
    });

    const populated = await Test.findById(test._id).populate("teacher", "name email");
    res.status(201).json({ message: "Test created successfully", test: populated });
    
    // Notify students about the new test (async, don't block response)
    setImmediate(async () => {
      try {
        const studentAssignments = await Assignment.find({
          teacher: teacher._id,
          subject,
          classLevel: normalizedClassLevel,
          status: "active"
        });
        
        const studentIds = [...new Set(studentAssignments.map(a => a.student))];
        
        if (studentIds.length > 0) {
          await User.updateMany(
            { _id: { $in: studentIds } },
            {
              $push: {
                notifications: {
                  type: 'test-created',
                  message: `${teacher.name} created a new test: "${title}" for ${subject}`,
                  from: teacher._id,
                  subject,
                  classLevel: normalizedClassLevel,
                  createdAt: new Date(),
                  read: false
                }
              }
            }
          );
        }
      } catch (notifyError) {
        console.error("Error notifying students about test:", notifyError);
      }
    });
  } catch (error) {
    console.error("Create test error:", error);
    res.status(error.message?.includes("Question") || error.message?.includes("Questions payload") || error.message?.includes("Add at least") ? 400 : 500).json({ message: error.message || "Server error" });
  }
});

/* TEACHER: assign test to a specific linked student */
router.post("/:id/assign-student", auth, async (req, res) => {
  try {
    const teacher = await ensureTeacher(req.user.id);
    if (!teacher) {
      return res.status(403).json({ message: "Only teachers can assign tests" });
    }

    const { studentId } = req.body || {};
    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    if (test.teacher.toString() !== teacher._id.toString()) {
      return res.status(403).json({ message: "Not authorized to assign this test" });
    }

    const student = await ensureStudent(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const allowed = await isAssignedAndPaid({
      studentId: student._id,
      teacherId: teacher._id,
      subject: test.subject,
      classLevel: test.classLevel
    });

    if (!allowed) {
      return res.status(400).json({
        message: "This student is not actively assigned and paid for this subject/class"
      });
    }

    const alreadyAssigned = (test.assignedStudents || []).some(
      (id) => id.toString() === student._id.toString()
    );

    if (!alreadyAssigned) {
      test.assignedStudents = [...(test.assignedStudents || []), student._id];
    }

    test.isVisible = true;
    await test.save();

    return res.json({
      message: alreadyAssigned
        ? "Test already shared with this student"
        : "Test shared with student successfully",
      test: {
        _id: test._id,
        isVisible: test.isVisible,
        assignedStudents: test.assignedStudents
      }
    });
  } catch (error) {
    console.error("Assign test to student error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* TEACHER: list own tests */
router.get("/teacher-tests", auth, async (req, res) => {
  try {
    const teacher = await ensureTeacher(req.user.id);
    if (!teacher) {
      return res.status(403).json({ message: "Only teachers can access this endpoint" });
    }

    const tests = await Test.find({ teacher: teacher._id })
      .populate("teacher", "name email")
      .sort({ createdAt: -1 });

    const testIds = tests.map((test) => test._id);
    const submissionCounts = await TestSubmission.aggregate([
      { $match: { test: { $in: testIds } } },
      { $group: { _id: "$test", count: { $sum: 1 } } }
    ]);
    const countMap = new Map(submissionCounts.map((item) => [item._id.toString(), item.count]));

    const enrichedTests = tests.map((test) => ({
      ...test.toObject(),
      submissionCount: countMap.get(test._id.toString()) || 0
    }));

    res.json({ tests: enrichedTests });
  } catch (error) {
    console.error("Get teacher tests error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* TEACHER: update test */
router.put("/:id", auth, async (req, res) => {
  try {
    const teacher = await ensureTeacher(req.user.id);
    if (!teacher) {
      return res.status(403).json({ message: "Only teachers can update tests" });
    }

    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    if (test.teacher.toString() !== teacher._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this test" });
    }

    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({ message: "Invalid request payload. Send JSON body with test details." });
    }

    const {
      subject,
      classLevel,
      title,
      description,
      durationMinutes,
      questions,
      status,
      isVisible
    } = req.body;

    if (subject) test.subject = String(subject).trim();
    if (classLevel) test.classLevel = normalizeClassLevel(classLevel);
    if (title) test.title = String(title).trim();
    if (description !== undefined) test.description = String(description).trim();
    if (durationMinutes !== undefined) {
      const normalizedDurationMinutes = Number(durationMinutes);
      if (!Number.isFinite(normalizedDurationMinutes) || normalizedDurationMinutes <= 0) {
        return res.status(400).json({ message: "Test duration must be greater than 0 minutes" });
      }
      test.durationMinutes = normalizedDurationMinutes;
    }
    if (status) test.status = status === "draft" ? "draft" : "published";
    if (typeof isVisible === "boolean") test.isVisible = isVisible;

    if (questions !== undefined) {
      test.questions = parseQuestions(questions);
    }

    await test.save();
    const populated = await Test.findById(test._id).populate("teacher", "name email");
    res.json({ message: "Test updated successfully", test: populated });
  } catch (error) {
    console.error("Update test error:", error);
    res.status(error.message?.includes("Question") || error.message?.includes("Questions payload") ? 400 : 500).json({ message: error.message || "Server error" });
  }
});

/* TEACHER: toggle test visibility */
router.patch("/:id/visibility", auth, async (req, res) => {
  try {
    const teacher = await ensureTeacher(req.user.id);
    if (!teacher) {
      return res.status(403).json({ message: "Only teachers can update test visibility" });
    }

    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    if (test.teacher.toString() !== teacher._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this test" });
    }

    const nextVisibility = typeof req.body?.isVisible === "boolean" ? req.body.isVisible : !test.isVisible;
    test.isVisible = nextVisibility;
    await test.save();

    res.json({
      message: `Test ${nextVisibility ? "shown" : "hidden"} successfully`,
      test: {
        _id: test._id,
        isVisible: test.isVisible
      }
    });
  } catch (error) {
    console.error("Toggle test visibility error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* TEACHER: delete test */
router.delete("/:id", auth, async (req, res) => {
  try {
    const teacher = await ensureTeacher(req.user.id);
    if (!teacher) {
      return res.status(403).json({ message: "Only teachers can delete tests" });
    }

    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    if (test.teacher.toString() !== teacher._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this test" });
    }

    if (test.questionFile?.fileUrl) {
      removeStoredFile(test.questionFile.fileUrl);
    }

    const submissions = await TestSubmission.find({ test: test._id });
    submissions.forEach((submission) => {
      if (submission.answerFile?.fileUrl) {
        removeStoredFile(submission.answerFile.fileUrl);
      }
    });

    await Promise.all([
      TestSubmission.deleteMany({ test: test._id }),
      Test.findByIdAndDelete(test._id)
    ]);

    res.json({ message: "Test deleted successfully" });
  } catch (error) {
    console.error("Delete test error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* STUDENT: list eligible tests */
router.get("/student-tests", auth, async (req, res) => {
  try {
    const student = await ensureStudent(req.user.id);
    if (!student) {
      return res.status(403).json({ message: "Only students can access this endpoint" });
    }

    const studentClassLevel = normalizeClassLevel(student.classLevel || student.profile?.currentClass || "");
    if (!studentClassLevel) {
      return res.json({ tests: [] });
    }

    const now = new Date();
    const [payments, assignments] = await Promise.all([
      Payment.find({
        student: student._id,
        classLevel: studentClassLevel,
        status: "completed",
        validUntil: { $gte: now }
      }).select("teacher subject classLevel"),
      Assignment.find({
        student: student._id,
        classLevel: studentClassLevel,
        status: "active"
      }).select("teacher subject classLevel amountPaid")
    ]);

    const paymentSet = new Set(payments.map((payment) => `${payment.teacher.toString()}::${payment.subject}`));
    const eligiblePairs = assignments
      .filter((assignment) => (
        Number(assignment.amountPaid) === 0
        || paymentSet.has(`${assignment.teacher.toString()}::${assignment.subject}`)
      ))
      .map((assignment) => ({
        teacher: assignment.teacher,
        subject: assignment.subject
      }));

    if (eligiblePairs.length === 0) {
      return res.json({ tests: [] });
    }

    const tests = await Test.find({
      classLevel: studentClassLevel,
      isVisible: true,
      $and: [
        {
          $or: [
            { assignedStudents: { $size: 0 } },
            { assignedStudents: student._id }
          ]
        },
        {
          $or: eligiblePairs.map((pair) => ({ teacher: pair.teacher, subject: pair.subject }))
        }
      ]
    })
      .populate("teacher", "name email")
      .sort({ createdAt: -1 });

    const testIds = tests.map((test) => test._id);
    const submissions = await TestSubmission.find({
      test: { $in: testIds },
      student: student._id
    });
    const submissionMap = new Map(submissions.map((submission) => [submission.test.toString(), submission]));

    const enrichedTests = tests.map((test) => {
      const submission = submissionMap.get(test._id.toString()) || null;
      return sanitizeTestForStudent(test, submission);
    });

    res.json({ tests: enrichedTests });
  } catch (error) {
    console.error("Get student tests error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* STUDENT: submit test answers */
router.post("/:id/submit", auth, async (req, res) => {
  try {
    const student = await ensureStudent(req.user.id);
    if (!student) {
      return res.status(403).json({ message: "Only students can submit test answers" });
    }

    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    const allowed = await isAssignedAndPaid({
      studentId: student._id,
      teacherId: test.teacher,
      subject: test.subject,
      classLevel: test.classLevel
    });

    if (!allowed) {
      return res.status(403).json({ message: "You are not eligible to submit this test" });
    }

    let answersPayload = req.body.answers;
    const isAutoSubmit = Boolean(req.body?.autoSubmit);
    if (typeof answersPayload === "string") {
      try {
        answersPayload = JSON.parse(answersPayload);
      } catch (error) {
        return res.status(400).json({ message: "Answers payload must be valid JSON" });
      }
    }

    if (!Array.isArray(answersPayload) || answersPayload.length !== test.questions.length) {
      return res.status(400).json({ message: "Answer all questions before submitting the test" });
    }

    const evaluatedAnswers = test.questions.map((question, index) => {
      const submitted = answersPayload.find((answer) => Number(answer?.questionIndex) === index);
      const selectedOption = String(submitted?.selectedOption || "").trim().toUpperCase();
      const resolvedCorrectAnswer = question.correctAnswer || inferCorrectAnswerFromSolution(question.solution);

      if (!["A", "B", "C", "D"].includes(selectedOption) && !isAutoSubmit) {
        throw new Error(`Question ${index + 1} is unanswered`);
      }

      const normalizedSelectedOption = ["A", "B", "C", "D"].includes(selectedOption) ? selectedOption : "";

      return {
        questionIndex: index,
        selectedOption: normalizedSelectedOption,
        isCorrect: Boolean(resolvedCorrectAnswer) && normalizedSelectedOption === resolvedCorrectAnswer
      };
    });

    const totalQuestions = test.questions.length;
    const correctAnswers = evaluatedAnswers.filter((answer) => answer.isCorrect).length;
    const incorrectAnswers = totalQuestions - correctAnswers;

    let submission = await TestSubmission.findOne({ test: test._id, student: student._id });

    if (!submission) {
      submission = new TestSubmission({
        test: test._id,
        student: student._id,
        teacher: test.teacher,
        answers: evaluatedAnswers,
        totalQuestions,
        correctAnswers,
        incorrectAnswers,
        submittedAt: new Date()
      });
    } else {
      submission.answers = evaluatedAnswers;
      submission.totalQuestions = totalQuestions;
      submission.correctAnswers = correctAnswers;
      submission.incorrectAnswers = incorrectAnswers;
      submission.submittedAt = new Date();
    }

    await submission.save();

    const refreshedTest = await Test.findById(test._id).populate("teacher", "name email");
    res.json({
      message: "Test submitted successfully",
      submission,
      test: sanitizeTestForStudent(refreshedTest, submission.toObject())
    });
  } catch (error) {
    console.error("Submit test error:", error);
    res.status(error.message?.includes("unanswered") ? 400 : 500).json({ message: error.message || "Server error" });
  }
});

/* TEACHER: view submissions for a test */
router.get("/:id/submissions", auth, async (req, res) => {
  try {
    const teacher = await ensureTeacher(req.user.id);
    if (!teacher) {
      return res.status(403).json({ message: "Only teachers can access this endpoint" });
    }

    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    if (test.teacher.toString() !== teacher._id.toString()) {
      return res.status(403).json({ message: "Not authorized to access submissions for this test" });
    }

    const submissions = await TestSubmission.find({ test: test._id })
      .populate("student", "name email classLevel")
      .sort({ submittedAt: -1 });

    res.json({
      submissions,
      test: {
        _id: test._id,
        title: test.title,
        subject: test.subject,
        classLevel: test.classLevel,
        questions: test.questions
      }
    });
  } catch (error) {
    console.error("Get test submissions error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;