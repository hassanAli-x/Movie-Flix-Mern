const { z } = require("zod");

exports.signupSchema = z.object({
  username: z.string().trim().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and _"),
  name: z.string().trim().min(2).max(50),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

// no min length here, so existing users with 6-char passwords can still log in
exports.loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(72),
});

exports.emailSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

exports.favoriteSchema = z.object({
  movieId: z.number().int().positive(),
});
exports.verifyCodeSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  code: z.string().trim().regex(/^\d{6}$/, "Code must be 6 digits"),
});