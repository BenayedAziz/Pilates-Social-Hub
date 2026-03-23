import { useState, useEffect, useCallback } from "react";

interface GeoPosition {
  lat: number;
  lng: number;
}

interface UseGeolocationResult {
  position: GeoPosition | null;
  loading: boolean;
  error: string | null;
  requestPermission: () => void;
}

// Default fallback: Paris
const DEFAULT_POSITION: GeoPosition = { lat: 48.856, lng: 2.352 };

/**
 * IP-based geolocation fallback (works on HTTP, no API key needed).
 * Tries two free providers before falling back to Paris.
 */
async function getPositionFromIP(): Promise<GeoPosition> {
  try {
    // Free IP geolocation (no API key needed)
    const res = await fetch("https://ipapi.co/json/");
    if (res.ok) {
      const data = await res.json();
      if (data.latitude && data.longitude) {
        return { lat: data.latitude, lng: data.longitude };
      }
    }
  } catch {}

  // Second fallback
  try {
    const res = await fetch("https://ip-api.com/json/?fields=lat,lon");
    if (res.ok) {
      const data = await res.json();
      if (data.lat && data.lon) {
        return { lat: data.lat, lng: data.lon };
      }
    }
  } catch {}

  return DEFAULT_POSITION; // Paris
}

export function useGeolocation(): UseGeolocationResult {
  const [position, setPosition] = useState<GeoPosition | null>(() => {
    const saved = localStorage.getItem("pilateshub-location");
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return null;
  });
  const [loading, setLoading] = useState(!position); // Don't show loading if we have cached position
  const [error, setError] = useState<string | null>(null);

  const requestPermission = useCallback(async () => {
    setLoading(true);

    // Try browser geolocation first (HTTPS / localhost only)
    const browserGeo = new Promise<GeoPosition | null>((resolve) => {
      if (!("geolocation" in navigator)) {
        resolve(null);
        return;
      }

      const timeout = setTimeout(() => resolve(null), 3000); // 3s timeout

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          clearTimeout(timeout);
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          clearTimeout(timeout);
          resolve(null);
        },
        { enableHighAccuracy: false, timeout: 3000, maximumAge: 300000 },
      );
    });

    let loc = await browserGeo;

    // Fallback: IP-based geolocation (works on HTTP)
    if (!loc) {
      loc = await getPositionFromIP();
    }

    setPosition(loc);
    setError(null);
    setLoading(false);
    localStorage.setItem("pilateshub-location", JSON.stringify(loc));
  }, []);

  useEffect(() => {
    if (position) {
      // We have a cached position -- don't block UI, refresh in background
      setLoading(false);
      requestPermission();
    } else {
      requestPermission();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { position, loading, error, requestPermission };
}
