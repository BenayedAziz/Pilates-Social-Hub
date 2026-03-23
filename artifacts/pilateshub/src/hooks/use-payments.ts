import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "./api-fetch";

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
