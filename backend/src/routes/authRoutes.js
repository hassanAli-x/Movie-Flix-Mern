const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  getMe,
  verifyCode,
  resendCode,
} = require("../controllers/authController");
const protect = require("../../middleware/auth");

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/verify-code", verifyCode);
router.post("/resend-code", resendCode);

module.exports = router;