const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  getMe,
  verifyEmail,
  resendVerification,
} = require("../controllers/authController");
const protect = require("../../middleware/auth");

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", protect, getMe);
router.get("/verify/:token", verifyEmail);
router.post("/resend-verification", resendVerification);

module.exports = router;