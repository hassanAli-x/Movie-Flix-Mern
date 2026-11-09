const User = require("../../models/User");
const { favoriteSchema } = require("../utils/validators");
const { z } = require("zod");

exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("favorites");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch favorites" });
  }
};

exports.toggleFavorite = async (req, res) => {
  try {
    const { movieId } = favoriteSchema.parse(req.body);
    const user = await User.findById(req.userId).select("favorites");
    if (!user) return res.status(404).json({ message: "User not found" });

    const exists = user.favorites.map(Number).includes(movieId);
    if (!exists && user.favorites.length >= 500) {
      return res.status(400).json({ message: "Favorites limit reached" });
    }

    const updated = await User.findByIdAndUpdate(
      req.userId,
      exists ? { $pull: { favorites: movieId } } : { $addToSet: { favorites: movieId } },
      { new: true }
    ).select("favorites");

    res.json(updated.favorites);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ message: "Invalid movie id" });
    res.status(500).json({ message: "Failed to update favorites" });
  }
};