import { Activity, Compass, MessageCircle, ShoppingBag, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";

const tabs = [
  { path: "/", icon: Compass, labelKey: "nav.explore" },
  { path: "/feed", icon: Activity, labelKey: "nav.feed" },
  { path: "/messages", icon: MessageCircle, labelKey: "nav.messages" },
  { path: "/me", icon: User, labelKey: "nav.me" },
  { path: "/store", icon: ShoppingBag, labelKey: "nav.shop" },
];

export function BottomNav() {
  const [location] = useLocation();
  const { t } = useTranslation();

  return (
    <nav
      aria-label="Main navigation"
      className="absolute bottom-0 left-0 w-full bg-card/98 px-3 pt-2.5 pb-6 flex justify-around items-center z-40 border-t border-border/50"
    >
      {tabs.map((tab) => {
        const isActive = location === tab.path;
        return (
          <Link key={tab.path} href={tab.path} aria-label={t(tab.labelKey)}>
            <div
              className={`flex flex-col items-center gap-1 px-5 py-2 transition-all duration-200 cursor-pointer relative ${isActive ? "text-primary" : "text-muted-foreground/50 hover:text-muted-foreground/80"}`}
            >
              <tab.icon
                className={`w-5 h-5 transition-all duration-200 ${isActive ? "stroke-[2.5px]" : "stroke-[1.5px]"}`}
              />
              <span
                className={`text-[10px] tracking-wide transition-all duration-200 ${isActive ? "font-semibold" : "font-medium"}`}
              >
                {t(tab.labelKey)}
              </span>
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-primary" />
              )}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
