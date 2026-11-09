const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { z } = require("zod");
const User = require("../../models/User");
const sendVerificationCode = require("../utils/sendEmail");
const { signupSchema, loginSchema, emailSchema, verifyCodeSchema } = require("../utils/validators");

const CODE_TTL = 10 * 60 * 1000;      // code valid for 10 minutes
const RESEND_COOLDOWN = 60 * 1000;    // 1 minute between emails
const MAX_ATTEMPTS = 5;               // wrong guesses allowed per code

function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function handleError(res, err, fallback) {
  if (err instanceof z.ZodError) {
    return res.status(400).json({ message: err.issues[0].message });
  }
  if (err.code === 11000) {
    return res.status(400).json({ message: "Email or username already in use" });
  }
  console.error(fallback, err);
  return res.status(500).json({ message: fallback });
}

function hashCode(code) {
  return crypto.createHmac("sha256", process.env.JWT_SECRET).update(code).digest("hex");
}

async function issueCode(user) {
  const code = String(crypto.randomInt(100000, 1000000));
  user.verificationCodeHash = hashCode(code);
  user.verificationCodeExpires = Date.now() + CODE_TTL;
  user.verificationAttempts = 0;
  user.lastCodeSentAt = Date.now();
  await user.save();
  await sendVerificationCode(user.email, user.name, code);
}

exports.signup = async (req, res) => {
  try {
    const { username, name, email, password } = signupSchema.parse(req.body);
    const hashedPassword = await bcrypt.hash(password, 12);

    let user = await User.findOne({ email });

    if (user && user.isVerified) {
      return res.status(400).json({ message: "Email or username already in use" });
    }

    if (user) {
      // unverified account with this email: let them retry
      if (user.lastCodeSentAt && Date.now() - user.lastCodeSentAt < RESEND_COOLDOWN) {
        return res.status(429).json({ message: "Please wait a minute before trying again" });
      }
      const taken = await User.findOne({ username, _id: { $ne: user._id } });
      if (taken) return res.status(400).json({ message: "Email or username already in use" });
      user.username = username;
      user.name = name;
      user.password = hashedPassword;
    } else {
      const taken = await User.findOne({ username });
      if (taken) return res.status(400).json({ message: "Email or username already in use" });
      user = new User({ username, name, email, password: hashedPassword, isVerified: false });
    }

    await issueCode(user);
    res.status(201).json({ requiresVerification: true, email });
  } catch (err) {
    handleError(res, err, "Signup failed");
  }
};

exports.verifyCode = async (req, res) => {
  try {
    const { email, code } = verifyCodeSchema.parse(req.body);
    const user = await User.findOne({ email });

    if (!user || user.isVerified || !user.verificationCodeHash) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }
    if (user.verificationCodeExpires < Date.now()) {
      return res.status(400).json({ message: "Code expired. Please request a new one." });
    }
    if (user.verificationAttempts >= MAX_ATTEMPTS) {
      return res.status(429).json({ message: "Too many attempts. Please request a new code." });
    }

    const a = Buffer.from(hashCode(code));
    const b = Buffer.from(user.verificationCodeHash);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      user.verificationAttempts += 1;
      await user.save();
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    user.isVerified = true;
    user.verificationCodeHash = undefined;
    user.verificationCodeExpires = undefined;
    user.verificationAttempts = 0;
    await user.save();

    res.json({
      token: generateToken(user._id),
      user: { id: user._id, username: user.username, name: user.name, email: user.email },
    });
  } catch (err) {
    handleError(res, err, "Verification failed");
  }
};

exports.resendCode = async (req, res) => {
  try {
    const { email } = emailSchema.parse(req.body);
    const user = await User.findOne({ email });

    if (user && !user.isVerified) {
      if (user.lastCodeSentAt && Date.now() - user.lastCodeSentAt < RESEND_COOLDOWN) {
        return res.status(429).json({ message: "Please wait a minute before requesting another code" });
      }
      await issueCode(user);
    }
    res.json({ message: "If that account needs verification, a new code has been sent." });
  } catch (err) {
    handleError(res, err, "Failed to send code");
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email first",
        requiresVerification: true,
        email: user.email,
      });
    }

    res.json({
      token: generateToken(user._id),
      user: { id: user._id, username: user.username, name: user.name, email: user.email },
    });
  } catch (err) {
    handleError(res, err, "Login failed");
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      "-password -verificationCodeHash -verificationCodeExpires -verificationAttempts -lastCodeSentAt"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    handleError(res, err, "Failed to fetch user");
  }
};