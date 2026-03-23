import { ArrowLeft, BadgeCheck, Heart, MapPin, ShoppingBag, Star } from "lucide-react";
import { Link, useRoute } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/context/AppContext";
import { useBrands, useProducts } from "@/hooks/use-api";
import { GenericPageSkeleton } from "@/components/PageSkeleton";
import NotFound from "@/pages/not-found";

const BADGE_COLORS: Record<string, string> = {
  New: "bg-primary text-primary-foreground",
  "Best Seller": "bg-accent-cta text-white",
  "Promo -20%": "bg-destructive text-white",
  Exclusif: "bg-foreground text-background",
};

const CATEGORY_LABELS: Record<string, string> = {
  equipment: "Equipment",
  apparel: "Apparel",
  accessories: "Accessories",
  nutrition: "Nutrition",
};

export default function BrandPage() {
  const [, params] = useRoute("/brand/:slug");
  const { wishlist, toggleWishlist, addToCart } = useApp();
  const { data: BRANDS = [], isLoading: brandsLoading } = useBrands();
  const { data: PRODUCTS = [], isLoading: productsLoading } = useProducts();

  if (brandsLoading || productsLoading) return <GenericPageSkeleton />;

  const brand = BRANDS.find((b: any) => b.slug === params?.slug);

  if (!brand) return <NotFound />;

  // Match products by brand name (case-insensitive partial match to catch "Manduka PRO", "Manduka eKO", etc.)
  const brandProducts = PRODUCTS.filter(
    (p: any) =>
      p.brand.toLowerCase() === brand.name.toLowerCase() || p.brand.toLowerCase().startsWith(brand.name.toLowerCase()),
  );

  return (
    <div className="bg-background min-h-full animate-in fade-in duration-300">
      {/* Cover image with overlay */}
      <div className="h-48 relative overflow-hidden">
        <img src={brand.coverImageUrl} alt={brand.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Back button */}
        <Link href="/store">
          <button
            type="button"
            className="absolute top-4 left-4 p-2 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>

        {/* Brand identity on cover */}
        <div className="absolute bottom-4 left-5 right-5">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-card/95 backdrop-blur-sm flex items-center justify-center text-3xl shadow-lg border border-white/10">
              {brand.logoEmoji}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-white flex items-center gap-2 drop-shadow-sm">
                {brand.name}
                {brand.verified && <BadgeCheck className="w-5 h-5 text-blue-400 flex-shrink-0" />}
              </h1>
              <p className="text-xs text-white/80 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3 h-3" />
                {brand.origin} &middot; Since {brand.founded}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Brand info section */}
      <div className="p-5">
        <p className="text-sm text-muted-foreground leading-relaxed">{brand.description}</p>

        {/* Stats row */}
        <div className="flex gap-1 mt-4 mb-5">
          <div className="flex-1 bg-muted/50 rounded-xl px-3 py-2.5 text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Star className="w-3.5 h-3.5 text-accent-cta fill-accent-cta" />
              <span className="text-sm font-bold text-foreground">{brand.rating}</span>
            </div>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Rating</p>
          </div>
          <div className="flex-1 bg-muted/50 rounded-xl px-3 py-2.5 text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <ShoppingBag className="w-3.5 h-3.5 text-primary" />
              <span className="text-sm font-bold text-foreground">{brand.productCount}</span>
            </div>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Products</p>
          </div>
          <div className="flex-1 bg-muted/50 rounded-xl px-3 py-2.5 text-center">
            <div className="mb-0.5">
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {CATEGORY_LABELS[brand.category] || brand.category}
              </Badge>
            </div>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Category</p>
          </div>
        </div>

        {/* Highlight badge */}
        <div className="bg-primary/8 border border-primary/15 rounded-2xl px-4 py-3 mb-6">
          <p className="text-sm font-semibold text-primary flex items-center gap-2">
            <span className="text-base">&#10024;</span>
            {brand.highlight}
          </p>
        </div>

        {/* Products by this brand */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-foreground text-base">Products by {brand.name}</h2>
          <span className="text-xs text-muted-foreground font-medium">
            {brandProducts.length} item{brandProducts.length !== 1 ? "s" : ""}
          </span>
        </div>

        {brandProducts.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">No products listed yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {brandProducts.map((product) => (
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
                    className={`absolute top-2.5 right-2.5 p-1.5 rounded-full transition-all ${
                      wishlist.has(product.id)
                        ? "bg-destructive/10 text-destructive"
                        : "bg-card/80 backdrop-blur-sm text-muted-foreground hover:text-destructive"
                    }`}
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
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
