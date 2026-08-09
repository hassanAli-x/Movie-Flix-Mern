const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const favoritesRoutes = require("./routes/favoritesRoutes");

const app = express();

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