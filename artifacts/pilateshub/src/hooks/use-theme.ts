import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    // v2: reset old dark preference to light default
    const stored = localStorage.getItem("pilates-theme");
    if (stored === "dark" && !localStorage.getItem("pilates-theme-v2")) {
      localStorage.setItem("pilates-theme-v2", "1");
      localStorage.setItem("pilates-theme", "light");
      return "light";
    }
    localStorage.setItem("pilates-theme-v2", "1");
    if (stored === "dark" || stored === "light") return stored;
    return "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("pilates-theme", theme);
  }, [theme]);

  const toggleTheme = () => setThemeState((prev) => (prev === "light" ? "dark" : "light"));

  return { theme, setTheme: setThemeState, toggleTheme };
}
