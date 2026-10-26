const mongoose = require("mongoose");

const selectedSubSubjectSchema = new mongoose.Schema({
  id: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  fee: { type: Number, default: 0, min: 0 }
}, { _id: false });

const enrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
    index: true
  },
  courseId: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  courseName: {
    type: String,
    required: true,
    trim: true
  },
  selectedSubSubjects: {
    type: [selectedSubSubjectSchema],
    default: []
  },
  assignedSubject: {
    type: String,
    default: "",
    trim: true
  },
  classLevel: {
    type: String,
    enum: ["9", "10", "11", "12", "Graduation", "Post Graduation", ""],
    default: ""
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
    default: null
  },
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Assignment",
    default: null
  },
  status: {
    type: String,
    enum: ["active", "completed", "cancelled"],
    default: "active",
    index: true
  }
}, { timestamps: true });

enrollmentSchema.index({ student: 1, courseId: 1, status: 1 });
enrollmentSchema.index({ student: 1, teacher: 1, assignedSubject: 1, status: 1 });

module.exports = mongoose.model("Enrollment", enrollmentSchema);
