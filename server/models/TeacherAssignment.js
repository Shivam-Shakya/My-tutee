const mongoose = require("mongoose");

// This model represents homework/assignments created by teachers for students
const teacherAssignmentSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  course: {
    type: String,
    default: ""
  },
  subSubject: {
    type: String,
    default: ""
  },
  classLevel: {
    type: String,
    enum: ["9", "10", "11", "12", "Graduation", "Post Graduation"],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  instructions: {
    type: String,
    default: ""
  },
  dueDate: {
    type: Date,
    required: true
  },
  totalMarks: {
    type: Number,
    default: 100
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String
  }],
  status: {
    type: String,
    enum: ["draft", "published", "closed"],
    default: "published"
  },
  assignedStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  // Student submissions
  submissions: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    content: {
      type: String,
      default: ""
    },
    attachments: [{
      fileName: String,
      fileUrl: String,
      fileType: String
    }],
    marks: {
      type: Number,
      default: null
    },
    feedback: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["pending", "submitted", "graded", "late"],
      default: "pending"
    }
  }]
}, { timestamps: true });

// Index for efficient queries
teacherAssignmentSchema.index({ teacher: 1, classLevel: 1, subject: 1 });
teacherAssignmentSchema.index({ classLevel: 1, subject: 1, status: 1 });
teacherAssignmentSchema.index({ assignedStudents: 1 });
teacherAssignmentSchema.index({ "submissions.student": 1 });
teacherAssignmentSchema.index({ dueDate: 1 });

module.exports = mongoose.model("TeacherAssignment", teacherAssignmentSchema);
