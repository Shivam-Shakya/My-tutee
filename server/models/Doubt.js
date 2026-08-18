const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    default: 0
  }
}, { _id: false });

const doubtSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  classLevel: {
    type: String,
    enum: ["9", "10", "11", "12", "Graduation", "Post Graduation"],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 160
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  attachment: {
    type: fileSchema,
    default: null
  },
  status: {
    type: String,
    enum: ["pending", "solved"],
    default: "pending"
  },
  solution: {
    type: String,
    trim: true,
    default: ""
  },
  solvedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

doubtSchema.index({ teacher: 1, status: 1, createdAt: -1 });
doubtSchema.index({ student: 1, status: 1, createdAt: -1 });
doubtSchema.index({ teacher: 1, student: 1, subject: 1, classLevel: 1, createdAt: -1 });

module.exports = mongoose.model("Doubt", doubtSchema);