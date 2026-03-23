import { Activity, Globe, MessageCircle, Moon, ShoppingCart, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";
import { SearchDialog } from "@/components/SearchDialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hooks/use-theme";

export function Header() {
  const { cartItems, cartCount, cartTotal, removeFromCart, clearCart } = useApp();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const [, navigate] = useLocation();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);

  const toggleLang = () => {
    const newLang = i18n.language === "fr" ? "en" : "fr";
    i18n.changeLanguage(newLang);
    localStorage.setItem("pilateshub-lang", newLang);
  };

  useEffect(() => {
    fetch("/api/messages/unread-count")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.count === "number") setUnreadMessages(data.count);
      })
      .catch(() => {
        // Fallback: 3 unread from mock data
        setUnreadMessages(3);
      });
  }, []);

  const handleCheckout = () => {
    setCartOpen(false);
    navigate("/checkout");
  };

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
        <Sheet open={cartOpen} onOpenChange={setCartOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label="Shopping cart"
              className="relative p-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-accent-cta text-white text-xs rounded-full flex items-center justify-center border-2 border-card font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          </SheetTrigger>
          <SheetContent className="bg-background">
            <SheetHeader>
              <SheetTitle className="text-lg font-bold">{t("common.yourCart")}</SheetTitle>
              <SheetDescription>
                {cartCount} {cartCount !== 1 ? t("common.items") : t("common.item")}
              </SheetDescription>
            </SheetHeader>
            <div className="py-6 flex flex-col gap-4">
              {cartItems.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center gap-3 text-muted-foreground">
                  <ShoppingCart className="w-10 h-10 opacity-40" />
                  <p className="text-sm font-medium">{t("common.emptyCart")}</p>
                </div>
              ) : (
                <>
                  {cartItems.map((item) => (
                    <div key={item.product.id} className="flex items-center justify-between gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm leading-tight">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.product.brand} · Qty: {item.qty}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <p className="font-bold text-primary">€{item.product.price * item.qty}</p>
                        <button
                          type="button"
                          aria-label="Remove from cart"
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-muted-foreground/40 hover:text-destructive transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <Separator className="my-2" />
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>{t("common.total")}</span>
                    <span className="text-primary">€{cartTotal}</span>
                  </div>
                  <Button
                    onClick={handleCheckout}
                    className="w-full mt-2 bg-primary hover:bg-primary/85 text-white font-bold shadow-lg"
                  >
                    {t("common.checkout")}
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
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
