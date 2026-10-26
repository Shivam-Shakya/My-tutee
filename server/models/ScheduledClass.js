const mongoose = require("mongoose");

const scheduledClassSchema = new mongoose.Schema({
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
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    default: 60 // in minutes
  },
  platform: {
    type: String,
    enum: ["zoom", "meet", "teams", "internal"],
    default: "internal"
  },
  meetingLink: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: ["scheduled", "ongoing", "completed", "cancelled"],
    default: "scheduled"
  },
  // Students who have paid and can access this class
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  maxStudents: {
    type: Number,
    default: 50
  },
  recordingUrl: {
    type: String,
    default: ""
  }
}, { timestamps: true });

// Index for efficient queries
scheduledClassSchema.index({ teacher: 1, date: 1 });
scheduledClassSchema.index({ subject: 1, classLevel: 1, date: 1 });
scheduledClassSchema.index({ teacher: 1, subject: 1, classLevel: 1 });
scheduledClassSchema.index({ classLevel: 1, subject: 1 });
scheduledClassSchema.index({ enrolledStudents: 1 });

module.exports = mongoose.model("ScheduledClass", scheduledClassSchema);
