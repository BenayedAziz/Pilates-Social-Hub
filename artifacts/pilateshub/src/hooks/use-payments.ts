import { useMutation } from "@tanstack/react-query";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem("pilateshub-token");
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || res.statusText);
  return res.json();
}

export function useBookingPayment() {
  return useMutation({
    mutationFn: (data: { studioName: string; className: string; amount: number }) =>
      apiFetch<{ clientSecret: string; paymentIntentId: string }>("/payments/booking", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
}

export function useOrderPayment() {
  return useMutation({
    mutationFn: (data: { items: Array<{ name: string; quantity: number }>; totalAmount: number }) =>
      apiFetch<{ clientSecret: string; paymentIntentId: string }>("/payments/order", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
}
