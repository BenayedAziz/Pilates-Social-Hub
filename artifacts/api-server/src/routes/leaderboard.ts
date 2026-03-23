import { Router, type IRouter } from "express";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface AppUser {
  id: number;
  name: string;
  initials: string;
  color: string;
}

interface LeaderboardEntry {
  rank: number;
  user: AppUser;
  sessions: number;
  calories: number;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const mockLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    user: { id: 7, name: "Isabelle F", initials: "IF", color: "bg-teal-200" },
    sessions: 14,
    calories: 4120,
  },
  {
    rank: 2,
    user: { id: 1, name: "Emma D", initials: "ED", color: "bg-rose-200" },
    sessions: 12,
    calories: 3650,
  },
  {
    rank: 3,
    user: { id: 9, name: "Lea N", initials: "LN", color: "bg-pink-200" },
    sessions: 11,
    calories: 3310,
  },
  {
    rank: 4,
    user: { id: 3, name: "Sophie B", initials: "SB", color: "bg-green-200" },
    sessions: 9,
    calories: 2780,
  },
  {
    rank: 5,
    user: { id: 6, name: "Pierre T", initials: "PT", color: "bg-orange-200" },
    sessions: 8,
    calories: 2450,
  },
];

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
const router: IRouter = Router();

/**
 * GET /api/leaderboard
 * Returns weekly leaderboard entries.
 */
router.get("/leaderboard", (_req, res) => {
  res.json(mockLeaderboard);
});

export default router;
