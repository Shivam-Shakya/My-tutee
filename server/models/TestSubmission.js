const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  questionIndex: {
    type: Number,
    required: true,
    min: 0
  },
  selectedOption: {
    type: String,
    enum: ["A", "B", "C", "D", ""],
    required: true
  },
  isCorrect: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const testSubmissionSchema = new mongoose.Schema({
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Test",
    required: true
  },
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
  answers: {
    type: [answerSchema],
    default: []
  },
  totalQuestions: {
    type: Number,
    default: 0,
    min: 0
  },
  correctAnswers: {
    type: Number,
    default: 0,
    min: 0
  },
  incorrectAnswers: {
    type: Number,
    default: 0,
    min: 0
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

testSubmissionSchema.index({ test: 1, student: 1 }, { unique: true });
testSubmissionSchema.index({ teacher: 1, submittedAt: -1 });

module.exports = mongoose.model("TestSubmission", testSubmissionSchema);