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

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  options: {
    type: [String],
    validate: {
      validator(value) {
        return Array.isArray(value) && value.length === 4 && value.every((option) => String(option || "").trim());
      },
      message: "Each question must include exactly four non-empty options"
    },
    required: true
  },
  solution: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  correctAnswer: {
    type: String,
    enum: ["A", "B", "C", "D"],
    required: true
  },
  marks: {
    type: Number,
    default: 1,
    min: 1
  }
}, { _id: false });

const testSchema = new mongoose.Schema({
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
    trim: true,
    maxlength: 160
  },
  description: {
    type: String,
    default: "",
    trim: true,
    maxlength: 5000
  },
  durationMinutes: {
    type: Number,
    required: true,
    min: 1,
    default: 60
  },
  testDateTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  questionFile: {
    type: fileSchema,
    default: null
  },
  questions: {
    type: [questionSchema],
    default: []
  },
  isVisible: {
    type: Boolean,
    default: false
  },
  assignedStudents: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    default: []
  },
  status: {
    type: String,
    enum: ["draft", "published"],
    default: "published"
  }
}, { timestamps: true });

testSchema.index({ teacher: 1, createdAt: -1 });
testSchema.index({ subject: 1, classLevel: 1, testDateTime: 1 });
testSchema.index({ assignedStudents: 1, isVisible: 1 });

module.exports = mongoose.model("Test", testSchema);