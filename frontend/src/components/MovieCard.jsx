import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useFavorites } from "../context/FavoritesContext";
import { getPosterUrl } from "../services/tmdb";

function MovieCard({ movie }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(movie.id);

  return (
    <div className="bg-zinc-900 rounded-xl overflow-hidden shadow-lg hover:scale-105 transition duration-300 relative">
      <Link to={`/movie/${movie.id}`}>
        <img
          src={getPosterUrl(movie.poster_path)}
          alt={movie.title}
          className="w-full h-80 object-cover"
        />
      </Link>

      <button
        onClick={() => toggleFavorite(movie.id)}
        className="absolute top-3 right-3 bg-black/60 rounded-full p-2 hover:bg-black/80 transition"
      >
        <Heart
          size={20}
          className={favorited ? "fill-red-500 text-red-500" : "text-white"}
        />
      </button>

      <div className="p-4">
        <Link to={`/movie/${movie.id}`}>
          <h3 className="text-white font-semibold text-lg truncate hover:text-red-500 transition">
            {movie.title}
          </h3>
        </Link>
        <div className="flex items-center justify-between mt-1">
          <span className="text-zinc-400 text-sm">
            {movie.release_date?.slice(0, 4) || "N/A"}
          </span>
          <span className="text-yellow-500 text-sm font-medium">
            ★ {movie.vote_average?.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default MovieCard;