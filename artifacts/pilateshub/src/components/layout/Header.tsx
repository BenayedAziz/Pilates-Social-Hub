import { Activity, Globe, MessageCircle, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { SearchDialog } from "@/components/SearchDialog";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hooks/use-theme";

export function Header() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const [unreadMessages, setUnreadMessages] = useState(0);

  const toggleLang = () => {
    const newLang = i18n.language === "fr" ? "en" : "fr";
    i18n.changeLanguage(newLang);
    localStorage.setItem("pilateshub-lang", newLang);
  };

  useEffect(() => {
    const token = localStorage.getItem("pilateshub-token");
    if (!token) return; // No auth -- skip unread count
    fetch("/api/messages/unread-count", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        if (typeof data.count === "number") setUnreadMessages(data.count);
      })
      .catch(() => {
        setUnreadMessages(0);
      });
  }, []);

  return (
    <header className="flex items-center justify-between px-5 py-3.5 bg-card sticky top-0 z-40 shadow-[0_1px_0_hsl(var(--border))]">
      <Link href="/">
        <div className="flex items-center gap-2.5 cursor-pointer md:hidden">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
            <Activity className="w-4 h-4" />
          </div>
          <h1 className="font-studio text-lg text-foreground" style={{ fontWeight: 600, letterSpacing: "-0.02em" }}>
            PilatesHub
          </h1>
        </div>
      </Link>
      <div className="flex items-center gap-4">
        <SearchDialog />
        <Link href="/messages">
          <button
            type="button"
            aria-label="Messages"
            className="relative p-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            {unreadMessages > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-primary text-primary-foreground text-[9px] rounded-full flex items-center justify-center border-2 border-card font-bold">
                {unreadMessages}
              </span>
            )}
          </button>
        </Link>
        <button
          type="button"
          onClick={toggleLang}
          aria-label="Toggle language"
          className="p-2 text-muted-foreground hover:text-primary transition-colors text-xs font-bold"
        >
          <Globe className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? t("common.lightMode") : t("common.darkMode")}
          className="p-2 text-muted-foreground hover:text-primary transition-colors md:hidden"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <Link href="/me">
          <button
            type="button"
            aria-label="View profile"
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs hover:ring-2 hover:ring-offset-2 hover:ring-primary/50 transition-all cursor-pointer"
          >
            {user?.initials || "?"}
          </button>
        </Link>
      </div>
    </header>
  );
}
