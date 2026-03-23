import { Router, type IRouter } from "express";
import { getDatabase } from "../lib/database";
import { eq, desc, sql } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface AppUser {
  id: number;
  name: string;
  initials: string;
  color: string;
}

interface StudioReview {
  id: number;
  studioId: number;
  userId: number;
  userName: string;
  userInitials: string;
  userColor: string;
  rating: number;
  text: string;
  date: string;
  helpful: number;
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
// Mock data (fallback when DATABASE_URL is not set)
// ---------------------------------------------------------------------------
const mockReviews: StudioReview[] = [
  { id: 1, studioId: 1, userId: 1, userName: "Emma D", userInitials: "ED", userColor: "bg-rose-200", rating: 5, text: "Absolutely love Studio Harmonie! The reformers are top-quality and Sophie is an incredible instructor. Best studio in Le Marais.", date: "2 days ago", helpful: 12 },
  { id: 2, studioId: 1, userId: 2, userName: "Lucas M", userInitials: "LM", userColor: "bg-blue-200", rating: 4, text: "Great equipment and atmosphere. A bit pricey at €45 but worth it for the quality. Would recommend for intermediate practitioners.", date: "1 week ago", helpful: 8 },
  { id: 3, studioId: 2, userId: 3, userName: "Sophie B", userInitials: "SB", userColor: "bg-green-200", rating: 5, text: "The view from Pilates Lumière is breathtaking! The Cadillac classes are exceptional. Premium experience.", date: "3 days ago", helpful: 15 },
  { id: 4, studioId: 3, userId: 4, userName: "Alex R", userInitials: "AR", userColor: "bg-yellow-200", rating: 5, text: "Core & Flow is the most welcoming studio I've been to. Great community vibe and very affordable.", date: "5 days ago", helpful: 6 },
  { id: 5, studioId: 3, userId: 5, userName: "Marie C", userInitials: "MC", userColor: "bg-purple-200", rating: 4, text: "Lovely studio at the base of Montmartre. Classes are well-structured. Only wish they had more evening slots.", date: "1 week ago", helpful: 4 },
  { id: 6, studioId: 4, userId: 6, userName: "Pierre T", userInitials: "PT", userColor: "bg-orange-200", rating: 4, text: "Reform Studio has the best Balanced Body equipment in Paris. Strong focus on technique.", date: "4 days ago", helpful: 9 },
  { id: 7, studioId: 5, userId: 7, userName: "Isabelle F", userInitials: "IF", userColor: "bg-teal-200", rating: 5, text: "Hidden gem in Pigalle! Small classes mean personal attention. The mat work here is exceptional.", date: "2 weeks ago", helpful: 7 },
  { id: 8, studioId: 6, userId: 8, userName: "Thomas G", userInitials: "TG", userColor: "bg-indigo-200", rating: 4, text: "Best value for reformer in Paris. No frills but great instruction.", date: "1 week ago", helpful: 11 },
  { id: 9, studioId: 7, userId: 9, userName: "Lea N", userInitials: "LN", userColor: "bg-pink-200", rating: 5, text: "The breath-work integration at Pilates Zen changed my practice. Truly unique approach.", date: "3 days ago", helpful: 13 },
  { id: 10, studioId: 8, userId: 10, userName: "Hugo P", userInitials: "HP", userColor: "bg-cyan-200", rating: 5, text: "BodyWork is worth every euro. The instructors are world-class. Professional dancers train here!", date: "6 days ago", helpful: 18 },
  { id: 11, studioId: 1, userId: 9, userName: "Lea N", userInitials: "LN", userColor: "bg-pink-200", rating: 5, text: "Sophie's reformer advanced class is life-changing. The attention to alignment is unmatched.", date: "2 weeks ago", helpful: 10 },
  { id: 12, studioId: 2, userId: 6, userName: "Pierre T", userInitials: "PT", userColor: "bg-orange-200", rating: 4, text: "Beautiful space, excellent Cadillac work. Parking is tricky in Saint-Germain though.", date: "1 week ago", helpful: 5 },
  { id: 13, studioId: 4, userId: 1, userName: "Emma D", userInitials: "ED", userColor: "bg-rose-200", rating: 5, text: "Marc's technique classes are next-level. You really feel the difference in your body after just a few sessions.", date: "3 days ago", helpful: 14 },
  { id: 14, studioId: 5, userId: 10, userName: "Hugo P", userInitials: "HP", userColor: "bg-cyan-200", rating: 4, text: "Intimate setting, very different from the big studios. Elise is a fantastic instructor.", date: "5 days ago", helpful: 3 },
  { id: 15, studioId: 6, userId: 4, userName: "Alex R", userInitials: "AR", userColor: "bg-yellow-200", rating: 5, text: "At €35 this is the best deal in Paris for reformer Pilates. Nathalie knows her craft!", date: "4 days ago", helpful: 16 },
  { id: 16, studioId: 7, userId: 2, userName: "Lucas M", userInitials: "LM", userColor: "bg-blue-200", rating: 4, text: "The mindfulness component adds so much depth. Left feeling renewed after every class.", date: "1 week ago", helpful: 8 },
  { id: 17, studioId: 8, userId: 3, userName: "Sophie B", userInitials: "SB", userColor: "bg-green-200", rating: 5, text: "Celine is hands-down the best instructor in Paris. Worth the premium price.", date: "2 days ago", helpful: 22 },
  { id: 18, studioId: 3, userId: 7, userName: "Isabelle F", userInitials: "IF", userColor: "bg-teal-200", rating: 5, text: "The community here is incredible. Made real friends through the morning classes.", date: "6 days ago", helpful: 9 },
  { id: 19, studioId: 2, userId: 8, userName: "Thomas G", userInitials: "TG", userColor: "bg-indigo-200", rating: 5, text: "Premium experience from start to finish. The towel service and post-class tea are lovely touches.", date: "4 days ago", helpful: 11 },
  { id: 20, studioId: 8, userId: 5, userName: "Marie C", userInitials: "MC", userColor: "bg-purple-200", rating: 4, text: "Amazing studio but book early - classes fill up within hours. The Tower & Reformer combo class is a must.", date: "1 week ago", helpful: 7 },
];

let nextReviewId = 21;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function computeTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
}

function mkInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const USER_COLORS = [
  "bg-rose-200",
  "bg-blue-200",
  "bg-green-200",
  "bg-yellow-200",
  "bg-purple-200",
  "bg-orange-200",
  "bg-teal-200",
  "bg-indigo-200",
  "bg-pink-200",
  "bg-cyan-200",
];

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
const router: IRouter = Router();

/**
 * GET /api/reviews?studioId=X
 * Returns reviews for a specific studio.
 */
router.get("/reviews", async (req, res) => {
  const studioIdParam = req.query["studioId"] as string | undefined;

  if (!studioIdParam) {
    res.status(400).json({ error: "studioId query parameter is required" });
    return;
  }

  const studioId = Number(studioIdParam);
  if (Number.isNaN(studioId)) {
    res.status(400).json({ error: "studioId must be a number" });
    return;
  }

  try {
    const database = await getDatabase();

    if (database) {
      const { db, schema } = database;

      // Check if reviews table exists in schema
      if (schema.reviews) {
        const rows = await db
          .select({
            id: schema.reviews.id,
            studioId: schema.reviews.studioId,
            userId: schema.reviews.userId,
            rating: schema.reviews.rating,
            text: schema.reviews.text,
            helpful: schema.reviews.helpful,
            createdAt: schema.reviews.createdAt,
            userName: schema.users.displayName,
          })
          .from(schema.reviews)
          .leftJoin(schema.users, eq(schema.reviews.userId, schema.users.id))
          .where(eq(schema.reviews.studioId, studioId))
          .orderBy(desc(schema.reviews.createdAt));

        const results: StudioReview[] = rows.map((row: any) => {
          const name = row.userName ?? "Unknown";
          return {
            id: row.id,
            studioId: row.studioId,
            userId: row.userId,
            userName: name,
            userInitials: mkInitials(name),
            userColor: USER_COLORS[(row.userId - 1) % USER_COLORS.length],
            rating: row.rating,
            text: row.text,
            date: computeTimeAgo(new Date(row.createdAt)),
            helpful: row.helpful ?? 0,
          };
        });

        res.json(results);
        return;
      }
    }

    // Fallback to mock data
    const results = mockReviews.filter((r) => r.studioId === studioId);
    res.json(results);
  } catch (_error) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

/**
 * POST /api/reviews
 * Body: { studioId, rating, text }
 * Requires authentication.
 */
router.post("/reviews", authMiddleware, async (req, res) => {
  const { studioId, rating, text } = req.body as {
    studioId?: number;
    rating?: number;
    text?: string;
  };

  if (!studioId || !rating || !text) {
    res.status(400).json({ error: "studioId, rating, and text are required" });
    return;
  }

  if (rating < 1 || rating > 5) {
    res.status(400).json({ error: "Rating must be between 1 and 5" });
    return;
  }

  if (text.length < 10) {
    res.status(400).json({ error: "Review text must be at least 10 characters" });
    return;
  }

  const userId = req.user!.userId;

  try {
    const database = await getDatabase();

    if (database) {
      const { db, schema } = database;

      if (schema.reviews) {
        const [newReview] = await db
          .insert(schema.reviews)
          .values({
            studioId,
            userId,
            rating,
            text,
            helpful: 0,
          })
          .returning();

        // Fetch user info
        const [user] = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.id, userId))
          .limit(1);

        const name = user?.displayName ?? "Unknown";
        const result: StudioReview = {
          id: newReview.id,
          studioId: newReview.studioId,
          userId,
          userName: name,
          userInitials: mkInitials(name),
          userColor: USER_COLORS[(userId - 1) % USER_COLORS.length],
          rating: newReview.rating,
          text: newReview.text,
          date: "just now",
          helpful: 0,
        };

        res.status(201).json(result);
        return;
      }
    }

    // Fallback to mock data
    const mockUser = USERS.find((u) => u.id === userId) ?? USERS[0];
    const review: StudioReview = {
      id: nextReviewId++,
      studioId,
      userId,
      userName: mockUser.name,
      userInitials: mockUser.initials,
      userColor: mockUser.color,
      rating,
      text,
      date: "just now",
      helpful: 0,
    };

    mockReviews.unshift(review);
    res.status(201).json(review);
  } catch (_error) {
    res.status(500).json({ error: "Failed to create review" });
  }
});

export default router;
