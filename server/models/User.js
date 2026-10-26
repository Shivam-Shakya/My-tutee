const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  emailVerified: { type: Boolean, default: false },
  lastLoginAt: { type: Date, default: null },
  phone: { type: String, default: "" },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["student", "teacher", "parent", "admin"],
    required: true
  },

  // Student-specific fields
  classLevel: {
    type: String,
    enum: ["9", "10", "11", "12", "Graduation", "Post Graduation", ""],
    default: ""
  },

  // Teacher-specific fields
  subject: { type: String, default: "" },

  // Parent-specific fields
  studentName: { type: String, default: "" },
  studentClassName: { type: String, default: "" },
  studentEmail: { type: String, default: "" },  // Student email for linking
  linkedStudentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },  // Reference to linked student
  studentLinkingStatus: { type: String, enum: ["pending", "linked", "failed"], default: "pending" },  // Status of linking
  studentLinkingError: { type: String, default: "" },  // Error message if linking fails

  subjects: [String],
  enrolledCourses: [
    {
      courseId: Number,
      courseName: String,
      subject: String,
      enrolledAt: { type: Date, default: Date.now }
    }
  ],
  // User profile fields (flexible schema for teacher/student/parent)
  profile: { type: mongoose.Schema.Types.Mixed, default: {} },
  profileCompleted: { type: Boolean, default: false },

  // Notifications
  notifications: [{
    type: { type: String },
    message: { type: String },
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    subject: { type: String },
    slot: { type: mongoose.Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
  }]
}, { timestamps: true });

// Compound unique index: same email can exist for different roles (student/parent)
// But same email+role combination must be unique
userSchema.index({ email: 1, role: 1 }, { unique: true });

module.exports = mongoose.model("User", userSchema);
