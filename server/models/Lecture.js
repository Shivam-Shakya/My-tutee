const mongoose = require("mongoose");

const lectureFileSchema = new mongoose.Schema({
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
    default: "application/octet-stream"
  },
  size: {
    type: Number,
    default: 0
  }
}, { _id: false });

const lectureSchema = new mongoose.Schema({
  teacher: {
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
    trim: true
  },
  description: {
    type: String,
    default: "",
    trim: true
  },
  videoType: {
    type: String,
    enum: ["file", "link"],
    required: true
  },
  videoLink: {
    type: String,
    default: ""
  },
  videoFile: {
    type: lectureFileSchema,
    default: null
  },
  materials: {
    type: [lectureFileSchema],
    default: []
  },
  status: {
    type: String,
    enum: ["published", "archived"],
    default: "published"
  }
}, { timestamps: true });

lectureSchema.index({ teacher: 1, classLevel: 1, subject: 1, createdAt: -1 });
lectureSchema.index({ classLevel: 1, subject: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("Lecture", lectureSchema);