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
import {
  getPopularMovies,
  searchMovies,
  discoverMovies,
  getGenres,
  getMovieById,
  getPosterUrl,
} from "../services/tmdb";

const DEFAULT_SORT = "popularity.desc";
const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Most popular" },
  { value: "vote_average.desc", label: "Top rated" },
  { value: "primary_release_date.desc", label: "Newest first" },
  { value: "primary_release_date.asc", label: "Oldest first" },
];

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

  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(""); // "" = all genres
  const [sortBy, setSortBy] = useState(DEFAULT_SORT);

  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favoriteMovies, setFavoriteMovies] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  const observerRef = useRef(null);

  const isFiltered = selectedGenre !== "" || sortBy !== DEFAULT_SORT;

  // Load the genre list once (if it fails, the page still works without filters)
  useEffect(() => {
    getGenres().then(setGenres).catch(() => {});
  }, []);

  // Reset to page 1 whenever the search, genre, or sort changes
  useEffect(() => {
    setMovies([]);
    setPage(1);
    setTotalPages(1);
  }, [searchQuery, selectedGenre, sortBy]);

  // Fetch movies (skip entirely while viewing favorites)
  useEffect(() => {
    if (showFavoritesOnly) return;

    let cancelled = false; // ignore responses from outdated requests

    async function loadMovies() {
      page === 1 ? setLoading(true) : setLoadingMore(true);
      setError("");
      try {
        let data;
        if (searchQuery) {
          data = await searchMovies(searchQuery, page);
        } else if (selectedGenre !== "" || sortBy !== DEFAULT_SORT) {
          data = await discoverMovies({ page, genre: selectedGenre, sortBy });
        } else {
          data = await getPopularMovies(page);
        }

        if (cancelled) return;
        setMovies((prev) => (page === 1 ? data.results : [...prev, ...data.results]));
        setTotalPages(data.total_pages);
      } catch (err) {
        if (!cancelled) setError("Couldn't load movies. Check your API key and connection.");
      } finally {
        if (!cancelled) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    }

    const delay = setTimeout(loadMovies, page === 1 ? 400 : 0);
    return () => {
      cancelled = true;
      clearTimeout(delay);
    };
  }, [page, searchQuery, selectedGenre, sortBy, showFavoritesOnly]);

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
        setFavoriteMovies(results.filter(Boolean));
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

  // IntersectionObserver for infinite scroll
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

  const clearFilters = () => {
    setSelectedGenre("");
    setSortBy(DEFAULT_SORT);
  };

  const featuredMovies = movies.slice(0, 5);
  const visibleMovies = showFavoritesOnly ? favoriteMovies : movies;
  const isLoadingCurrentView = showFavoritesOnly ? loadingFavorites : loading;
  const showFilterBar = !searchQuery && !showFavoritesOnly;

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {!searchQuery && !showFavoritesOnly && !isFiltered && featuredMovies.length > 0 && (
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
        <div className="flex items-center justify-between mb-6">
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
              Logout
            </button>
          </div>
        </div>

        {showFilterBar && (
          <div className="mb-8 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <label htmlFor="sort" className="text-zinc-400 text-sm">
                  Sort by
                </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-zinc-800 text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {isFiltered && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-red-500 hover:text-red-400 transition"
                >
                  Clear filters
                </button>
              )}
            </div>

            {genres.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedGenre("")}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition ${
                    selectedGenre === ""
                      ? "bg-red-600 text-white"
                      : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                  }`}
                >
                  All
                </button>
                {genres.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGenre(g.id)}
                    className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition ${
                      selectedGenre === g.id
                        ? "bg-red-600 text-white"
                        : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                    }`}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

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