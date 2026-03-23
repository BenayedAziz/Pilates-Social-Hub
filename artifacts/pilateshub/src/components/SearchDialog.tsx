import { MapPin, MessageCircle, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { FORUM_POSTS, PRODUCTS, STUDIOS } from "@/data/mock-data";

export function SearchDialog() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    if (query.length < 2) return { studios: [], products: [], forumPosts: [] };
    const q = query.toLowerCase();
    return {
      studios: STUDIOS.filter(
        (s) => s.name.toLowerCase().includes(q) || s.neighborhood.toLowerCase().includes(q),
      ).slice(0, 3),
      products: PRODUCTS.filter((p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)).slice(
        0,
        3,
      ),
      forumPosts: FORUM_POSTS.filter((f) => f.title.toLowerCase().includes(q)).slice(0, 3),
    };
  }, [query]);

  const hasResults = results.studios.length > 0 || results.products.length > 0 || results.forumPosts.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="Search"
          className="p-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <Search className="w-5 h-5" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-[400px] p-0 rounded-2xl overflow-hidden border-none shadow-xl gap-0">
        <div className="p-4 border-b border-border/40">
          <div className="flex items-center gap-3 bg-muted/50 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-muted-foreground/60 flex-shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search studios, products, discussions..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {query.length < 2 ? (
            <div className="p-8 text-center text-sm text-muted-foreground/60">Type at least 2 characters to search</div>
          ) : !hasResults ? (
            <div className="p-8 text-center text-sm text-muted-foreground/60">No results for "{query}"</div>
          ) : (
            <div className="p-2">
              {results.studios.length > 0 && (
                <div className="mb-2">
                  <p className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">
                    Studios
                  </p>
                  {results.studios.map((studio) => (
                    <Link key={studio.id} href="/" onClick={() => setOpen(false)}>
                      <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{studio.name}</p>
                          <p className="text-xs text-muted-foreground/60">
                            {studio.neighborhood} · €{studio.price}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {results.products.length > 0 && (
                <div className="mb-2">
                  <p className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">
                    Products
                  </p>
                  {results.products.map((product) => (
                    <Link key={product.id} href="/store" onClick={() => setOpen(false)}>
                      <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                        <div className={`w-8 h-8 rounded-lg ${product.image} flex-shrink-0`} />
                        <div>
                          <p className="text-sm font-semibold text-foreground">{product.name}</p>
                          <p className="text-xs text-muted-foreground/60">
                            {product.brand} · €{product.price}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {results.forumPosts.length > 0 && (
                <div className="mb-2">
                  <p className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">
                    Discussions
                  </p>
                  {results.forumPosts.map((post) => (
                    <Link key={post.id} href="/community" onClick={() => setOpen(false)}>
                      <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <MessageCircle className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground line-clamp-1">{post.title}</p>
                          <p className="text-xs text-muted-foreground/60">
                            {post.category} · {post.timeAgo}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
