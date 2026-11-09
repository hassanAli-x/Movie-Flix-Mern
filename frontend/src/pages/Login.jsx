import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [password, setPass] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
    const { login, resendCode } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login({ email, password });
      navigate("/");
    }      catch (err) {
      if (err.needsVerification) {
        // send a fresh code (ignore errors like the 1-minute cooldown) and go verify
        try { await resendCode(err.email); } catch {}
        navigate("/verify-email", { state: { email: err.email } });
        return;
      }
      setError(err.message);
    } finally {}
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-zinc-900 rounded-2xl shadow-2xl p-8 ">
        <h1 className="text-3xl font-bold text-white text-center mb-4">Login</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
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
            placeholder="Password"
            value={password}
            onChange={(e) => setPass(e.target.value)}
            className="w-full rounded-lg bg-zinc-800 px-4 py-3 text-white placeholder-zinc-400 outline-none focus:ring-2 focus:ring-red-500"
            required
          />

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed transition duration-300 text-white font-semibold py-3 rounded-lg"
          >
            {submitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-zinc-400 mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="text-red-500 hover:text-red-400 transition">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;