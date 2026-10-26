const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  classLevel: {
    type: String,
    enum: ["9", "10", "11", "12", "Graduation", "Post Graduation"],
    required: true
  },
  // Payment details
  paymentId: {
    type: String,
    default: ""
  },
  amountPaid: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ["card", "upi", "qr"],
    default: "card"
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed", "refunded"],
    default: "completed"
  },
  // Timetable and price for this assignment
  timetable: [{
    day: String,
    time: String,
    duration: Number
  }],
  pricePerHour: {
    type: String,
    default: ""
  },
  pricePerMonth: {
    type: String,
    default: ""
  },
  // Assignment status
  status: {
    type: String,
    enum: ["active", "inactive", "completed", "cancelled"],
    default: "active"
  },
  // Progress tracking
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  lastClassDate: {
    type: Date,
    default: null
  },
  totalClasses: {
    type: Number,
    default: 0
  },
  completedClasses: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Compound index to prevent duplicate assignments
assignmentSchema.index({ student: 1, teacher: 1, subject: 1, classLevel: 1 }, { unique: true });
assignmentSchema.index({ classLevel: 1, subject: 1 });

module.exports = mongoose.model("Assignment", assignmentSchema);
