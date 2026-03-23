import { Router, type IRouter } from "express";
import { getDatabase } from "../lib/database";
import { eq, and, ne } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Types (mirrors DB schema – used for mock fallback)
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
// Mock data (fallback when DATABASE_URL is not set)
// ---------------------------------------------------------------------------
const MOCK_USER_ID = 1; // pretend current user

const mockBookings: Booking[] = [
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
    studioName: "Equilibre Pilates",
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
    studioName: "Pilates Lumiere",
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
router.get("/bookings", async (_req, res) => {
  try {
    const database = await getDatabase();

    if (database) {
      const { db, schema } = database;
      const results = await db
        .select({
          id: schema.bookings.id,
          userId: schema.bookings.userId,
          classId: schema.bookings.classId,
          studioId: schema.bookings.studioId,
          status: schema.bookings.status,
          timeSlot: schema.bookings.timeSlot,
          bookedAt: schema.bookings.bookedAt,
          cancelledAt: schema.bookings.cancelledAt,
          className: schema.classes.title,
          studioName: schema.studios.name,
        })
        .from(schema.bookings)
        .leftJoin(schema.classes, eq(schema.bookings.classId, schema.classes.id))
        .leftJoin(schema.studios, eq(schema.bookings.studioId, schema.studios.id))
        .where(
          and(
            eq(schema.bookings.userId, MOCK_USER_ID),
            ne(schema.bookings.status, "cancelled"),
          ),
        );

      res.json(results);
      return;
    }

    // Fallback to mock data
    const userBookings = mockBookings.filter(
      (b) => b.userId === MOCK_USER_ID && b.status !== "cancelled",
    );
    res.json(userBookings);
  } catch (_error) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

/**
 * POST /api/bookings
 * Body: { classId, studioId, timeSlot }
 */
router.post("/bookings", async (req, res) => {
  const { classId, studioId, timeSlot } = req.body as {
    classId?: number;
    studioId?: number;
    timeSlot?: string;
  };

  if (!classId || !studioId) {
    res.status(400).json({ error: "classId and studioId are required" });
    return;
  }

  try {
    const database = await getDatabase();

    if (database) {
      const { db, schema } = database;

      // Check for duplicate active booking
      const [existing] = await db
        .select()
        .from(schema.bookings)
        .where(
          and(
            eq(schema.bookings.userId, MOCK_USER_ID),
            eq(schema.bookings.classId, classId),
            eq(schema.bookings.status, "confirmed"),
          ),
        )
        .limit(1);

      if (existing) {
        res.status(409).json({ error: "You already have an active booking for this class" });
        return;
      }

      const [newBooking] = await db
        .insert(schema.bookings)
        .values({
          userId: MOCK_USER_ID,
          classId,
          studioId,
          status: "confirmed",
          timeSlot: timeSlot ?? null,
        })
        .returning();

      // Fetch with joined names
      const [result] = await db
        .select({
          id: schema.bookings.id,
          userId: schema.bookings.userId,
          classId: schema.bookings.classId,
          studioId: schema.bookings.studioId,
          status: schema.bookings.status,
          timeSlot: schema.bookings.timeSlot,
          bookedAt: schema.bookings.bookedAt,
          cancelledAt: schema.bookings.cancelledAt,
          className: schema.classes.title,
          studioName: schema.studios.name,
        })
        .from(schema.bookings)
        .leftJoin(schema.classes, eq(schema.bookings.classId, schema.classes.id))
        .leftJoin(schema.studios, eq(schema.bookings.studioId, schema.studios.id))
        .where(eq(schema.bookings.id, newBooking.id))
        .limit(1);

      res.status(201).json(result);
      return;
    }

    // Fallback to mock data
    const existing = mockBookings.find(
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

    mockBookings.push(booking);
    res.status(201).json(booking);
  } catch (_error) {
    res.status(500).json({ error: "Failed to create booking" });
  }
});

/**
 * DELETE /api/bookings/:id
 * Soft-cancel a booking.
 */
router.delete("/bookings/:id", async (req, res) => {
  const id = Number(req.params["id"]);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid booking id" });
    return;
  }

  try {
    const database = await getDatabase();

    if (database) {
      const { db, schema } = database;

      const [booking] = await db
        .select()
        .from(schema.bookings)
        .where(
          and(
            eq(schema.bookings.id, id),
            eq(schema.bookings.userId, MOCK_USER_ID),
          ),
        )
        .limit(1);

      if (!booking) {
        res.status(404).json({ error: "Booking not found" });
        return;
      }

      if (booking.status === "cancelled") {
        res.status(400).json({ error: "Booking is already cancelled" });
        return;
      }

      const [updated] = await db
        .update(schema.bookings)
        .set({
          status: "cancelled",
          cancelledAt: new Date(),
        })
        .where(eq(schema.bookings.id, id))
        .returning();

      res.json({ message: "Booking cancelled", booking: updated });
      return;
    }

    // Fallback to mock data
    const booking = mockBookings.find(
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
  } catch (_error) {
    res.status(500).json({ error: "Failed to cancel booking" });
  }
});

export default router;
