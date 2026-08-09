import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const FavoritesContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL;

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load favorites from backend whenever the logged-in user changes
  useEffect(() => {
    async function loadFavorites() {
      if (!user) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${API_URL}/api/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load favorites");
        const data = await res.json();
        setFavorites(data);
      } catch (err) {
        console.error(err);
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    }

    loadFavorites();
  }, [user]);

  const toggleFavorite = async (movieId) => {
    if (!user) return;

    const token = localStorage.getItem("token");

    // optimistic update — flip it locally immediately, correct if backend disagrees
    const wasFavorite = favorites.includes(movieId);
    setFavorites((prev) =>
      wasFavorite ? prev.filter((id) => id !== movieId) : [...prev, movieId]
    );

    try {
      const res = await fetch(`${API_URL}/api/favorites/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ movieId }),
      });

      if (!res.ok) throw new Error("Failed to update favorite");

      const data = await res.json(); // backend's authoritative favorites array
      setFavorites(data);
    } catch (err) {
      console.error(err);
      // revert optimistic update on failure
      setFavorites((prev) =>
        wasFavorite ? [...prev, movieId] : prev.filter((id) => id !== movieId)
      );
    }
  };

  const isFavorite = (movieId) => favorites.includes(movieId);

  return (
    <FavoritesContext.Provider value={{ favorites, loading, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}