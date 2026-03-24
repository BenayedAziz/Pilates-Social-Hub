import { Router } from "express";
import { optionalAuth } from "../middleware/auth";
import { createBookingPayment, createOrderPayment, isPaymentsEnabled } from "../lib/payments";

const router = Router();

// GET /api/payments/status — check if payments are enabled
router.get("/status", (_req, res) => {
  res.json({ enabled: isPaymentsEnabled(), mode: isPaymentsEnabled() ? "live" : "mock" });
});

// POST /api/payments/booking — create payment intent for a booking
router.post("/booking", optionalAuth, async (req, res) => {
  const { studioName, className, amount } = req.body;
  if (!studioName || !className || !amount) {
    return res.status(400).json({ message: "studioName, className, and amount are required" });
  }

  const result = await createBookingPayment(amount, studioName, className, {
    userId: String(req.user?.userId ?? 1),
    type: "booking",
  });

  if (!result) {
    return res.status(500).json({ message: "Failed to create payment" });
  }

  return res.json(result);
});

// POST /api/payments/order — create payment intent for a store order
router.post("/order", optionalAuth, async (req, res) => {
  const { items, totalAmount } = req.body;
  if (!items?.length || !totalAmount) {
    return res.status(400).json({ message: "items and totalAmount are required" });
  }

  const result = await createOrderPayment(totalAmount, items, {
    userId: String(req.user?.userId ?? 1),
    type: "order",
    itemCount: String(items.length),
  });

  if (!result) {
    return res.status(500).json({ message: "Failed to create payment" });
  }

  return res.json(result);
});

export default router;
