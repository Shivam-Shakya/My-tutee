const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  paymentCategory: {
    type: String,
    enum: ["teacher-subscription", "course-package"],
    default: "teacher-subscription"
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: function () {
      return this.paymentCategory === "teacher-subscription";
    }
  },
  subject: {
    type: String,
    required: function () {
      return this.paymentCategory === "teacher-subscription";
    }
  },
  classLevel: {
    type: String,
    enum: ["9", "10", "11", "12", "Graduation", "Post Graduation"],
    required: function () {
      return this.paymentCategory === "teacher-subscription";
    }
  },
  // Payment details
  paymentId: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: "INR"
  },
  paymentMethod: {
    type: String,
    enum: ["card", "upi", "qr", "netbanking", "wallet"],
    default: "card"
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed", "refunded"],
    default: "pending"
  },
  // Payment type: monthly subscription or per-class
  paymentType: {
    type: String,
    enum: ["monthly", "per-class", "package"],
    default: "monthly"
  },
  // Validity period for monthly/package payments
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date,
    required: true
  },
  // Reference to assignment if applicable
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Assignment"
  },
  enrollment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Enrollment",
    default: null
  },
  // Transaction details from payment gateway
  transactionDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Invoice details
  invoiceNumber: {
    type: String,
    default: ""
  },
  invoiceUrl: {
    type: String,
    default: ""
  }
}, { timestamps: true });

// Index for efficient queries
paymentSchema.index({ student: 1, subject: 1, classLevel: 1, status: 1 });
paymentSchema.index({ teacher: 1, status: 1 });
paymentSchema.index({ classLevel: 1, subject: 1 });
paymentSchema.index({ validUntil: 1 });
paymentSchema.index({ enrollment: 1 });

// Check if payment is currently valid
paymentSchema.methods.isValid = function () {
  return this.status === "completed" &&
    new Date() >= new Date(this.validFrom) &&
    new Date() <= new Date(this.validUntil);
};

module.exports = mongoose.model("Payment", paymentSchema);
