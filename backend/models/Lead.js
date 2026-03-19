const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
  },
  status: {
    type: String,
    enum: ["New", "Engaged", "Proposal Sent", "Closed-Won", "Closed-Lost"],
    default: "New",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Lead", leadSchema);
