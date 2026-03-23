import { createContext, useContext, useMemo, useState } from "react";

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
  name: "Sarah Johnson",
  email: "sarah@example.com",
  initials: "SJ",
  level: "Advanced",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(MOCK_USER); // Start logged in for dev

  const login = async (email: string, _password: string): Promise<boolean> => {
    // Mock login - simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    setUser({ ...MOCK_USER, email });
    return true;
  };

  const signup = async (name: string, email: string, _password: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    setUser({ id: Date.now(), name, email, initials, level: "Beginner" });
    return true;
  };

  const logout = () => setUser(null);

  const value = useMemo(() => ({ user, isAuthenticated: !!user, login, signup, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
