import { useState, useEffect, useCallback } from "react";

interface GeoPosition {
  lat: number;
  lng: number;
}

interface UseGeolocationResult {
  position: GeoPosition | null;
  /** True while the browser Geolocation API call is in flight. */
  loading: boolean;
  error: string | null;
  /** True when using the hardcoded default (no real geo or cached geo available). */
  isDefault: boolean;
  requestPermission: () => void;
}

// Default fallback: Paris center
const DEFAULT_POSITION: GeoPosition = { lat: 48.856, lng: 2.352 };

// Key used to persist a *real* browser-geolocation result.
// We never persist the hardcoded default — only coordinates that came from the
// browser Geolocation API, so a stale IP-based cache can never resurface.
const STORAGE_KEY = "pilateshub-geo";

/**
 * Read a cached position that was obtained from the browser Geolocation API.
 * Returns null when nothing is stored or the entry has expired (>24h).
 */
function readCachedPosition(): GeoPosition | null {
  // Always clean up the old key from the previous IP-geolocation implementation.
  // That key could contain stale/wrong coordinates (e.g. Lyon instead of Paris)
  // from an unreliable IP lookup, causing the map to open in the wrong city.
  localStorage.removeItem("pilateshub-location");

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Expire after 24 hours so we eventually re-check
    if (parsed.ts && Date.now() - parsed.ts > 86_400_000) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    if (typeof parsed.lat === "number" && typeof parsed.lng === "number") {
      return { lat: parsed.lat, lng: parsed.lng };
    }
  } catch { /* corrupt entry — ignore */ }
  return null;
}

export function useGeolocation(): UseGeolocationResult {
  const cachedGeo = readCachedPosition();
  const [position, setPosition] = useState<GeoPosition | null>(
    cachedGeo ?? DEFAULT_POSITION,
  );
  const [isDefault, setIsDefault] = useState(!cachedGeo);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestPermission = useCallback(async () => {
    setLoading(true);

    // Try browser geolocation (works on HTTPS & localhost; may also work on
    // HTTP in some browsers after explicit user permission).
    const browserGeo = new Promise<GeoPosition | null>((resolve) => {
      if (!("geolocation" in navigator)) {
        resolve(null);
        return;
      }

      const timeout = setTimeout(() => resolve(null), 5000);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          clearTimeout(timeout);
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          clearTimeout(timeout);
          resolve(null);
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 300_000 },
      );
    });

    const loc = await browserGeo;

    if (loc) {
      // Real browser position — persist it for fast future loads.
      setPosition(loc);
      setIsDefault(false);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...loc, ts: Date.now() }));
    }
    // If browser geo failed we keep whatever position is already set (either
    // cached real geo or the Paris default). We intentionally do NOT cache the
    // default — there is no value in persisting a hardcoded constant, and doing
    // so is what caused wrong-city bugs with old IP-geolocation data.

    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Always attempt a geolocation refresh on mount (non-blocking — we already
    // have a position from cache or default so the UI renders immediately).
    requestPermission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { position, loading, error, isDefault, requestPermission };
}
