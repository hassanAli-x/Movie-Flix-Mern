import { useState, useEffect, useRef, useCallback } from "react";
import { LogOut } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import Navbar from "../components/Navbar";
import MovieCard from "../components/MovieCard";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";
import { getPopularMovies, searchMovies, getMovieById, getPosterUrl } from "../services/tmdb";

function Home() {
  const { user, logout } = useAuth();
  const { favorites } = useFavorites();
  const navigate = useNavigate();

  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favoriteMovies, setFavoriteMovies] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  const observerRef = useRef(null);

  // Reset to page 1 whenever the search query changes
  useEffect(() => {
    setMovies([]);
    setPage(1);
    setTotalPages(1);
  }, [searchQuery]);

  // Fetch popular/search movies (skip entirely while viewing favorites)
  useEffect(() => {
    if (showFavoritesOnly) return;

    async function loadMovies() {
      page === 1 ? setLoading(true) : setLoadingMore(true);
      setError("");
      try {
        const data = searchQuery
          ? await searchMovies(searchQuery, page)
          : await getPopularMovies(page);

        setMovies((prev) => (page === 1 ? data.results : [...prev, ...data.results]));
        setTotalPages(data.total_pages);
      } catch (err) {
        setError("Couldn't load movies. Check your API key and connection.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    }

    const delay = setTimeout(loadMovies, page === 1 ? 400 : 0);
    return () => clearTimeout(delay);
  }, [page, searchQuery, showFavoritesOnly]);

  // Fetch full details for each favorited movie ID whenever favorites view is opened
  useEffect(() => {
    if (!showFavoritesOnly) return;

    async function loadFavoriteMovies() {
      setLoadingFavorites(true);
      setError("");
      try {
        const results = await Promise.all(
          favorites.map((id) => getMovieById(id).catch(() => null))
        );
        setFavoriteMovies(results.filter(Boolean)); // drop any that failed to fetch
      } catch (err) {
        setError("Couldn't load favorite movies.");
      } finally {
        setLoadingFavorites(false);
      }
    }

    if (favorites.length === 0) {
      setFavoriteMovies([]);
      setLoadingFavorites(false);
    } else {
      loadFavoriteMovies();
    }
  }, [showFavoritesOnly, favorites]);

  // IntersectionObserver for infinite scroll (only active for popular/search list)
  const lastMovieRef = useCallback(
    (node) => {
      if (loading || loadingMore || showFavoritesOnly) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && page < totalPages) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loading, loadingMore, page, totalPages, showFavoritesOnly]
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const featuredMovies = movies.slice(0, 5);
  const visibleMovies = showFavoritesOnly ? favoriteMovies : movies;
  const isLoadingCurrentView = showFavoritesOnly ? loadingFavorites : loading;

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {!searchQuery && !showFavoritesOnly && featuredMovies.length > 0 && (
        <Swiper
          navigation={true}
          modules={[Navigation, Autoplay]}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          loop={true}
          className="mySwiper h-[420px] w-full"
        >
          {featuredMovies.map((movie) => (
            <SwiperSlide key={movie.id}>
              <Link to={`/movie/${movie.id}`} className="relative block h-full w-full">
                <img
                  src={getPosterUrl(movie.backdrop_path || movie.poster_path)}
                  alt={movie.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                <div className="absolute bottom-8 left-8 max-w-lg">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {movie.title}
                  </h2>
                  <p className="text-zinc-300 text-sm md:text-base line-clamp-2">
                    {movie.overview}
                  </p>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      <div className="px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">
            Welcome{user?.name ? `, ${user.name}` : ""}
          </h1>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFavoritesOnly((prev) => !prev)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                showFavoritesOnly
                  ? "bg-red-600 text-white"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              {showFavoritesOnly ? "Show All" : "My Favorites"}
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg transition"
            >
              <LogOut size={18} />
              Login
            </button>
          </div>
        </div>

        {isLoadingCurrentView ? (
          <p className="text-zinc-400 text-center mt-20">Loading movies...</p>
        ) : error ? (
          <p className="text-red-500 text-center mt-20">{error}</p>
        ) : visibleMovies.length === 0 ? (
          <p className="text-zinc-400 text-center mt-20">
            {showFavoritesOnly
              ? "You haven't added any favorites yet."
              : "No movies found."}
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {visibleMovies.map((movie, index) => {
                const isLast = !showFavoritesOnly && index === visibleMovies.length - 1;
                return (
                  <div key={movie.id} ref={isLast ? lastMovieRef : null}>
                    <MovieCard movie={movie} />
                  </div>
                );
              })}
            </div>

            {loadingMore && (
              <p className="text-zinc-400 text-center mt-8">Loading more...</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Home;