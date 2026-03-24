import { Router, type IRouter } from "express";
import { getDatabase } from "../lib/database";
import { eq, and, ne, asc, sql } from "drizzle-orm";
import { sendBookingConfirmation, sendBookingCancellation } from "../lib/email";
import { logger } from "../lib/logger";

// ---------------------------------------------------------------------------
// Types (mirrors DB schema -- used for mock fallback)
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
// Constants
// ---------------------------------------------------------------------------
const CANCELLATION_WINDOW_MS = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

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
 *
 * Enforces capacity: rejects if the class is full.
 */
router.post("/bookings", async (req, res) => {
  const { classId, studioId, timeSlot, paymentIntentId } = req.body as {
    classId?: number;
    studioId?: number;
    timeSlot?: string;
    paymentIntentId?: string;
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

      // Fetch the class to get maxCapacity
      const [cls] = await db
        .select({
          id: schema.classes.id,
          maxCapacity: schema.classes.maxCapacity,
        })
        .from(schema.classes)
        .where(eq(schema.classes.id, classId))
        .limit(1);

      if (!cls) {
        res.status(404).json({ error: "Class not found" });
        return;
      }

      // Count confirmed bookings for this class
      const [{ count: confirmedCount }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.bookings)
        .where(
          and(
            eq(schema.bookings.classId, classId),
            eq(schema.bookings.status, "confirmed"),
          ),
        );

      if (confirmedCount >= cls.maxCapacity) {
        res.status(409).json({
          error: "Class is full",
          spotsLeft: 0,
          maxCapacity: cls.maxCapacity,
          hint: "Use POST /api/waitlist to join the waitlist",
        });
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

      res.status(201).json({
        ...result,
        spotsLeft: cls.maxCapacity - confirmedCount - 1,
        paymentIntentId: paymentIntentId ?? null,
      });

      // Fire-and-forget: send booking confirmation email
      fireBookingConfirmationEmail(db, schema, MOCK_USER_ID, result).catch(() => {});
      return;
    }

    // Fallback to mock data
    const existingMock = mockBookings.find(
      (b) =>
        b.userId === MOCK_USER_ID &&
        b.classId === classId &&
        b.status === "confirmed",
    );
    if (existingMock) {
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
    res.status(201).json({ ...booking, paymentIntentId: paymentIntentId ?? null });

    // Fire-and-forget: log mock email for dev
    sendBookingConfirmation({
      to: "mock-user@example.com",
      userName: "Mock User",
      className: booking.className,
      studioName: booking.studioName,
      studioAddress: "Mock Address",
      date: new Date(booking.bookedAt).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
      time: booking.timeSlot ?? "TBA",
      duration: 60,
      bookingRef: `PH-${String(booking.id).padStart(5, "0")}`,
      price: "0.00",
    }).catch(() => {});
  } catch (_error) {
    res.status(500).json({ error: "Failed to create booking" });
  }
});

/**
 * DELETE /api/bookings/:id
 * Soft-cancel a booking.
 *
 * Cancellation policy: free cancellation up to 12 hours before the class
 * start time. After that window closes, cancellation is rejected.
 *
 * When a booking is cancelled, the first person on the waitlist (if any)
 * is automatically promoted to a confirmed booking.
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

      // Fetch booking with class scheduledAt for cancellation policy check
      const [bookingRow] = await db
        .select({
          id: schema.bookings.id,
          userId: schema.bookings.userId,
          classId: schema.bookings.classId,
          studioId: schema.bookings.studioId,
          status: schema.bookings.status,
          timeSlot: schema.bookings.timeSlot,
          scheduledAt: schema.classes.scheduledAt,
        })
        .from(schema.bookings)
        .leftJoin(schema.classes, eq(schema.bookings.classId, schema.classes.id))
        .where(
          and(
            eq(schema.bookings.id, id),
            eq(schema.bookings.userId, MOCK_USER_ID),
          ),
        )
        .limit(1);

      if (!bookingRow) {
        res.status(404).json({ error: "Booking not found" });
        return;
      }

      if (bookingRow.status === "cancelled") {
        res.status(400).json({ error: "Booking is already cancelled" });
        return;
      }

      // Enforce 12-hour cancellation policy
      if (bookingRow.scheduledAt) {
        const classTime = new Date(bookingRow.scheduledAt).getTime();
        const now = Date.now();
        if (classTime - now < CANCELLATION_WINDOW_MS) {
          res.status(403).json({
            error: "Cancellation not allowed less than 12 hours before class",
            classStartsAt: bookingRow.scheduledAt,
          });
          return;
        }
      }

      // Cancel the booking
      const [updated] = await db
        .update(schema.bookings)
        .set({
          status: "cancelled",
          cancelledAt: new Date(),
        })
        .where(eq(schema.bookings.id, id))
        .returning();

      // Auto-promote the first waitlist entry for this class
      let promotedWaitlistEntry = null;
      const [firstWaiting] = await db
        .select()
        .from(schema.waitlist)
        .where(
          and(
            eq(schema.waitlist.classId, bookingRow.classId),
            eq(schema.waitlist.status, "waiting"),
          ),
        )
        .orderBy(asc(schema.waitlist.joinedAt))
        .limit(1);

      if (firstWaiting) {
        // Mark waitlist entry as promoted
        await db
          .update(schema.waitlist)
          .set({ status: "promoted", promotedAt: new Date() })
          .where(eq(schema.waitlist.id, firstWaiting.id));

        // Create a confirmed booking for the promoted user
        await db
          .insert(schema.bookings)
          .values({
            userId: firstWaiting.userId,
            classId: bookingRow.classId,
            studioId: bookingRow.studioId,
            status: "confirmed",
            timeSlot: null,
          });

        promotedWaitlistEntry = {
          waitlistId: firstWaiting.id,
          userId: firstWaiting.userId,
        };
      }

      res.json({
        message: "Booking cancelled",
        booking: updated,
        promotedFromWaitlist: promotedWaitlistEntry,
      });

      // Fire-and-forget: send cancellation email
      fireCancellationEmail(db, schema, MOCK_USER_ID, bookingRow, updated).catch(() => {});
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

    // Fire-and-forget: log mock cancellation email for dev
    sendBookingCancellation({
      to: "mock-user@example.com",
      userName: "Mock User",
      className: booking.className,
      studioName: booking.studioName,
      date: new Date(booking.bookedAt).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
      time: booking.timeSlot ?? "TBA",
      bookingRef: `PH-${String(booking.id).padStart(5, "0")}`,
    }).catch(() => {});
  } catch (_error) {
    res.status(500).json({ error: "Failed to cancel booking" });
  }
});

// ---------------------------------------------------------------------------
// WAITLIST endpoints
// ---------------------------------------------------------------------------

/**
 * GET /api/waitlist
 * Get the current user's waitlist entries.
 */
router.get("/waitlist", async (_req, res) => {
  try {
    const database = await getDatabase();

    if (!database) {
      res.json([]);
      return;
    }

    const { db, schema } = database;

    const entries = await db
      .select({
        id: schema.waitlist.id,
        userId: schema.waitlist.userId,
        classId: schema.waitlist.classId,
        status: schema.waitlist.status,
        joinedAt: schema.waitlist.joinedAt,
        promotedAt: schema.waitlist.promotedAt,
        className: schema.classes.title,
        studioName: schema.studios.name,
      })
      .from(schema.waitlist)
      .leftJoin(schema.classes, eq(schema.waitlist.classId, schema.classes.id))
      .leftJoin(schema.studios, eq(schema.classes.studioId, schema.studios.id))
      .where(
        and(
          eq(schema.waitlist.userId, MOCK_USER_ID),
          eq(schema.waitlist.status, "waiting"),
        ),
      )
      .orderBy(asc(schema.waitlist.joinedAt));

    res.json(entries);
  } catch (_error) {
    res.status(500).json({ error: "Failed to fetch waitlist" });
  }
});

/**
 * POST /api/waitlist
 * Body: { classId }
 *
 * Join the waitlist for a full class.
 */
router.post("/waitlist", async (req, res) => {
  const { classId } = req.body as { classId?: number };

  if (!classId) {
    res.status(400).json({ error: "classId is required" });
    return;
  }

  try {
    const database = await getDatabase();

    if (!database) {
      res.status(501).json({ error: "Waitlist requires a database connection" });
      return;
    }

    const { db, schema } = database;

    // Verify the class exists
    const [cls] = await db
      .select({
        id: schema.classes.id,
        maxCapacity: schema.classes.maxCapacity,
      })
      .from(schema.classes)
      .where(eq(schema.classes.id, classId))
      .limit(1);

    if (!cls) {
      res.status(404).json({ error: "Class not found" });
      return;
    }

    // Check the user doesn't already have a confirmed booking
    const [existingBooking] = await db
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

    if (existingBooking) {
      res.status(409).json({ error: "You already have a confirmed booking for this class" });
      return;
    }

    // Check the user isn't already on the waitlist
    const [existingWait] = await db
      .select()
      .from(schema.waitlist)
      .where(
        and(
          eq(schema.waitlist.userId, MOCK_USER_ID),
          eq(schema.waitlist.classId, classId),
          eq(schema.waitlist.status, "waiting"),
        ),
      )
      .limit(1);

    if (existingWait) {
      res.status(409).json({ error: "You are already on the waitlist for this class" });
      return;
    }

    // Check that the class is actually full (otherwise user should book normally)
    const [{ count: confirmedCount }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.bookings)
      .where(
        and(
          eq(schema.bookings.classId, classId),
          eq(schema.bookings.status, "confirmed"),
        ),
      );

    if (confirmedCount < cls.maxCapacity) {
      res.status(400).json({
        error: "Class still has spots available -- book directly instead",
        spotsLeft: cls.maxCapacity - confirmedCount,
      });
      return;
    }

    // Add to waitlist
    const [entry] = await db
      .insert(schema.waitlist)
      .values({
        userId: MOCK_USER_ID,
        classId,
        status: "waiting",
      })
      .returning();

    // Count position in waitlist
    const [{ count: position }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.waitlist)
      .where(
        and(
          eq(schema.waitlist.classId, classId),
          eq(schema.waitlist.status, "waiting"),
        ),
      );

    res.status(201).json({
      ...entry,
      position,
    });
  } catch (_error) {
    res.status(500).json({ error: "Failed to join waitlist" });
  }
});

/**
 * DELETE /api/waitlist/:id
 * Leave the waitlist.
 */
router.delete("/waitlist/:id", async (req, res) => {
  const id = Number(req.params["id"]);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid waitlist id" });
    return;
  }

  try {
    const database = await getDatabase();

    if (!database) {
      res.status(501).json({ error: "Waitlist requires a database connection" });
      return;
    }

    const { db, schema } = database;

    const [entry] = await db
      .select()
      .from(schema.waitlist)
      .where(
        and(
          eq(schema.waitlist.id, id),
          eq(schema.waitlist.userId, MOCK_USER_ID),
          eq(schema.waitlist.status, "waiting"),
        ),
      )
      .limit(1);

    if (!entry) {
      res.status(404).json({ error: "Waitlist entry not found" });
      return;
    }

    const [updated] = await db
      .update(schema.waitlist)
      .set({ status: "expired" })
      .where(eq(schema.waitlist.id, id))
      .returning();

    res.json({ message: "Removed from waitlist", entry: updated });
  } catch (_error) {
    res.status(500).json({ error: "Failed to leave waitlist" });
  }
});

// ---------------------------------------------------------------------------
// Email helpers (fire-and-forget, never block the response)
// ---------------------------------------------------------------------------

async function fireBookingConfirmationEmail(
  db: any,
  schema: any,
  userId: number,
  bookingResult: any,
): Promise<void> {
  try {
    // Look up user email
    const [user] = await db
      .select({ email: schema.users.email, displayName: schema.users.displayName })
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    if (!user?.email) return;

    // Look up studio address
    const [studio] = await db
      .select({ address: schema.studios.address })
      .from(schema.studios)
      .where(eq(schema.studios.id, bookingResult.studioId))
      .limit(1);

    // Look up class duration & scheduledAt
    const [cls] = await db
      .select({ duration: schema.classes.duration, scheduledAt: schema.classes.scheduledAt })
      .from(schema.classes)
      .where(eq(schema.classes.id, bookingResult.classId))
      .limit(1);

    const scheduledDate = cls?.scheduledAt ? new Date(cls.scheduledAt) : new Date(bookingResult.bookedAt);

    await sendBookingConfirmation({
      to: user.email,
      userName: user.displayName ?? "Pilates Lover",
      className: bookingResult.className ?? "Class",
      studioName: bookingResult.studioName ?? "Studio",
      studioAddress: studio?.address ?? "See studio details",
      date: scheduledDate.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
      time: bookingResult.timeSlot ?? scheduledDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      duration: cls?.duration ?? 60,
      bookingRef: `PH-${String(bookingResult.id).padStart(5, "0")}`,
      price: "0.00",
    });
  } catch (err) {
    logger.error({ err }, "Failed to send booking confirmation email");
  }
}

async function fireCancellationEmail(
  db: any,
  schema: any,
  userId: number,
  originalBooking: any,
  _updatedBooking: any,
): Promise<void> {
  try {
    // Look up user email
    const [user] = await db
      .select({ email: schema.users.email, displayName: schema.users.displayName })
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    if (!user?.email) return;

    // Look up class scheduledAt
    const [cls] = await db
      .select({ scheduledAt: schema.classes.scheduledAt })
      .from(schema.classes)
      .where(eq(schema.classes.id, originalBooking.classId))
      .limit(1);

    const scheduledDate = cls?.scheduledAt ? new Date(cls.scheduledAt) : new Date();

    // Look up class name and studio name via joins
    const [bookingInfo] = await db
      .select({ className: schema.classes.title, studioName: schema.studios.name })
      .from(schema.bookings)
      .leftJoin(schema.classes, eq(schema.bookings.classId, schema.classes.id))
      .leftJoin(schema.studios, eq(schema.bookings.studioId, schema.studios.id))
      .where(eq(schema.bookings.id, originalBooking.id))
      .limit(1);

    await sendBookingCancellation({
      to: user.email,
      userName: user.displayName ?? "Pilates Lover",
      className: bookingInfo?.className ?? "Class",
      studioName: bookingInfo?.studioName ?? "Studio",
      date: scheduledDate.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
      time: originalBooking.timeSlot ?? "TBA",
      bookingRef: `PH-${String(originalBooking.id).padStart(5, "0")}`,
    });
  } catch (err) {
    logger.error({ err }, "Failed to send booking cancellation email");
  }
}

export default router;
