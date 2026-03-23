import { BadgeCheck, ChevronRight, Heart, ShoppingBag, Star } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/context/AppContext";
import { BRANDS, PRODUCTS as FALLBACK_PRODUCTS } from "@/data/mock-data";
import { useProducts } from "@/hooks/use-api";

const CATEGORIES = [
  { key: "All", labelKey: "shop.all", emoji: "" },
  { key: "Habitat", labelKey: "shop.habitat", emoji: "\u{1F3E0}" },
  { key: "Alimentation", labelKey: "shop.food", emoji: "\u{1F957}" },
  { key: "Machines", labelKey: "shop.machines", emoji: "\u{1F3CB}\uFE0F" },
  { key: "Goodies", labelKey: "shop.goodies", emoji: "\u{1F381}" },
  { key: "Apparel", labelKey: "shop.apparel", emoji: "\u{1F457}" },
  { key: "Accessoires", labelKey: "shop.accessories", emoji: "\u{1F9D8}" },
];

const BADGE_COLORS: Record<string, string> = {
  New: "bg-primary text-primary-foreground",
  "Best Seller": "bg-accent-cta text-white",
  "Promo -20%": "bg-destructive text-white",
  Exclusif: "bg-foreground text-background",
};

export default function StorePage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const { wishlist, toggleWishlist, addToCart } = useApp();
  const { t } = useTranslation();
  const { data: apiProducts } = useProducts();
  const allProducts = apiProducts || FALLBACK_PRODUCTS;

  const filteredProducts =
    activeCategory === "All" ? allProducts : allProducts.filter((p) => p.category === activeCategory);

  const getCategoryCount = (key: string) => {
    if (key === "All") return allProducts.length;
    return allProducts.filter((p) => p.category === key).length;
  };

  return (
    <div className="bg-background min-h-full animate-in fade-in duration-300">
      {/* Category filter */}
      <div className="px-4 py-3 bg-card sticky top-0 z-10 border-b border-border/40">
        <div role="tablist" className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {CATEGORIES.map((cat) => (
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === cat.key}
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-4 py-1.5 rounded-full whitespace-nowrap text-sm font-semibold transition-all duration-200 flex-shrink-0 border
                ${activeCategory === cat.key ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-muted/60 text-muted-foreground border-border/40 hover:bg-muted hover:text-foreground"}`}
            >
              {cat.emoji ? `${cat.emoji} ` : ""}
              {t(cat.labelKey)} ({getCategoryCount(cat.key)})
            </button>
          ))}
        </div>
      </div>

      {/* Our Brands — horizontal scroll */}
      <div className="px-5 pt-5 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-foreground text-base">{t("shop.ourBrands")}</h2>
          <Link href="/brands">
            <span className="text-xs font-semibold text-primary flex items-center gap-0.5 hover:underline cursor-pointer">
              {t("shop.viewAll")} <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
          {BRANDS.map((brand) => (
            <Link key={brand.id} href={`/brand/${brand.slug}`}>
              <div className="flex-shrink-0 w-36 rounded-2xl overflow-hidden bg-card shadow-sm border border-border/40 hover:shadow-md transition-all duration-300 cursor-pointer group">
                <div className="h-20 relative overflow-hidden">
                  <img
                    src={brand.coverImageUrl}
                    alt={brand.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-2 left-2.5">
                    <div className="w-8 h-8 rounded-lg bg-card/95 backdrop-blur-sm flex items-center justify-center text-lg shadow border border-white/10">
                      {brand.logoEmoji}
                    </div>
                  </div>
                </div>
                <div className="px-2.5 py-2">
                  <p className="text-xs font-bold text-foreground truncate flex items-center gap-1">
                    {brand.name}
                    {brand.verified && <BadgeCheck className="w-3 h-3 text-blue-500 flex-shrink-0" />}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="w-2.5 h-2.5 text-accent-cta fill-accent-cta" />
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {brand.rating} &middot; {brand.productCount} items
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8" />}
          title={t("shop.noProducts")}
          description={t("shop.tryDifferentCategory")}
        />
      ) : (
        <div className="p-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="border-none shadow-sm overflow-hidden flex flex-col bg-card group rounded-2xl card-warm"
            >
              <div className="h-36 relative overflow-hidden bg-muted">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {product.badge && (
                  <span
                    className={`absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold shadow-sm ${BADGE_COLORS[product.badge] || "bg-foreground text-background"}`}
                  >
                    {product.badge}
                  </span>
                )}
                <button
                  type="button"
                  aria-label={wishlist.has(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                  onClick={() => toggleWishlist(product.id)}
                  className={`absolute top-2.5 right-2.5 p-1.5 rounded-full transition-all ${wishlist.has(product.id) ? "bg-destructive/10 text-destructive" : "bg-card/80 backdrop-blur-sm text-muted-foreground hover:text-destructive"}`}
                >
                  <Heart className={`w-4 h-4 ${wishlist.has(product.id) ? "fill-current" : ""}`} />
                </button>
              </div>
              <CardContent className="p-3.5 flex-1 flex flex-col">
                <p className="text-[9px] uppercase tracking-widest font-semibold text-muted-foreground mb-0.5">
                  {product.brand}
                </p>
                <h3 className="font-semibold text-sm text-foreground leading-tight mb-1 line-clamp-2">
                  {product.name}
                </h3>
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-3 h-3 text-accent-cta fill-accent-cta" />
                  <span className="text-[11px] font-semibold text-muted-foreground">{product.rating}</span>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <span className="font-bold text-base text-primary">&euro;{product.price}</span>
                  <Button
                    onClick={() => addToCart(product)}
                    size="sm"
                    className="bg-accent-cta hover:bg-accent-cta/85 text-white font-semibold text-xs px-3.5 h-8 active:scale-95 transition-all btn-premium"
                  >
                    {t("shop.addToCart")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
