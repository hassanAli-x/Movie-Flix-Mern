import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function VerifyEmail() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { verifyCode, resendCode } = useAuth();

  const email = state?.email;
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  if (!email) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-zinc-900 rounded-2xl shadow-2xl p-8 text-center">
          <p className="text-zinc-400 mb-6">
            Sign up or log in first so we know which email to verify.
          </p>
          <Link to="/signup" className="text-red-500 hover:text-red-400 transition">
            Go to Sign up
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setSubmitting(true);
    try {
      await verifyCode({ email, code });
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setInfo("");
    try {
      const message = await resendCode(email);
      setInfo(message);
      setCooldown(60);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-zinc-900 rounded-2xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-white text-center">Verify your email</h1>
        <p className="text-zinc-400 text-center mt-2 mb-8">
          We sent a 6-digit code to <span className="text-white">{email}</span>.
          Check your spam folder too.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="w-full rounded-lg bg-zinc-800 px-4 py-3 text-white text-center text-2xl tracking-[0.5em] placeholder-zinc-600 outline-none focus:ring-2 focus:ring-red-500"
            required
          />

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          {info && <p className="text-sm text-green-500 text-center">{info}</p>}

          <button
            type="submit"
            disabled={submitting || code.length !== 6}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed transition duration-300 text-white font-semibold py-3 rounded-lg"
          >
            {submitting ? "Verifying..." : "Verify"}
          </button>
        </form>

        <div className="text-center text-zinc-400 mt-6">
          Didn't get a code?{" "}
          <button
            onClick={handleResend}
            disabled={cooldown > 0}
            className="text-red-500 hover:text-red-400 disabled:text-zinc-500 disabled:cursor-not-allowed transition"
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
          </button>
        </div>

        <p className="text-center mt-4">
          <Link to="/login" className="text-zinc-500 hover:text-zinc-300 transition text-sm">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default VerifyEmail;