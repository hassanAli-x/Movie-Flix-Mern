import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart } from "lucide-react";
import { useFavorites } from "../context/FavoritesContext";
import { getMovieById, getPosterUrl } from "../services/tmdb";

function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMovie() {
      setLoading(true);
      setError("");
      try {
        const data = await getMovieById(id);
        setMovie(data);
      } catch (err) {
        setError("Couldn't load this movie.");
      } finally {
        setLoading(false);
      }
    }
    loadMovie();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-400 text-lg">Loading...</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-400 text-lg">{error || "Movie not found."}</p>
      </div>
    );
  }

  const favorited = isFavorite(movie.id);

  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <img
          src={getPosterUrl(movie.poster_path)}
          alt={movie.title}
          className="w-full rounded-xl shadow-2xl md:col-span-1"
        />

        <div className="md:col-span-2">
          <h1 className="text-4xl font-bold text-white mb-2">{movie.title}</h1>

          <div className="flex items-center gap-4 text-zinc-400 mb-6">
            <span>{movie.release_date?.slice(0, 4)}</span>
            <span>•</span>
            <span>{movie.genres?.map((g) => g.name).join(", ")}</span>
            <span>•</span>
            <span className="text-yellow-500">
              ★ {movie.vote_average?.toFixed(1)}
            </span>
          </div>

          <p className="text-zinc-300 leading-relaxed mb-8">{movie.overview}</p>

          <button
            onClick={() => toggleFavorite(movie.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
              favorited
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-zinc-800 hover:bg-zinc-700 text-white"
            }`}
          >
            <Heart size={20} className={favorited ? "fill-white" : ""} />
            {favorited ? "Remove from Favorites" : "Add to Favorites"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MovieDetail;