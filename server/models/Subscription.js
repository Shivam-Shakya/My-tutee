const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    index: true,
  },
  source: {
    type: String,
    default: "newsletter",
    trim: true,
  },
  status: {
    type: String,
    enum: ["active", "unsubscribed"],
    default: "active",
  },
}, { timestamps: true });

module.exports = mongoose.model("Subscription", subscriptionSchema);
