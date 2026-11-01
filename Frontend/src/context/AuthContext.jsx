/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { fetchCurrentUser, logoutUser } from "../services/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // The user lives only in memory; the backend's httpOnly cookie is the
  // source of truth and is re-verified via /me on every page load.
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Purge tokens left behind by the old localStorage-based auth.
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("session");
    } catch {
      // storage unavailable — nothing to purge
    }

    fetchCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
