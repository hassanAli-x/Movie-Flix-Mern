const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/original";

export function getPosterUrl(path) {
  return path ? `${IMAGE_BASE}${path}` : "https://placehold.co/500x750?text=No+Image";
}

export async function getPopularMovies(page = 1) {
  const res = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`);
  if (!res.ok) throw new Error("Failed to fetch popular movies");
  return res.json(); // now returns { results, page, total_pages }
}

export async function searchMovies(query, page = 1) {
  const res = await fetch(
    `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
  );
  if (!res.ok) throw new Error("Failed to search movies");
  return res.json();
}

export async function getMovieById(id) {
  const res = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}`);
  if (!res.ok) throw new Error("Failed to fetch movie details");
  return res.json();
}
export async function getGenres() {
  const res = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}`);
  if (!res.ok) throw new Error("Failed to fetch genres");
  const data = await res.json();
  return data.genres; // [{ id, name }]
}

export async function discoverMovies({ page = 1, genre = "", sortBy = "popularity.desc" } = {}) {
  const params = new URLSearchParams({
    api_key: API_KEY,
    page: String(page),
    sort_by: sortBy,
    include_adult: "false",
  });

  if (genre) params.set("with_genres", String(genre));

  // Without a minimum vote count, "top rated" fills up with obscure movies that have 1 vote
  if (sortBy.startsWith("vote_average")) {
    params.set("vote_count.gte", "300");
  }
  // Don't list unreleased movies when sorting by date
  if (sortBy.startsWith("primary_release_date")) {
    params.set("primary_release_date.lte", new Date().toISOString().slice(0, 10));
    params.set("vote_count.gte", "20");
  }

  const res = await fetch(`${BASE_URL}/discover/movie?${params}`);
  if (!res.ok) throw new Error("Failed to fetch movies");
  return res.json(); // { results, page, total_pages }
}