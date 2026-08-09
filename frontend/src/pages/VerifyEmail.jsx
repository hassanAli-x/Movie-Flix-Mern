import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function verify() {
      if (!token) {
        setStatus("error");
        setMessage("No verification token found in the link.");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/auth/verify/${token}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.message);

        setStatus("success");
        setMessage(data.message);
      } catch (err) {
        setStatus("error");
        setMessage(err.message);
      }
    }

    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-zinc-900 rounded-2xl shadow-2xl p-8 text-center">
        {status === "verifying" && (
          <p className="text-zinc-400">Verifying your email...</p>
        )}

        {status === "success" && (
          <>
            <h1 className="text-2xl font-bold text-white mb-3">Email Verified</h1>
            <p className="text-zinc-400 mb-6">{message}</p>
            <Link
              to="/login"
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition"
            >
              Go to Login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-2xl font-bold text-white mb-3">Verification Failed</h1>
            <p className="text-red-500 mb-6">{message}</p>
            <Link
              to="/login"
              className="text-red-500 hover:text-red-400 transition"
            >
              Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;