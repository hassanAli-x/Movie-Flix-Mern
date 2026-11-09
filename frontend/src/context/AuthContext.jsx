import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const API_URL = (import.meta.env.VITE_API_URL || "https://movie-flix-mern.onrender.com").replace(/\/+$/, "");

async function postJson(path, body) {
  const res = await fetch(`${API_URL}/api/auth/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Session expired");
        setUser(await res.json());
      } catch (err) {
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  // Signup no longer logs the user in. They must verify the emailed code first.
  const signup = async ({ username, name, email, password }) => {
    const { res, data } = await postJson("signup", { username, name, email, password });
    if (!res.ok) throw new Error(data.message || "Signup failed");
    return data; // { requiresVerification: true, email }
  };

  const login = async ({ email, password }) => {
    const { res, data } = await postJson("login", { email, password });

    if (!res.ok) {
      const err = new Error(data.message || "Login failed");
      err.needsVerification = data.requiresVerification || false;
      err.email = data.email;
      throw err;
    }

    localStorage.setItem("token", data.token);
    setUser(data.user);
  };

  const verifyCode = async ({ email, code }) => {
    const { res, data } = await postJson("verify-code", { email, code });
    if (!res.ok) throw new Error(data.message || "Verification failed");

    localStorage.setItem("token", data.token);
    setUser(data.user);
  };

  const resendCode = async (email) => {
    const { res, data } = await postJson("resend-code", { email });
    if (!res.ok) throw new Error(data.message || "Could not resend code");
    return data.message;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signup, login, verifyCode, resendCode, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}