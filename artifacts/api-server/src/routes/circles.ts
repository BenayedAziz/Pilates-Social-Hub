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

interface PilatesCircle {
  id: number;
  name: string;
  description: string;
  emoji: string;
  members: AppUser[];
  totalSessions: number;
  totalCalories: number;
  isJoined: boolean;
}

// ---------------------------------------------------------------------------
// Mock users
// ---------------------------------------------------------------------------
const USERS: AppUser[] = [
  { id: 1, name: "Emma D", initials: "ED", color: "bg-rose-200" },
  { id: 2, name: "Lucas M", initials: "LM", color: "bg-blue-200" },
  { id: 3, name: "Sophie B", initials: "SB", color: "bg-green-200" },
  { id: 4, name: "Alex R", initials: "AR", color: "bg-yellow-200" },
  { id: 5, name: "Marie C", initials: "MC", color: "bg-purple-200" },
  { id: 6, name: "Pierre T", initials: "PT", color: "bg-orange-200" },
  { id: 7, name: "Isabelle F", initials: "IF", color: "bg-teal-200" },
  { id: 8, name: "Thomas G", initials: "TG", color: "bg-indigo-200" },
  { id: 9, name: "Lea N", initials: "LN", color: "bg-pink-200" },
  { id: 10, name: "Hugo P", initials: "HP", color: "bg-cyan-200" },
];

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const mockCircles: PilatesCircle[] = [
  {
    id: 1,
    name: "Morning Flow Crew",
    description: "Early risers who love starting the day with Pilates. We meet every weekday before 9 AM!",
    emoji: "\uD83C\uDF05",
    members: [USERS[0], USERS[1], USERS[2], USERS[5], USERS[8]],
    totalSessions: 234,
    totalCalories: 68500,
    isJoined: true,
  },
  {
    id: 2,
    name: "Marais Pilates Gang",
    description: "Le Marais locals who share studio tips, class reviews, and post-session coffee spots.",
    emoji: "\uD83C\uDDEB\uD83C\uDDF7",
    members: [USERS[2], USERS[3], USERS[6], USERS[9]],
    totalSessions: 187,
    totalCalories: 54200,
    isJoined: false,
  },
  {
    id: 3,
    name: "30-Day Challengers",
    description: "Committed to 30 consecutive days of Pilates. No excuses, just results!",
    emoji: "\uD83D\uDD25",
    members: [USERS[0], USERS[4], USERS[7], USERS[3], USERS[1], USERS[9]],
    totalSessions: 412,
    totalCalories: 121000,
    isJoined: true,
  },
  {
    id: 4,
    name: "Reformer Addicts",
    description: "Can't get enough of the reformer? Neither can we. Tips, tricks, and reformer love.",
    emoji: "\uD83D\uDCAA",
    members: [USERS[1], USERS[5], USERS[8], USERS[6]],
    totalSessions: 298,
    totalCalories: 89400,
    isJoined: false,
  },
  {
    id: 5,
    name: "Paris Pilates Moms",
    description: "Moms balancing Pilates with family life. Supportive community for all levels.",
    emoji: "\uD83D\uDC9C",
    members: [USERS[4], USERS[2], USERS[7]],
    totalSessions: 156,
    totalCalories: 45800,
    isJoined: false,
  },
];

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
const router: IRouter = Router();

/**
 * GET /api/circles
 * Returns list of circles.
 */
router.get("/circles", (_req, res) => {
  res.json(mockCircles);
});

/**
 * POST /api/circles/:id/join
 * Join a circle.
 */
router.post("/circles/:id/join", (req, res) => {
  const id = Number(req.params["id"]);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid circle id" });
    return;
  }

  const circle = mockCircles.find((c) => c.id === id);
  if (!circle) {
    res.status(404).json({ error: "Circle not found" });
    return;
  }

  if (circle.isJoined) {
    res.status(400).json({ error: "Already a member of this circle" });
    return;
  }

  circle.isJoined = true;
  // Add mock current user to members
  const currentUser = USERS[0];
  if (!circle.members.find((m) => m.id === currentUser.id)) {
    circle.members.push(currentUser);
  }

  res.json(circle);
});

/**
 * POST /api/circles/:id/leave
 * Leave a circle.
 */
router.post("/circles/:id/leave", (req, res) => {
  const id = Number(req.params["id"]);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid circle id" });
    return;
  }

  const circle = mockCircles.find((c) => c.id === id);
  if (!circle) {
    res.status(404).json({ error: "Circle not found" });
    return;
  }

  if (!circle.isJoined) {
    res.status(400).json({ error: "Not a member of this circle" });
    return;
  }

  circle.isJoined = false;
  circle.members = circle.members.filter((m) => m.id !== USERS[0].id);

  res.json(circle);
});

export default router;
