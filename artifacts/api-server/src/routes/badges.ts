import { Router, type IRouter } from "express";
import { getDatabase } from "../lib/database";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface BadgeItem {
  id: number;
  name: string;
  description: string;
  iconName: string;
  earned: boolean;
  earnedAt: string | null;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const mockBadges: BadgeItem[] = [
  {
    id: 1,
    name: "First Session",
    description: "Complete your very first Pilates session. Welcome to the community!",
    iconName: "Star",
    earned: true,
    earnedAt: "2026-01-10T09:00:00Z",
  },
  {
    id: 2,
    name: "7-Day Streak",
    description: "Attend Pilates sessions for 7 consecutive days. Consistency is key!",
    iconName: "Flame",
    earned: true,
    earnedAt: "2026-02-05T18:00:00Z",
  },
  {
    id: 3,
    name: "100 Sessions",
    description: "Complete 100 total Pilates sessions. You are a true Pilates devotee!",
    iconName: "Trophy",
    earned: false,
    earnedAt: null,
  },
  {
    id: 4,
    name: "Calorie Crusher",
    description: "Burn over 10,000 calories through Pilates. Your body thanks you!",
    iconName: "Zap",
    earned: false,
    earnedAt: null,
  },
  {
    id: 5,
    name: "Early Bird",
    description: "Attend 10 sessions that start before 8 AM. Rise and reformer!",
    iconName: "Sunrise",
    earned: true,
    earnedAt: "2026-03-01T07:00:00Z",
  },
  {
    id: 6,
    name: "Social Butterfly",
    description: "Join 3 circles and attend a group challenge. Pilates is better together!",
    iconName: "Users",
    earned: false,
    earnedAt: null,
  },
];

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
const router: IRouter = Router();

/**
 * GET /api/badges
 * Returns all badges with earned status for the current user.
 */
router.get("/badges", async (_req, res) => {
  try {
    const database = await getDatabase();

    if (database) {
      const { db, schema } = database;

      if (schema.badges) {
        const allBadges = await db.select().from(schema.badges);

        // Get earned badges for mock current user (id=1)
        const earnedRows = schema.userBadges
          ? await db.select().from(schema.userBadges)
          : [];

        const earnedMap = new Map<number, string>();
        for (const row of earnedRows) {
          earnedMap.set(row.badgeId, row.earnedAt?.toISOString?.() ?? null);
        }

        const results: BadgeItem[] = allBadges.map((b: any) => ({
          id: b.id,
          name: b.name,
          description: b.description ?? "",
          iconName: b.iconName,
          earned: earnedMap.has(b.id),
          earnedAt: earnedMap.get(b.id) ?? null,
        }));

        res.json(results);
        return;
      }
    }

    // Fallback to mock data
    res.json(mockBadges);
  } catch (_error) {
    res.status(500).json({ error: "Failed to fetch badges" });
  }
});

export default router;
