const mongoose = require("mongoose");

const subSubjectSchema = new mongoose.Schema({
  id: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  price: { type: Number, default: 0, min: 0 }
}, { _id: false });

const courseSchema = new mongoose.Schema({
  courseId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: "",
    trim: true
  },
  icon: {
    type: String,
    default: "",
    trim: true
  },
  subSubjects: {
    type: [subSubjectSchema],
    default: []
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Course", courseSchema);
