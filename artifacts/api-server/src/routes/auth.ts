import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDatabase } from "../lib/database";
import { generateToken, authMiddleware } from "../middleware/auth";

// ---------------------------------------------------------------------------
// Types (mirrors DB schema – used for mock fallback)
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
// Mock data (fallback when DATABASE_URL is not set)
// Passwords are bcrypt-hashed.
// ---------------------------------------------------------------------------
const mockUsers: UserRecord[] = [
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
    password: bcrypt.hashSync("password123", 10),
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
    password: bcrypt.hashSync("password123", 10),
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
    password: bcrypt.hashSync("password123", 10),
  },
];

let nextUserId = 4;

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
const router: IRouter = Router();

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Returns: { user, token }
 */
router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }

  try {
    const database = await getDatabase();

    if (database) {
      const { db, schema } = database;
      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, email))
        .limit(1);

      if (!user) {
        res.status(401).json({ message: "Invalid email or password" });
        return;
      }

      // TODO: add real password comparison when a password column is added
      // to the users table. For now, DB-mode trusts the email lookup.
      const token = generateToken({ userId: user.id, email: user.email });
      res.json({ user, token });
      return;
    }

    // Fallback to mock data
    const user = mockUsers.find((u) => u.email === email);
    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const token = generateToken({ userId: user.id, email: user.email });
    res.json({ user: toSafeUser(user), token });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
});

/**
 * POST /api/auth/signup
 * Body: { name, email, password }
 * Returns: { user, token }
 */
router.post("/auth/signup", async (req, res) => {
  const { name, email, password } = req.body as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (!name || !email || !password) {
    res
      .status(400)
      .json({ message: "Name, email, and password are required" });
    return;
  }

  if (password.length < 6) {
    res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
    return;
  }

  try {
    const database = await getDatabase();

    if (database) {
      const { db, schema } = database;

      // Check for existing user
      const [existing] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, email))
        .limit(1);

      if (existing) {
        res
          .status(409)
          .json({ message: "Email already registered" });
        return;
      }

      const username =
        email.split("@")[0] ?? name.toLowerCase().replace(/\s+/g, "_");

      const [newUser] = await db
        .insert(schema.users)
        .values({
          email,
          username,
          displayName: name,
          level: "beginner",
        })
        .returning();

      const token = generateToken({
        userId: newUser.id,
        email: newUser.email,
      });
      res.status(201).json({ user: newUser, token });
      return;
    }

    // Fallback to mock data
    const existing = mockUsers.find((u) => u.email === email);
    if (existing) {
      res.status(409).json({ message: "Email already registered" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const username =
      email.split("@")[0] ?? name.toLowerCase().replace(/\s+/g, "_");

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
      password: hashedPassword,
    };

    mockUsers.push(user);

    const token = generateToken({ userId: user.id, email: user.email });
    res.status(201).json({ user: toSafeUser(user), token });
  } catch (error) {
    res.status(500).json({ message: "Signup failed" });
  }
});

/**
 * GET /api/auth/me (protected)
 * Requires: Bearer token in Authorization header
 * Returns: SafeUser
 */
router.get("/auth/me", authMiddleware, async (req, res) => {
  try {
    const database = await getDatabase();

    if (database) {
      const { db, schema } = database;
      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, req.user!.userId))
        .limit(1);

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res.json(user);
      return;
    }

    // Fallback to mock data
    const user = mockUsers.find((u) => u.id === req.user!.userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(toSafeUser(user));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

/**
 * PUT /api/auth/profile (protected)
 * Body: { name?, bio?, level? }
 * Returns: updated SafeUser
 */
router.put("/auth/profile", authMiddleware, async (req, res) => {
  const { name, bio, level } = req.body as {
    name?: string;
    bio?: string;
    level?: string;
  };

  // Validate inputs
  if (name !== undefined && (typeof name !== "string" || name.trim().length < 2)) {
    res.status(400).json({ message: "Name must be at least 2 characters" });
    return;
  }

  if (bio !== undefined && (typeof bio !== "string" || bio.length > 150)) {
    res.status(400).json({ message: "Bio must be 150 characters or less" });
    return;
  }

  const validLevels = ["beginner", "intermediate", "advanced"];
  if (
    level !== undefined &&
    (typeof level !== "string" || !validLevels.includes(level.toLowerCase()))
  ) {
    res
      .status(400)
      .json({ message: "Level must be beginner, intermediate, or advanced" });
    return;
  }

  try {
    const database = await getDatabase();

    if (database) {
      const { db, schema } = database;

      const updateData: Record<string, string> = {};
      if (name !== undefined) updateData.displayName = name.trim();
      if (bio !== undefined) updateData.bio = bio;
      if (level !== undefined) updateData.level = level.toLowerCase();

      const [updated] = await db
        .update(schema.users)
        .set({ ...updateData, updatedAt: new Date().toISOString() })
        .where(eq(schema.users.id, req.user!.userId))
        .returning();

      if (!updated) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res.json(updated);
      return;
    }

    // Fallback to mock data
    const user = mockUsers.find((u) => u.id === req.user!.userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (name !== undefined) user.displayName = name.trim();
    if (bio !== undefined) user.bio = bio;
    if (level !== undefined) user.level = level.toLowerCase();
    user.updatedAt = new Date().toISOString();

    res.json(toSafeUser(user));
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile" });
  }
});

export default router;
