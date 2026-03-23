import { Router, type IRouter } from "express";

// ---------------------------------------------------------------------------
// Types (mirrors DB schema – swap to Drizzle select types when DB is wired)
// ---------------------------------------------------------------------------
interface Booking {
  id: number;
  userId: number;
  classId: number;
  studioId: number;
  status: "confirmed" | "cancelled" | "completed";
  timeSlot: string | null;
  bookedAt: string;
  cancelledAt: string | null;
  // Denormalised display fields
  className: string;
  studioName: string;
}

// ---------------------------------------------------------------------------
// Mock data (mutable – bookings can be created / cancelled)
// ---------------------------------------------------------------------------
const MOCK_USER_ID = 1; // pretend current user

const bookings: Booking[] = [
  {
    id: 1,
    userId: 1,
    classId: 1,
    studioId: 1,
    status: "confirmed",
    timeSlot: "09:00",
    bookedAt: "2026-03-20T08:15:00Z",
    cancelledAt: null,
    className: "Reformer Advanced",
    studioName: "Studio Harmonie",
  },
  {
    id: 2,
    userId: 1,
    classId: 5,
    studioId: 5,
    status: "confirmed",
    timeSlot: "16:00",
    bookedAt: "2026-03-20T12:30:00Z",
    cancelledAt: null,
    className: "Reformer Flow",
    studioName: "Équilibre Pilates",
  },
  {
    id: 3,
    userId: 1,
    classId: 3,
    studioId: 2,
    status: "completed",
    timeSlot: "11:00",
    bookedAt: "2026-03-15T09:00:00Z",
    cancelledAt: null,
    className: "Cadillac Intro",
    studioName: "Pilates Lumière",
  },
];

let nextId = 4;

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
const router: IRouter = Router();

/**
 * GET /api/bookings
 * Returns bookings for the "current" user.
 */
router.get("/bookings", (_req, res) => {
  const userBookings = bookings.filter(
    (b) => b.userId === MOCK_USER_ID && b.status !== "cancelled",
  );
  res.json(userBookings);
});

/**
 * POST /api/bookings
 * Body: { classId, studioId, timeSlot }
 */
router.post("/bookings", (req, res) => {
  const { classId, studioId, timeSlot } = req.body as {
    classId?: number;
    studioId?: number;
    timeSlot?: string;
  };

  if (!classId || !studioId) {
    res.status(400).json({ error: "classId and studioId are required" });
    return;
  }

  // Check for duplicate active booking
  const existing = bookings.find(
    (b) =>
      b.userId === MOCK_USER_ID &&
      b.classId === classId &&
      b.status === "confirmed",
  );
  if (existing) {
    res.status(409).json({ error: "You already have an active booking for this class" });
    return;
  }

  const booking: Booking = {
    id: nextId++,
    userId: MOCK_USER_ID,
    classId,
    studioId,
    status: "confirmed",
    timeSlot: timeSlot ?? null,
    bookedAt: new Date().toISOString(),
    cancelledAt: null,
    className: `Class #${classId}`,
    studioName: `Studio #${studioId}`,
  };

  bookings.push(booking);
  res.status(201).json(booking);
});

/**
 * DELETE /api/bookings/:id
 * Soft-cancel a booking.
 */
router.delete("/bookings/:id", (req, res) => {
  const id = Number(req.params["id"]);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid booking id" });
    return;
  }

  const booking = bookings.find(
    (b) => b.id === id && b.userId === MOCK_USER_ID,
  );
  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  if (booking.status === "cancelled") {
    res.status(400).json({ error: "Booking is already cancelled" });
    return;
  }

  booking.status = "cancelled";
  booking.cancelledAt = new Date().toISOString();

  res.json({ message: "Booking cancelled", booking });
});

export default router;
