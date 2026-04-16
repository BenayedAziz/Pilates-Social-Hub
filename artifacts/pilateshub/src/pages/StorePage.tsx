import { ExternalLink, Heart, ShoppingBag, Star } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/EmptyState";
import { StorePageSkeleton } from "@/components/PageSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/context/AppContext";
import { useProducts } from "@/hooks/use-api";

const CATEGORIES = [
  { key: "All", labelKey: "shop.all" },
  { key: "Habitat", labelKey: "shop.habitat" },
  { key: "Machines", labelKey: "shop.machines" },
  { key: "Apparel", labelKey: "shop.apparel" },
  { key: "Accessoires", labelKey: "shop.accessories" },
  { key: "Goodies", labelKey: "shop.goodies" },
];

const BADGE_COLORS: Record<string, string> = {
  New: "bg-primary text-primary-foreground",
  "Best Seller": "bg-accent-cta text-white",
  "Promo -20%": "bg-destructive text-white",
  Exclusif: "bg-foreground text-background",
};

export default function StorePage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const { wishlist, toggleWishlist } = useApp();
  const { t } = useTranslation();
  const { data: allProducts = [], isLoading: productsLoading } = useProducts();
  if (productsLoading) return <StorePageSkeleton />;

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
              {t(cat.labelKey)} ({getCategoryCount(cat.key)})
            </button>
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
                  loading="lazy"
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
                  {product.externalUrl ? (
                    <a
                      href={product.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        size="sm"
                        className="bg-accent-cta hover:bg-accent-cta/85 text-white font-semibold text-xs px-3.5 h-8 active:scale-95 transition-all btn-premium gap-1"
                      >
                        {t("shop.viewProduct")} <ExternalLink className="w-3 h-3" />
                      </Button>
                    </a>
                  ) : (
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(`${product.brand} ${product.name}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        size="sm"
                        className="bg-accent-cta hover:bg-accent-cta/85 text-white font-semibold text-xs px-3.5 h-8 active:scale-95 transition-all btn-premium gap-1"
                      >
                        {t("shop.viewProduct")} <ExternalLink className="w-3 h-3" />
                      </Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
