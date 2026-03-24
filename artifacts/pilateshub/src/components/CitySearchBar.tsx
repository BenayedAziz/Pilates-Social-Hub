import { Loader2, MapPin, Search, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface CityResult {
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  /** Short label derived from display_name (first 1-2 parts) */
  label: string;
}

interface CitySearchBarProps {
  /** Called when the user selects a city from the dropdown */
  onCitySelect: (lat: number, lng: number, label: string) => void;
}

/**
 * Auto-complete search bar for cities.
 * Uses OpenStreetMap Nominatim for free geocoding (no API key).
 */
export function CitySearchBar({ onCitySelect }: CitySearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CityResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeCity, setActiveCity] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Debounced search against Nominatim
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      // Cancel any in-flight request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      try {
        const params = new URLSearchParams({
          q: query,
          format: "json",
          limit: "5",
          addressdetails: "1",
          // Bias toward populated places
          featuretype: "city",
        });
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?${params}`,
          {
            signal: controller.signal,
            headers: { "Accept-Language": "en" },
          },
        );
        if (!res.ok) throw new Error("Nominatim request failed");
        const data = await res.json();

        const mapped: CityResult[] = data.map((item: any) => {
          // Build a short label: city/town, country
          const parts = item.display_name.split(",").map((s: string) => s.trim());
          const label = parts.length >= 2 ? `${parts[0]}, ${parts[parts.length - 1]}` : parts[0];
          return {
            display_name: item.display_name,
            lat: item.lat,
            lon: item.lon,
            type: item.type,
            label,
          };
        });

        setResults(mapped);
        setOpen(mapped.length > 0);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setResults([]);
          setOpen(false);
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown when clicking outside
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
    (result: CityResult) => {
      setQuery("");
      setResults([]);
      setOpen(false);
      setActiveCity(result.label);
      onCitySelect(parseFloat(result.lat), parseFloat(result.lon), result.label);
      inputRef.current?.blur();
    },
    [onCitySelect],
  );

  const handleClear = useCallback(() => {
    setQuery("");
    setResults([]);
    setOpen(false);
    setActiveCity(null);
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
          placeholder={activeCity || "Search city..."}
          aria-label="Search for a city"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60 min-w-0"
        />
        {loading && <Loader2 className="w-4 h-4 text-muted-foreground/60 animate-spin flex-shrink-0" />}
        {(query || activeCity) && !loading && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={handleClear}
            className="p-0.5 text-muted-foreground/60 hover:text-foreground transition-colors flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown results */}
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card/95 backdrop-blur-md rounded-xl shadow-xl border border-border/40 overflow-hidden z-[1100]">
          {results.map((result, idx) => (
            <button
              key={`${result.lat}-${result.lon}-${idx}`}
              type="button"
              onClick={() => handleSelect(result)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors"
            >
              <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{result.label}</p>
                <p className="text-[11px] text-muted-foreground/60 truncate">{result.display_name}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
