const express = require("express");
const router = express.Router();
const { getFavorites, toggleFavorite } = require("../controllers/favoritesController");
const protect = require("../../middleware/auth");

router.get("/", protect, getFavorites);
router.post("/toggle", protect, toggleFavorite);

module.exports = router;