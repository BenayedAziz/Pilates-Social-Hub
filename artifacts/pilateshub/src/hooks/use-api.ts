import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const BASE = "/api";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem("pilateshub-token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...(options?.headers as Record<string, string> | undefined),
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || res.statusText);
  }
  return res.json();
}

// Studios
export function useStudios(q?: string, neighborhood?: string, lat?: number, lng?: number, radius?: number, limit?: number) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (neighborhood) params.set("neighborhood", neighborhood);
  if (lat !== undefined && lng !== undefined) {
    params.set("lat", String(lat));
    params.set("lng", String(lng));
    params.set("radius", String(radius || 20));
    params.set("limit", String(limit || 100));
  } else {
    // Default: Paris center, limited results
    params.set("lat", "48.856");
    params.set("lng", "2.352");
    params.set("radius", "15");
    params.set("limit", "50");
  }
  const qs = params.toString();
  return useQuery({
    queryKey: ["studios", q, neighborhood, lat, lng, radius, limit],
    queryFn: async () => {
      const data = await apiFetch<any[]>(`/studios${qs ? `?${qs}` : ""}`);
      return data.map((s: any) => ({
        ...s,
        lat: s.lat ?? s.latitude,
        lng: s.lng ?? s.longitude,
        coords: s.coords ?? { x: s.coordX ?? 50, y: s.coordY ?? 50 },
        reviews: s.reviews ?? s.reviewCount ?? 0,
        distance: s.distance ?? 0,
        coaches: s.coaches ?? [],
        imageUrl: s.imageUrl ?? "",
        description: s.description ?? "",
        address: s.address ?? "",
        amenities: s.amenities ?? [],
        neighborhood: s.neighborhood ?? "",
      }));
    },
  });
}

export function useStudio(id: number) {
  return useQuery({
    queryKey: ["studios", id],
    queryFn: () => apiFetch<any>(`/studios/${id}`),
  });
}

// Classes
export function useClasses(studioId?: number, type?: string) {
  const params = new URLSearchParams();
  if (studioId) params.set("studioId", String(studioId));
  if (type) params.set("type", type);
  const qs = params.toString();
  return useQuery({
    queryKey: ["classes", studioId, type],
    queryFn: () => apiFetch<any[]>(`/classes${qs ? `?${qs}` : ""}`),
  });
}

// Feed
export function useFeed() {
  return useQuery({
    queryKey: ["feed"],
    queryFn: () => apiFetch<any[]>("/feed"),
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { type: string; studio: string; duration: number; calories: number }) =>
      apiFetch("/feed", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["feed"] }),
  });
}

export function useToggleLike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: number) => apiFetch(`/feed/${postId}/like`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["feed"] }),
  });
}

// Forum
export function useForum(category?: string) {
  const params = category && category !== "All" ? `?category=${category}` : "";
  return useQuery({
    queryKey: ["forum", category],
    queryFn: () => apiFetch<any[]>(`/forum${params}`),
  });
}

export function useCreateForumPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; category: string; body: string }) =>
      apiFetch("/forum", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["forum"] }),
  });
}

export function useVoteForumPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, direction }: { postId: number; direction: "up" | "down" }) =>
      apiFetch(`/forum/${postId}/vote`, { method: "POST", body: JSON.stringify({ direction }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["forum"] }),
  });
}

// Products
export function useProducts(category?: string) {
  const params = category && category !== "All" ? `?category=${category}` : "";
  return useQuery({
    queryKey: ["products", category],
    queryFn: async () => {
      const data = await apiFetch<any[]>(`/products${params}`);
      return data.map((p: any) => ({
        ...p,
        imageUrl: p.imageUrl ?? "",
        image: p.image ?? p.imageUrl ?? "",
        rating: p.rating ?? 0,
      }));
    },
  });
}

// Bookings
export function useBookings() {
  return useQuery({
    queryKey: ["bookings"],
    queryFn: () => apiFetch<any[]>("/bookings"),
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { classId: number; studioId: number; timeSlot: string }) =>
      apiFetch("/bookings", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookings"] }),
  });
}

// Brands
export function useBrands() {
  return useQuery({
    queryKey: ["brands"],
    queryFn: () => apiFetch<any[]>("/brands"),
  });
}

// Coaches
export function useCoaches() {
  return useQuery({
    queryKey: ["coaches"],
    queryFn: () => apiFetch<any[]>("/coaches"),
  });
}

// Challenges
export function useChallenges() {
  return useQuery({
    queryKey: ["challenges"],
    queryFn: () => apiFetch<any[]>("/challenges"),
  });
}

// Bingo Card
export function useBingoCard() {
  return useQuery({
    queryKey: ["bingo"],
    queryFn: () => apiFetch<any[]>("/bingo"),
  });
}

// Badges
export function useBadges() {
  return useQuery({
    queryKey: ["badges"],
    queryFn: async () => {
      const data = await apiFetch<any[]>("/badges");
      return data.map((b: any) => ({
        ...b,
        icon: mapBadgeIcon(b.iconName ?? b.icon),
      }));
    },
  });
}

/** Map an icon name string (from the API) to a Lucide icon element for rendering. */
function mapBadgeIcon(iconName: unknown): string {
  if (typeof iconName !== "string") return "\u2B50"; // fallback star
  const map: Record<string, string> = {
    trophy: "\uD83C\uDFC6",
    star: "\u2B50",
    flame: "\uD83D\uDD25",
    medal: "\uD83C\uDFC5",
    zap: "\u26A1",
    sunrise: "\uD83C\uDF05",
    "message-circle": "\uD83D\uDCAC",
    users: "\uD83D\uDC65",
    heart: "\u2764\uFE0F",
    target: "\uD83C\uDFAF",
    award: "\uD83C\uDFC6",
    check: "\u2705",
  };
  return map[iconName.toLowerCase()] ?? "\u2B50";
}

// Leaderboard
export function useLeaderboard() {
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => apiFetch<any[]>("/leaderboard"),
  });
}

// Calorie Data
export function useCalorieData() {
  return useQuery({
    queryKey: ["calorie-data"],
    queryFn: () => apiFetch<any[]>("/calorie-data"),
  });
}

// Circles
export function useCircles() {
  return useQuery({
    queryKey: ["circles"],
    queryFn: () => apiFetch<any[]>("/circles"),
  });
}

// Wearable Data
export function useWearable() {
  return useQuery({
    queryKey: ["wearable"],
    queryFn: () => apiFetch<any>("/wearable"),
  });
}

// Studio Reviews
export function useStudioReviews(studioId: number) {
  return useQuery({
    queryKey: ["reviews", studioId],
    queryFn: () => apiFetch<any[]>(`/studios/${studioId}/reviews`),
  });
}

// Studio Checkins
export function useStudioCheckins(studioId: number) {
  return useQuery({
    queryKey: ["checkins", studioId],
    queryFn: () => apiFetch<any[]>(`/studios/${studioId}/checkins`),
  });
}

// Auth
export function useCurrentUser() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => apiFetch<any>("/auth/me"),
    retry: false,
  });
}
