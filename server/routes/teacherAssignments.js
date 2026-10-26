const router = require("express").Router();
const TeacherAssignment = require("../models/TeacherAssignment");
const Assignment = require("../models/Assignment");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

/* CREATE a new assignment (Teacher only) */
router.post("/create", auth, async (req, res) => {
  try {
    const teacherId = req.user.id;

    // Verify user is a teacher
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(403).json({ message: "Only teachers can create assignments" });
    }

    const {
      subject,
      course,
      subSubject,
      classLevel,
      title,
      description,
      instructions,
      dueDate,
      totalMarks,
      attachments,
      studentIds
    } = req.body;

    // Validate required fields
    if (!subject || !classLevel || !title || !dueDate) {
      return res.status(400).json({ message: "Subject, class level, title, and due date are required" });
    }

    const assignmentMappings = await Assignment.find({
      teacher: teacherId,
      subject,
      classLevel,
      status: "active"
    }).select("student");

    const mappedStudentIds = assignmentMappings
      .map((item) => item.student?.toString())
      .filter(Boolean);

    const manualStudentIds = Array.isArray(studentIds)
      ? studentIds.map((id) => id?.toString()).filter(Boolean)
      : [];

    const assignedStudents = [...new Set([...mappedStudentIds, ...manualStudentIds])];

    // Create new assignment
    const assignment = new TeacherAssignment({
      teacher: teacherId,
      subject,
      course: course || "",
      subSubject: subSubject || "",
      classLevel,
      title,
      description: description || "",
      instructions: instructions || "",
      dueDate: new Date(dueDate),
      totalMarks: totalMarks || 100,
      attachments: attachments || [],
      status: "published",
      assignedStudents,
      submissions: []
    });

    await assignment.save();

    // Populate teacher details
    const populatedAssignment = await TeacherAssignment.findById(assignment._id)
      .populate("teacher", "name email subjects");

    res.status(201).json({
      message: "Assignment created successfully",
      assignment: populatedAssignment
    });
  } catch (error) {
    console.error("Create assignment error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* GET all assignments created by a teacher */
router.get("/teacher-assignments", auth, async (req, res) => {
  try {
    const teacherId = req.user.id;

    // Verify user is a teacher
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(403).json({ message: "Only teachers can access this endpoint" });
    }

    const { classLevel, subject } = req.query;

    let query = { teacher: teacherId };
    if (classLevel) query.classLevel = classLevel;
    if (subject) query.subject = subject;

    const assignments = await TeacherAssignment.find(query)
      .populate("submissions.student", "name email profile")
      .sort({ createdAt: -1 });

    res.json({ assignments });
  } catch (error) {
    console.error("Get teacher assignments error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* GET assignments for a student (based on teacher-student mapping and assignment targeting) */
router.get("/student-assignments", auth, async (req, res) => {
  try {
    const studentId = req.user.id;

    // Verify user is a student
    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(403).json({ message: "Only students can access this endpoint" });
    }

    // Get student's class level
    const studentClassLevel = student.classLevel || student.profile?.currentClass?.replace(/th|st|nd|rd/gi, '') || "";

    if (!studentClassLevel) {
      return res.json({ assignments: [], message: "Please set your class level in your profile" });
    }

    const studentAssignments = await Assignment.find({
      student: studentId,
      status: "active",
      classLevel: studentClassLevel
    });

    const mappingTriples = studentAssignments.map((item) => ({
      teacher: item.teacher.toString(),
      subject: item.subject,
      classLevel: item.classLevel
    }));

    if (mappingTriples.length === 0) {
      return res.json({ assignments: [], message: "No teachers assigned for your class level" });
    }

    const assignments = await TeacherAssignment.find({
      status: "published",
      $or: [
        { assignedStudents: studentId },
        {
          $or: mappingTriples.map((item) => ({
            teacher: item.teacher,
            subject: item.subject,
            classLevel: item.classLevel
          }))
        }
      ]
    })
      .populate("teacher", "name email profile")
      .sort({ dueDate: 1 });

    // Add submission status for each assignment
    const assignmentsWithStatus = assignments.map(assignment => {
      const submission = assignment.submissions.find(
        sub => sub.student.toString() === studentId
      );
      return {
        ...assignment.toObject(),
        submissionStatus: submission?.status || "pending",
        submittedAt: submission?.submittedAt || null,
        marks: submission?.marks || null,
        feedback: submission?.feedback || ""
      };
    });

    const mappedSubjects = [...new Set(assignmentsWithStatus.map((item) => item.subject).filter(Boolean))];
    res.json({ assignments: assignmentsWithStatus, paidSubjects: mappedSubjects });
  } catch (error) {
    console.error("Get student assignments error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* SUBMIT an assignment (Student only) */
router.post("/:id/submit", auth, async (req, res) => {
  try {
    const studentId = req.user.id;
    const assignmentId = req.params.id;

    // Verify user is a student
    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(403).json({ message: "Only students can submit assignments" });
    }

    const assignment = await TeacherAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Check if student's class level matches
    const studentClassLevel = student.classLevel || student.profile?.currentClass?.replace(/th|st|nd|rd/gi, '') || "";
    if (assignment.classLevel !== studentClassLevel) {
      return res.status(403).json({ message: "This assignment is not for your class level" });
    }

    const directAssignment = assignment.assignedStudents
      ?.some((id) => id.toString() === studentId);

    const activeMapping = await Assignment.findOne({
      student: studentId,
      teacher: assignment.teacher,
      subject: assignment.subject,
      classLevel: assignment.classLevel,
      status: "active"
    }).select("_id");

    if (!directAssignment && !activeMapping) {
      return res.status(403).json({ message: "You are not assigned to this assignment" });
    }

    // Check if already submitted
    const existingSubmission = assignment.submissions.find(
      sub => sub.student.toString() === studentId
    );
    if (existingSubmission && existingSubmission.status !== "pending") {
      return res.status(400).json({ message: "You have already submitted this assignment" });
    }

    const { content, attachments } = req.body;
    const isLate = new Date() > new Date(assignment.dueDate);

    if (existingSubmission) {
      // Update existing submission
      existingSubmission.content = content || "";
      existingSubmission.attachments = attachments || [];
      existingSubmission.submittedAt = new Date();
      existingSubmission.status = isLate ? "late" : "submitted";
    } else {
      // Add new submission
      assignment.submissions.push({
        student: studentId,
        content: content || "",
        attachments: attachments || [],
        submittedAt: new Date(),
        status: isLate ? "late" : "submitted"
      });
    }

    await assignment.save();

    res.json({
      message: "Assignment submitted successfully",
      isLate,
      submission: {
        assignmentId: assignment._id,
        studentId,
        submittedAt: new Date(),
        status: isLate ? "late" : "submitted"
      }
    });
  } catch (error) {
    console.error("Submit assignment error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* GRADE an assignment submission (Teacher only) */
router.put("/:id/grade/:studentId", auth, async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { id: assignmentId, studentId } = req.params;

    const assignment = await TeacherAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Verify teacher owns this assignment
    if (assignment.teacher.toString() !== teacherId) {
      return res.status(403).json({ message: "Not authorized to grade this assignment" });
    }

    const submission = assignment.submissions.find(
      sub => sub.student.toString() === studentId
    );
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    const { marks, feedback } = req.body;

    submission.marks = marks;
    submission.feedback = feedback || "";
    submission.status = "graded";

    await assignment.save();

    res.json({ message: "Assignment graded successfully" });
  } catch (error) {
    console.error("Grade assignment error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* UPDATE an assignment (Teacher only) */
router.put("/:id", auth, async (req, res) => {
  try {
    const teacherId = req.user.id;
    const assignmentId = req.params.id;

    const assignment = await TeacherAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Verify teacher owns this assignment
    if (assignment.teacher.toString() !== teacherId) {
      return res.status(403).json({ message: "Not authorized to update this assignment" });
    }

    const { title, description, instructions, dueDate, totalMarks, status, attachments } = req.body;

    if (title) assignment.title = title;
    if (description !== undefined) assignment.description = description;
    if (instructions !== undefined) assignment.instructions = instructions;
    if (dueDate) assignment.dueDate = new Date(dueDate);
    if (totalMarks) assignment.totalMarks = totalMarks;
    if (status) assignment.status = status;
    if (attachments) assignment.attachments = attachments;

    await assignment.save();

    const updatedAssignment = await TeacherAssignment.findById(assignmentId)
      .populate("teacher", "name email subjects");

    res.json({
      message: "Assignment updated successfully",
      assignment: updatedAssignment
    });
  } catch (error) {
    console.error("Update assignment error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* DELETE an assignment (Teacher only) */
router.delete("/:id", auth, async (req, res) => {
  try {
    const teacherId = req.user.id;
    const assignmentId = req.params.id;

    const assignment = await TeacherAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Verify teacher owns this assignment
    if (assignment.teacher.toString() !== teacherId) {
      return res.status(403).json({ message: "Not authorized to delete this assignment" });
    }

    await TeacherAssignment.findByIdAndDelete(assignmentId);

    res.json({ message: "Assignment deleted successfully" });
  } catch (error) {
    console.error("Delete assignment error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
