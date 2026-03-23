import { Activity, Compass, LogOut, Moon, ShoppingBag, Sun, Trophy, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hooks/use-theme";

const tabs = [
  { path: "/", icon: Compass, label: "Explore" },
  { path: "/feed", icon: Activity, label: "Feed" },
  { path: "/me", icon: User, label: "Me" },
  { path: "/store", icon: ShoppingBag, label: "Shop" },
  { path: "/challenges", icon: Trophy, label: "Challenges" },
];

export function SideNav() {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <aside className="w-56 h-screen bg-card border-r border-border/40 flex flex-col py-6">
      <div className="px-5 mb-8 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
          <Activity className="w-4 h-4" />
        </div>
        <span className="font-studio text-lg text-foreground" style={{ fontWeight: 600, letterSpacing: "-0.02em" }}>
          PilatesHub
        </span>
      </div>

      <nav className="flex-1 flex flex-col gap-1 px-3">
        {tabs.map((tab) => {
          const isActive = location === tab.path;
          return (
            <Link key={tab.path} href={tab.path}>
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <tab.icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
                <span className="text-sm">{tab.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 mb-4">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all w-full text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          <span className="text-sm">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
        </button>
      </div>

      <div className="px-5 mt-auto">
        <Link href="/me">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
              {user?.initials || "?"}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{user?.name || "Guest"}</p>
              <p className="text-xs text-muted-foreground">{user?.level || "Unknown"} Level</p>
            </div>
          </div>
        </Link>
        <button
          type="button"
          onClick={logout}
          aria-label="Log out"
          className="flex items-center gap-3 px-3 py-2 rounded-xl w-full text-muted-foreground/60 hover:bg-destructive/8 hover:text-destructive transition-colors mt-1"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-xs font-semibold">Log Out</span>
        </button>
      </div>
    </aside>
  );
}
