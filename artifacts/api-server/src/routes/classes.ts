import { Router, type IRouter } from "express";
import { getDatabase } from "../lib/database";
import { eq, and, sql } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Types (mirrors DB schema -- used for mock fallback)
// ---------------------------------------------------------------------------
interface PilatesClass {
  id: number;
  studioId: number;
  coachId: number | null;
  title: string;
  type: string;
  level: string;
  description: string | null;
  duration: number;
  maxCapacity: number;
  price: number;
  scheduledAt: string;
  studioName: string;
  coachName: string | null;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Mock data (fallback when DATABASE_URL is not set)
// ---------------------------------------------------------------------------
const mockClasses: PilatesClass[] = [
  {
    id: 1,
    studioId: 1,
    coachId: 1,
    title: "Reformer Advanced",
    type: "reformer",
    level: "advanced",
    description: "Challenging reformer class focusing on dynamic movements and spring resistance.",
    duration: 55,
    maxCapacity: 10,
    price: 45,
    scheduledAt: "2026-03-23T09:00:00Z",
    studioName: "Studio Harmonie",
    coachName: "Sophie Leclerc",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: 2,
    studioId: 3,
    coachId: 5,
    title: "Mat Pilates Core",
    type: "mat",
    level: "intermediate",
    description: "Core-focused mat class with props including resistance bands and Pilates balls.",
    duration: 45,
    maxCapacity: 15,
    price: 38,
    scheduledAt: "2026-03-23T10:30:00Z",
    studioName: "Core & Flow",
    coachName: "Camille Bernard",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: 3,
    studioId: 2,
    coachId: 3,
    title: "Cadillac Intro",
    type: "cadillac",
    level: "beginner",
    description: "Introduction to the Cadillac apparatus. Perfect for newcomers and those working with injuries.",
    duration: 60,
    maxCapacity: 6,
    price: 55,
    scheduledAt: "2026-03-23T11:00:00Z",
    studioName: "Pilates Lumiere",
    coachName: "Marie Dubois",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: 4,
    studioId: 4,
    coachId: 7,
    title: "Wunda Chair Blast",
    type: "chair",
    level: "advanced",
    description: "High-intensity chair class designed to build strength and balance.",
    duration: 45,
    maxCapacity: 8,
    price: 50,
    scheduledAt: "2026-03-23T14:00:00Z",
    studioName: "Reform Studio Paris",
    coachName: "Isabelle Dupont",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: 5,
    studioId: 5,
    coachId: 9,
    title: "Reformer Flow",
    type: "reformer",
    level: "intermediate",
    description: "Flowing reformer sequences linking breath with movement for a mind-body workout.",
    duration: 50,
    maxCapacity: 12,
    price: 42,
    scheduledAt: "2026-03-23T16:00:00Z",
    studioName: "Equilibre Pilates",
    coachName: "Elise Martin",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: 6,
    studioId: 1,
    coachId: 2,
    title: "Spine Corrector",
    type: "spine-corrector",
    level: "intermediate",
    description: "Work with the Spine Corrector to improve spinal articulation and flexibility.",
    duration: 40,
    maxCapacity: 8,
    price: 45,
    scheduledAt: "2026-03-24T09:00:00Z",
    studioName: "Studio Harmonie",
    coachName: "Julien Moreau",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: 7,
    studioId: 8,
    coachId: 15,
    title: "Tower & Reformer",
    type: "reformer",
    level: "advanced",
    description: "Dual apparatus class alternating between Tower and Reformer for a full-body challenge.",
    duration: 75,
    maxCapacity: 8,
    price: 60,
    scheduledAt: "2026-03-24T10:00:00Z",
    studioName: "BodyWork Pilates",
    coachName: "Celine Blanc",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: 8,
    studioId: 3,
    coachId: 6,
    title: "Mat Beginner",
    type: "mat",
    level: "beginner",
    description: "Gentle introduction to classical Pilates mat work. No equipment needed.",
    duration: 50,
    maxCapacity: 20,
    price: 38,
    scheduledAt: "2026-03-24T11:30:00Z",
    studioName: "Core & Flow",
    coachName: "Lucas Fontaine",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: 9,
    studioId: 7,
    coachId: 13,
    title: "Reformer Cardio",
    type: "reformer",
    level: "intermediate",
    description: "High-energy reformer class with cardio intervals. Expect to sweat!",
    duration: 45,
    maxCapacity: 10,
    price: 48,
    scheduledAt: "2026-03-24T14:00:00Z",
    studioName: "Pilates Zen",
    coachName: "Audrey Girard",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: 10,
    studioId: 5,
    coachId: 10,
    title: "Classical Mat",
    type: "mat",
    level: "intermediate",
    description: "Traditional Joseph Pilates mat sequence performed in its original order.",
    duration: 60,
    maxCapacity: 15,
    price: 42,
    scheduledAt: "2026-03-24T17:00:00Z",
    studioName: "Equilibre Pilates",
    coachName: "Pierre Garnier",
    createdAt: "2024-01-15T10:00:00Z",
  },
];

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
const router: IRouter = Router();

/**
 * GET /api/classes
 * Query params: ?studioId=1&type=reformer
 *
 * Returns classes with `spotsLeft` computed from confirmed bookings.
 */
router.get("/classes", async (req, res) => {
  try {
    const database = await getDatabase();

    if (database) {
      const { db, schema } = database;

      // Build query with optional filters
      let query = db
        .select({
          id: schema.classes.id,
          studioId: schema.classes.studioId,
          coachId: schema.classes.coachId,
          title: schema.classes.title,
          type: schema.classes.type,
          level: schema.classes.level,
          description: schema.classes.description,
          duration: schema.classes.duration,
          maxCapacity: schema.classes.maxCapacity,
          price: schema.classes.price,
          scheduledAt: schema.classes.scheduledAt,
          createdAt: schema.classes.createdAt,
          studioName: schema.studios.name,
          coachName: schema.coaches.name,
        })
        .from(schema.classes)
        .leftJoin(schema.studios, eq(schema.classes.studioId, schema.studios.id))
        .leftJoin(schema.coaches, eq(schema.classes.coachId, schema.coaches.id));

      const studioId = req.query["studioId"] as string | undefined;
      if (studioId) {
        const sid = Number(studioId);
        if (Number.isNaN(sid)) {
          res.status(400).json({ error: "Invalid studioId" });
          return;
        }
        query = query.where(eq(schema.classes.studioId, sid)) as typeof query;
      }

      const type = (req.query["type"] as string | undefined)?.toLowerCase();
      if (type) {
        query = query.where(eq(schema.classes.type, type)) as typeof query;
      }

      const classes: Array<{
        id: number;
        studioId: number;
        coachId: number | null;
        title: string;
        type: string;
        level: string;
        description: string | null;
        duration: number;
        maxCapacity: number;
        price: number;
        scheduledAt: Date;
        createdAt: Date;
        studioName: string | null;
        coachName: string | null;
      }> = await query;

      // Batch-fetch confirmed booking counts for all returned class IDs
      const bookingCounts: Map<number, number> = new Map();

      if (classes.length > 0) {
        const counts = await db
          .select({
            classId: schema.bookings.classId,
            count: sql<number>`count(*)::int`,
          })
          .from(schema.bookings)
          .where(eq(schema.bookings.status, "confirmed"))
          .groupBy(schema.bookings.classId);

        for (const row of counts) {
          bookingCounts.set(row.classId, row.count);
        }
      }

      const results = classes.map((c: typeof classes[number]) => {
        const confirmed = bookingCounts.get(c.id) ?? 0;
        return {
          ...c,
          spotsLeft: Math.max(0, c.maxCapacity - confirmed),
        };
      });

      res.json(results);
      return;
    }

    // Fallback to mock data (spotsLeft = maxCapacity for mocks)
    let results = [...mockClasses];

    const studioId = req.query["studioId"] as string | undefined;
    if (studioId) {
      const sid = Number(studioId);
      if (Number.isNaN(sid)) {
        res.status(400).json({ error: "Invalid studioId" });
        return;
      }
      results = results.filter((c) => c.studioId === sid);
    }

    const type = (req.query["type"] as string | undefined)?.toLowerCase();
    if (type) {
      results = results.filter((c) => c.type.toLowerCase() === type);
    }

    res.json(results.map((c) => ({ ...c, spotsLeft: c.maxCapacity })));
  } catch (_error) {
    res.status(500).json({ error: "Failed to fetch classes" });
  }
});

/**
 * GET /api/classes/:id
 *
 * Returns a single class with `spotsLeft`.
 */
router.get("/classes/:id", async (req, res) => {
  const id = Number(req.params["id"]);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid class id" });
    return;
  }

  try {
    const database = await getDatabase();

    if (database) {
      const { db, schema } = database;
      const [cls] = await db
        .select({
          id: schema.classes.id,
          studioId: schema.classes.studioId,
          coachId: schema.classes.coachId,
          title: schema.classes.title,
          type: schema.classes.type,
          level: schema.classes.level,
          description: schema.classes.description,
          duration: schema.classes.duration,
          maxCapacity: schema.classes.maxCapacity,
          price: schema.classes.price,
          scheduledAt: schema.classes.scheduledAt,
          createdAt: schema.classes.createdAt,
          studioName: schema.studios.name,
          coachName: schema.coaches.name,
        })
        .from(schema.classes)
        .leftJoin(schema.studios, eq(schema.classes.studioId, schema.studios.id))
        .leftJoin(schema.coaches, eq(schema.classes.coachId, schema.coaches.id))
        .where(eq(schema.classes.id, id))
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
            eq(schema.bookings.classId, id),
            eq(schema.bookings.status, "confirmed"),
          ),
        );

      res.json({
        ...cls,
        spotsLeft: Math.max(0, cls.maxCapacity - confirmedCount),
      });
      return;
    }

    // Fallback to mock data
    const cls = mockClasses.find((c) => c.id === id);
    if (!cls) {
      res.status(404).json({ error: "Class not found" });
      return;
    }

    res.json({ ...cls, spotsLeft: cls.maxCapacity });
  } catch (_error) {
    res.status(500).json({ error: "Failed to fetch class" });
  }
});

export default router;
