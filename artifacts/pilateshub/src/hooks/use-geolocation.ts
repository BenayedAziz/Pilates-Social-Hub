import { useState, useEffect } from "react";

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

export function useGeolocation(): UseGeolocationResult {
  const [position, setPosition] = useState<GeoPosition | null>(() => {
    // Try to restore from localStorage
    const saved = localStorage.getItem("pilateshub-location");
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestPermission = () => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation not supported");
      setPosition(DEFAULT_POSITION);
      setLoading(false);
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(loc);
        setError(null);
        setLoading(false);
        localStorage.setItem("pilateshub-location", JSON.stringify(loc));
      },
      (err) => {
        setError(err.message);
        // Fallback to Paris if no saved position
        if (!position) setPosition(DEFAULT_POSITION);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 } // cache for 5 min
    );
  };

  // Auto-request on mount
  useEffect(() => {
    requestPermission();
  }, []);

  return { position, loading, error, requestPermission };
}
