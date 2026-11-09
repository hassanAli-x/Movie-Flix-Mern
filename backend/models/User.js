const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    favorites: [{ type: Number }],
    isVerified: { type: Boolean, default: false },

    // email verification code
    verificationCodeHash: { type: String },
    verificationCodeExpires: { type: Number },
    verificationAttempts: { type: Number, default: 0 },
    lastCodeSentAt: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);