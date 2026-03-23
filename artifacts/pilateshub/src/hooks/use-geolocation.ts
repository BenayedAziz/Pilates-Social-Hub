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

    // 1. Try browser geolocation (works on HTTPS & localhost; may also work on
    //    HTTP in some browsers after explicit user permission).
    const browserGeo = new Promise<GeoPosition | null>((resolve) => {
      // On insecure contexts (plain HTTP, not localhost) the Geolocation API
      // is blocked entirely by modern browsers — skip it to avoid a pointless
      // timeout and go straight to the IP fallback.
      if (!window.isSecureContext || !("geolocation" in navigator)) {
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

    let loc = await browserGeo;

    // 2. Fallback: IP-based geolocation when browser geo is unavailable
    //    (e.g. plain HTTP). We try multiple free services for resilience.
    //    NOTE: ip-api.com free tier only works over HTTP, not HTTPS.
    if (!loc) {
      const ipGeoServices = [
        {
          url: "https://ipapi.co/json/",
          extract: (d: any) => ({ lat: d.latitude, lng: d.longitude }),
        },
        {
          url: "https://freeipapi.com/api/json",
          extract: (d: any) => ({ lat: d.latitude, lng: d.longitude }),
        },
        {
          url: "https://ipwho.is/",
          extract: (d: any) => ({ lat: d.latitude, lng: d.longitude }),
        },
      ];

      for (const svc of ipGeoServices) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 4000);
          const resp = await fetch(svc.url, { signal: controller.signal });
          clearTimeout(timeout);
          if (resp.ok) {
            const data = await resp.json();
            const pos = svc.extract(data);
            if (typeof pos.lat === "number" && typeof pos.lng === "number" && pos.lat !== 0) {
              loc = pos;
              break;
            }
          }
        } catch {
          // Service unavailable — try next one
        }
      }
    }

    if (loc) {
      // Real position (browser or IP-based) — persist it for fast future loads.
      setPosition(loc);
      setIsDefault(false);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...loc, ts: Date.now() }));
    }
    // If both browser geo and IP geo failed we keep whatever position is
    // already set (either cached real geo or the Paris default).

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
