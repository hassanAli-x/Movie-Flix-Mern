import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Signup() {
  const [username, setUser] = useState("");
  const [password, setPass] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
       try {
      await signup({ username, name, email, password });
      navigate("/verify-email", { state: { email } });
    } catch (err) {}
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-zinc-900 rounded-2xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-white text-center">Create Account</h1>
        <p className="text-zinc-400 text-center mt-2 mb-8">Sign up to continue</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUser(e.target.value)}
            className="w-full rounded-lg bg-zinc-800 px-4 py-3 text-white placeholder-zinc-400 outline-none focus:ring-2 focus:ring-red-500"
            required
          />
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg bg-zinc-800 px-4 py-3 text-white placeholder-zinc-400 outline-none focus:ring-2 focus:ring-red-500"
            required
          />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg bg-zinc-800 px-4 py-3 text-white placeholder-zinc-400 outline-none focus:ring-2 focus:ring-red-500"
            required
          />
          <input
            type="password"
            placeholder="Password (min 8 characters)"
            value={password}
            onChange={(e) => setPass(e.target.value)}
            className="w-full rounded-lg bg-zinc-800 px-4 py-3 text-white placeholder-zinc-400 outline-none focus:ring-2 focus:ring-red-500"
            required
            minLength={8}
            maxLength={72}
          />

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed transition duration-300 text-white font-semibold py-3 rounded-lg"
          >
            {submitting ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-zinc-400 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-red-500 hover:text-red-400 transition">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;