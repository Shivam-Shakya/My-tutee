const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  channel: {
    type: String,
    enum: ["email", "phone"],
    required: true,
    index: true
  },
  identifier: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  purpose: {
    type: String,
    enum: ["signup-email", "signup-email-verified", "forgot-password", "phone-verification"],
    required: true,
    index: true
  },
  otpHash: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  attempts: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

otpSchema.index({ channel: 1, identifier: 1, purpose: 1 }, { unique: true });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Otp", otpSchema);
