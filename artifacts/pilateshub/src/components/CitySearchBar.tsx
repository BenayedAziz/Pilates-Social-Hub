import { Loader2, MapPin, Search, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Studio } from "@/data/types";

interface CityResult {
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  label: string;
}

interface SearchResult {
  kind: "studio" | "city";
  label: string;
  sublabel: string;
  lat: number;
  lng: number;
  studio?: Studio;
}

interface CitySearchBarProps {
  onCitySelect: (lat: number, lng: number, label: string) => void;
  /** Studios already loaded on the map — searched locally (no API call) */
  studios?: Studio[];
}

/**
 * Search bar that finds both studios (from loaded map data) and cities (via Nominatim).
 */
export function CitySearchBar({ onCitySelect, studios = [] }: CitySearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    const q = query.toLowerCase();

    // 1. Search studios locally (instant)
    const studioResults: SearchResult[] = studios
      .filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.neighborhood?.toLowerCase().includes(q),
      )
      .slice(0, 4)
      .map((s) => ({
        kind: "studio",
        label: s.name,
        sublabel: s.neighborhood ?? "",
        lat: s.lat,
        lng: s.lng,
        studio: s,
      }));

    // Show studio results immediately
    if (studioResults.length > 0) {
      setResults(studioResults);
      setOpen(true);
    }

    // 2. Also search Nominatim for cities (async)
    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      try {
        const params = new URLSearchParams({
          q: query,
          format: "json",
          limit: "3",
          addressdetails: "1",
          featuretype: "city",
        });
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?${params}`,
          { signal: controller.signal, headers: { "Accept-Language": "fr" } },
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        const cityResults: SearchResult[] = data.map((item: any) => {
          const parts = item.display_name.split(",").map((s: string) => s.trim());
          const label = parts.length >= 2 ? `${parts[0]}, ${parts[parts.length - 1]}` : parts[0];
          return {
            kind: "city" as const,
            label,
            sublabel: item.display_name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
          };
        });

        // Merge: studios first, then cities (deduped)
        const merged = [
          ...studioResults,
          ...cityResults.filter(
            (c) => !studioResults.some((s) => s.label.toLowerCase() === c.label.toLowerCase()),
          ),
        ];
        setResults(merged);
        setOpen(merged.length > 0);
      } catch {
        // keep studio results visible even if Nominatim fails
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, studios]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = useCallback(
    (result: SearchResult) => {
      setQuery("");
      setResults([]);
      setOpen(false);
      setActiveLabel(result.label);
      onCitySelect(result.lat, result.lng, result.label);
      inputRef.current?.blur();
    },
    [onCitySelect],
  );

  const handleClear = useCallback(() => {
    setQuery("");
    setResults([]);
    setOpen(false);
    setActiveLabel(null);
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
      if (e.key === "Enter" && results.length > 0) {
        e.preventDefault();
        handleSelect(results[0]);
      }
    },
    [results, handleSelect],
  );

  return (
    <div ref={containerRef} className="relative w-full max-w-xs">
      <div className="flex items-center gap-2 bg-card/95 backdrop-blur-md rounded-full px-3 py-2 shadow-lg border border-border/40">
        <Search className="w-4 h-4 text-muted-foreground/60 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={activeLabel || "Studio ou ville..."}
          aria-label="Rechercher un studio ou une ville"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60 min-w-0"
        />
        {loading && <Loader2 className="w-4 h-4 text-muted-foreground/60 animate-spin flex-shrink-0" />}
        {(query || activeLabel) && !loading && (
          <button
            type="button"
            aria-label="Effacer"
            onClick={handleClear}
            className="p-0.5 text-muted-foreground/60 hover:text-foreground transition-colors flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card/95 backdrop-blur-md rounded-xl shadow-xl border border-border/40 overflow-hidden z-[1100]">
          {results.map((result, idx) => (
            <button
              key={`${result.kind}-${result.lat}-${result.lng}-${idx}`}
              type="button"
              onClick={() => handleSelect(result)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors"
            >
              <MapPin className={`w-4 h-4 flex-shrink-0 ${result.kind === "studio" ? "text-primary" : "text-muted-foreground/60"}`} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{result.label}</p>
                <p className="text-[11px] text-muted-foreground/60 truncate">
                  {result.kind === "studio" ? result.sublabel : result.sublabel.split(",").slice(0, 3).join(",")}
                </p>
              </div>
              {result.kind === "studio" && (
                <span className="ml-auto text-[10px] font-bold text-primary/70 bg-primary/10 rounded-full px-2 py-0.5 flex-shrink-0">
                  Studio
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
