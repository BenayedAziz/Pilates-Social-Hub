import { Router, type IRouter } from "express";

// ---------------------------------------------------------------------------
// Types (mirrors DB schema – swap to Drizzle select types when DB is wired)
// ---------------------------------------------------------------------------
interface UserRecord {
  id: number;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  level: string;
  createdAt: string;
  updatedAt: string;
  // Stored only in-memory for the mock – never sent to client
  password: string;
}

// Safe user object (without password)
type SafeUser = Omit<UserRecord, "password">;

function toSafeUser(u: UserRecord): SafeUser {
  const { password: _pw, ...safe } = u;
  return safe;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const users: UserRecord[] = [
  {
    id: 1,
    email: "emma@example.com",
    username: "emma_d",
    displayName: "Emma D",
    avatarUrl: null,
    bio: "Reformer enthusiast based in Le Marais. 3x per week.",
    level: "advanced",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2026-03-01T12:00:00Z",
    password: "password123",
  },
  {
    id: 2,
    email: "lucas@example.com",
    username: "lucas_m",
    displayName: "Lucas M",
    avatarUrl: null,
    bio: "Mat Pilates lover and aspiring instructor.",
    level: "intermediate",
    createdAt: "2024-02-20T10:00:00Z",
    updatedAt: "2026-03-01T12:00:00Z",
    password: "password123",
  },
  {
    id: 3,
    email: "sophie@example.com",
    username: "sophie_b",
    displayName: "Sophie B",
    avatarUrl: null,
    bio: "Just started my Pilates journey!",
    level: "beginner",
    createdAt: "2024-06-10T10:00:00Z",
    updatedAt: "2026-03-01T12:00:00Z",
    password: "password123",
  },
];

let nextUserId = 4;

// Simulate a "current session" – set after login/signup
let currentUserId: number | null = 1; // default to user 1 for easy dev

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
const router: IRouter = Router();

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
router.post("/auth/login", (req, res) => {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }

  const user = users.find((u) => u.email === email);
  if (!user || user.password !== password) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  currentUserId = user.id;
  res.json(toSafeUser(user));
});

/**
 * POST /api/auth/signup
 * Body: { name, email, password }
 */
router.post("/auth/signup", (req, res) => {
  const { name, email, password } = req.body as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (!name || !email || !password) {
    res.status(400).json({ error: "name, email, and password are required" });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: "password must be at least 6 characters" });
    return;
  }

  const existing = users.find((u) => u.email === email);
  if (existing) {
    res.status(409).json({ error: "An account with this email already exists" });
    return;
  }

  const username = email.split("@")[0] ?? name.toLowerCase().replace(/\s+/g, "_");

  const user: UserRecord = {
    id: nextUserId++,
    email,
    username,
    displayName: name,
    avatarUrl: null,
    bio: null,
    level: "beginner",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    password,
  };

  users.push(user);
  currentUserId = user.id;

  res.status(201).json(toSafeUser(user));
});

/**
 * GET /api/auth/me
 * Returns the currently "logged in" user (mock session).
 */
router.get("/auth/me", (_req, res) => {
  if (currentUserId === null) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const user = users.find((u) => u.id === currentUserId);
  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  res.json(toSafeUser(user));
});

export default router;
