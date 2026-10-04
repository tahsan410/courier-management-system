import { useCallback, useMemo, useState } from "react";
import { AuthContext } from "./auth-context";

// Read the "exp" claim from the JWT so an expired session is dropped on load.
function isTokenExpired(token) {
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    return payload.exp ? payload.exp * 1000 < Date.now() : false;
  } catch {
    return false;
  }
}

function readStoredSession() {
  try {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");

    if (!savedUser || !savedToken) return null;

    const parsed = JSON.parse(savedUser);

    if (!parsed?.username || !parsed?.role || isTokenExpired(savedToken)) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return null;
    }

    return parsed;
  } catch (error) {
    console.error("Failed to restore authentication:", error);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    return null;
  }
}

export function AuthProvider({ children }) {
  // Lazy initialiser: session is restored synchronously, no flash of logged-out UI.
  const [user, setUser] = useState(() => readStoredSession());
  // Session is restored synchronously above, so `loading` is always false.
  // It is still exposed so existing consumers (ProtectedRoute etc.) keep working.

  const login = useCallback((userData, accessToken) => {
    if (!userData || !accessToken) {
      console.error("Login failed: missing user data or token");
      return false;
    }

    const cleanUser = {
      username: userData.username,
      email: userData.email || "",
      role: userData.role || "user",
    };

    localStorage.setItem("token", accessToken);
    localStorage.setItem("user", JSON.stringify(cleanUser));
    setUser(cleanUser);
    return true;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading: false, login, logout }),
    [user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
