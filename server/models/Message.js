const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
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
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  senderRole: {
    type: String,
    enum: ["teacher", "student"],
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  }
}, { timestamps: true });

messageSchema.index({ teacher: 1, createdAt: -1 });
messageSchema.index({ student: 1, createdAt: -1 });
messageSchema.index({ teacher: 1, student: 1, subject: 1, classLevel: 1, createdAt: -1 });

module.exports = mongoose.model("Message", messageSchema);