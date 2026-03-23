import { Router, type IRouter } from "express";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Challenge {
  id: number;
  title: string;
  description: string;
  type: "monthly" | "weekly" | "bingo";
  startDate: string;
  endDate: string;
  target: number;
  progress: number;
  participants: number;
  reward: string;
  icon: string;
}

interface BingoCell {
  id: number;
  text: string;
  completed: boolean;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const mockChallenges: Challenge[] = [
  {
    id: 1,
    title: "March Madness",
    description: "Complete 20 Pilates sessions this month to earn the March Madness badge!",
    type: "monthly",
    startDate: "2026-03-01",
    endDate: "2026-03-31",
    target: 20,
    progress: 12,
    participants: 347,
    reward: "March Madness Badge + 500 XP",
    icon: "\uD83C\uDFC0",
  },
  {
    id: 2,
    title: "Early Bird Week",
    description: "Attend 5 sessions before 9 AM this week. Rise and reformer!",
    type: "weekly",
    startDate: "2026-03-17",
    endDate: "2026-03-23",
    target: 5,
    progress: 3,
    participants: 128,
    reward: "Early Bird Badge + 200 XP",
    icon: "\uD83C\uDF05",
  },
  {
    id: 3,
    title: "Studio Explorer",
    description: "Visit 5 different studios this month. Discover new spaces!",
    type: "monthly",
    startDate: "2026-03-01",
    endDate: "2026-03-31",
    target: 5,
    progress: 2,
    participants: 215,
    reward: "Explorer Badge + 300 XP",
    icon: "\uD83D\uDDFA\uFE0F",
  },
  {
    id: 4,
    title: "Reformer Master",
    description: "Complete 15 reformer classes this month. Master the machine!",
    type: "monthly",
    startDate: "2026-03-01",
    endDate: "2026-03-31",
    target: 15,
    progress: 9,
    participants: 189,
    reward: "Reformer Master Badge + 400 XP",
    icon: "\uD83D\uDCAA",
  },
  {
    id: 5,
    title: "Calorie Torch",
    description: "Burn 5,000 calories through Pilates sessions this month.",
    type: "monthly",
    startDate: "2026-03-01",
    endDate: "2026-03-31",
    target: 5000,
    progress: 3200,
    participants: 264,
    reward: "Calorie Torch Badge + 350 XP",
    icon: "\uD83D\uDD25",
  },
];

const mockBingoCells: BingoCell[] = [
  { id: 1, text: "Morning class", completed: true },
  { id: 2, text: "Try a new studio", completed: false },
  { id: 3, text: "60min+ session", completed: true },
  { id: 4, text: "Invite a friend", completed: false },
  { id: 5, text: "Reformer class", completed: true },
  { id: 6, text: "Weekend session", completed: false },
  { id: 7, text: "Burn 400+ cal", completed: true },
  { id: 8, text: "Mat Pilates", completed: false },
  { id: 9, text: "Post a check-in", completed: false },
  { id: 10, text: "Cadillac class", completed: false },
  { id: 11, text: "Back-to-back days", completed: true },
  { id: 12, text: "Try a new coach", completed: false },
  { id: 13, text: "Before 8 AM", completed: false },
  { id: 14, text: "Private session", completed: false },
  { id: 15, text: "5-day streak", completed: false },
  { id: 16, text: "Chair Pilates", completed: false },
];

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
const router: IRouter = Router();

/**
 * GET /api/challenges
 * Returns list of active challenges.
 */
router.get("/challenges", (_req, res) => {
  res.json(mockChallenges);
});

/**
 * GET /api/bingo
 * Returns the bingo card cells.
 */
router.get("/bingo", (_req, res) => {
  res.json(mockBingoCells);
});

export default router;
