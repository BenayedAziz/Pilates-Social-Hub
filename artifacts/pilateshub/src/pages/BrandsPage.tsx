import { ArrowLeft, BadgeCheck, ChevronRight, MapPin, Star } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { useBrands } from "@/hooks/use-api";
import { GenericPageSkeleton } from "@/components/PageSkeleton";

const CATEGORY_LABELS: Record<string, string> = {
  equipment: "Equipment",
  apparel: "Apparel",
  accessories: "Accessories",
  nutrition: "Nutrition",
};

const CATEGORY_COLORS: Record<string, string> = {
  equipment: "bg-blue-100 text-blue-700 border-blue-200",
  apparel: "bg-rose-100 text-rose-700 border-rose-200",
  accessories: "bg-emerald-100 text-emerald-700 border-emerald-200",
  nutrition: "bg-amber-100 text-amber-700 border-amber-200",
};

export default function BrandsPage() {
  const { data: BRANDS = [], isLoading } = useBrands();

  if (isLoading) return <GenericPageSkeleton />;

  return (
    <div className="bg-background min-h-full animate-in fade-in duration-300">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 bg-card border-b border-border/40">
        <div className="flex items-center gap-3 mb-3">
          <Link href="/store">
            <button
              type="button"
              className="p-1.5 -ml-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">Our Brands</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {BRANDS.length} curated brands for your Pilates journey
            </p>
          </div>
        </div>
      </div>

      {/* Brands grid */}
      <div className="p-5 grid gap-4">
        {BRANDS.map((brand) => (
          <Link key={brand.id} href={`/brand/${brand.slug}`}>
            <div className="group rounded-2xl overflow-hidden bg-card shadow-sm border border-border/40 hover:shadow-md transition-all duration-300 cursor-pointer">
              {/* Cover image */}
              <div className="h-28 relative overflow-hidden">
                <img
                  src={brand.coverImageUrl}
                  alt={brand.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

                {/* Category badge */}
                <Badge
                  className={`absolute top-3 right-3 text-[10px] font-semibold border ${CATEGORY_COLORS[brand.category] || "bg-muted text-muted-foreground border-border"}`}
                >
                  {CATEGORY_LABELS[brand.category] || brand.category}
                </Badge>

                {/* Logo on cover */}
                <div className="absolute bottom-3 left-4">
                  <div className="w-11 h-11 rounded-xl bg-card/95 backdrop-blur-sm flex items-center justify-center text-2xl shadow-md border border-white/10">
                    {brand.logoEmoji}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground text-[15px] flex items-center gap-1.5">
                      {brand.name}
                      {brand.verified && <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {brand.origin} &middot; Since {brand.founded}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 ml-3">
                    <Star className="w-3.5 h-3.5 text-accent-cta fill-accent-cta" />
                    <span className="text-sm font-bold text-foreground">{brand.rating}</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">{brand.description}</p>

                <div className="flex items-center justify-between">
                  <div className="bg-primary/8 rounded-lg px-2.5 py-1">
                    <p className="text-[11px] font-semibold text-primary">&#10024; {brand.highlight}</p>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground group-hover:text-primary transition-colors">
                    <span className="text-xs font-medium">{brand.productCount} products</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
