const User = require("../../models/User");

exports.getFavorites = async (req, res) => {
  const user = await User.findById(req.userId);
  res.json(user.favorites);
};

exports.toggleFavorite = async (req, res) => {
  const { movieId } = req.body;
  const user = await User.findById(req.userId);

  const exists = user.favorites.includes(movieId);
  if (exists) {
    user.favorites = user.favorites.filter((id) => id !== movieId);
  } else {
    user.favorites.push(movieId);
  }

  await user.save();
  res.json(user.favorites);
};