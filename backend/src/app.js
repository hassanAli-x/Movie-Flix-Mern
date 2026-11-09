const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const favoritesRoutes = require("./routes/favoritesRoutes");

const app = express();
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

app.set("trust proxy", 1); // needed on Render for correct client IPs

app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(cors({ origin: process.env.FRONTEND_URL })); // https://movie-flix-mern.vercel.app in production

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });
const emailLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5 });

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/signup", authLimiter);
app.use("/api/auth/resend-verification", emailLimiter);

app.use(cors({
  origin: ["http://localhost:5173", "https://movie-flix-mern.vercel.app"],
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is working!");
});

app.use("/api/auth", authRoutes);
app.use("/api/favorites", favoritesRoutes);

module.exports = app;