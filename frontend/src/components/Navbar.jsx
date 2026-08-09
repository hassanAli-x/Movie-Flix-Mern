import { Search } from "lucide-react";
import { Link } from "react-router-dom";

function Navbar({ searchQuery, onSearchChange }) {
  return (
    <nav className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 px-6 py-4 flex items-center gap-6">
      <Link to="/" className="flex items-center gap-2 shrink-0">
        <span className="text-red-600 font-extrabold text-2xl tracking-tight">
          MOVIE<span className="text-white">FLIX</span>
        </span>
      </Link>

      <div className="relative flex-1 max-w-md">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search movies..."
          className="w-full rounded-lg bg-zinc-800 pl-10 pr-4 py-2.5 text-white placeholder-zinc-400 outline-none focus:ring-2 focus:ring-red-500 transition"
        />
      </div>
    </nav>
  );
}

export default Navbar;