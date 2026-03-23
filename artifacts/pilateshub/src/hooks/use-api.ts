import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const BASE = "/api";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || res.statusText);
  }
  return res.json();
}

// Studios
export function useStudios(q?: string, neighborhood?: string) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (neighborhood) params.set("neighborhood", neighborhood);
  const qs = params.toString();
  return useQuery({
    queryKey: ["studios", q, neighborhood],
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
    queryFn: () => apiFetch<any[]>(`/products${params}`),
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

// Auth
export function useCurrentUser() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => apiFetch<any>("/auth/me"),
    retry: false,
  });
}
