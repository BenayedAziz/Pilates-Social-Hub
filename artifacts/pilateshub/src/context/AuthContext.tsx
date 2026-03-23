import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const TOKEN_KEY = "pilateshub-token";

interface AuthUser {
  id: number;
  name: string;
  email: string;
  initials: string;
  level: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MOCK_USER: AuthUser = {
  id: 1,
  name: "Emma D",
  email: "emma@example.com",
  initials: "ED",
  level: "Advanced",
};

/**
 * Convert an API user response (which uses displayName) to the
 * frontend AuthUser shape (which uses name + initials).
 */
function toAuthUser(apiUser: any): AuthUser {
  const name = apiUser.displayName ?? apiUser.name ?? "User";
  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return {
    id: apiUser.id,
    name,
    email: apiUser.email,
    initials,
    level: apiUser.level ?? "Beginner",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  // On mount, try to restore session from stored JWT
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setInitializing(false);
      return;
    }

    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Token invalid");
        return res.json();
      })
      .then((data) => {
        setUser(toAuthUser(data));
      })
      .catch(() => {
        // Token is invalid or API is not available — clear it
        localStorage.removeItem(TOKEN_KEY);
      })
      .finally(() => {
        setInitializing(false);
      });
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Login failed" }));
        throw new Error(error.message);
      }

      const { user: apiUser, token } = await res.json();
      localStorage.setItem(TOKEN_KEY, token);
      setUser(toAuthUser(apiUser));
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Signup failed" }));
        throw new Error(error.message);
      }

      const { user: apiUser, token } = await res.json();
      localStorage.setItem(TOKEN_KEY, token);
      setUser(toAuthUser(apiUser));
      return true;
    } catch (error) {
      console.error("Signup failed:", error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("pilateshub-onboarded");
    localStorage.removeItem("pilateshub-preferences");
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, login, signup, logout }),
    [user, login, signup, logout],
  );

  // While checking for an existing token, don't render children
  // (prevents flash of login page)
  if (initializing) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
