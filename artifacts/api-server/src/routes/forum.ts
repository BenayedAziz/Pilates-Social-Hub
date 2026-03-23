import { Router, type IRouter } from "express";
import { getDatabase } from "../lib/database";
import { eq, ilike, desc, sql, and } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface AppUser {
  id: number;
  name: string;
  initials: string;
  color: string;
}

interface ForumPost {
  id: number;
  title: string;
  body: string;
  category: string;
  author: AppUser;
  flair: string;
  upvotes: number;
  comments: number;
  timeAgo: string;
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
const mockForumPosts: ForumPost[] = [
  {
    id: 1,
    title: "Best reformer studio for beginners in Paris?",
    body: "I just moved to Paris and I'm looking for a studio that's beginner-friendly. Budget is around 40-50 EUR per class. Any recommendations in the central arrondissements?",
    category: "Recommendations",
    author: USERS[0],
    flair: "Question",
    upvotes: 34,
    comments: 12,
    timeAgo: "3h ago",
  },
  {
    id: 2,
    title: "My 6-month Pilates transformation - before & after",
    body: "When I started last September I could barely do a roll-up. Now I'm doing advanced reformer 3x a week. Here's what changed for me...",
    category: "Progress",
    author: USERS[1],
    flair: "Inspiration",
    upvotes: 156,
    comments: 45,
    timeAgo: "5h ago",
  },
  {
    id: 3,
    title: "Reformer vs Mat: Which gives better results?",
    body: "I've been doing mat Pilates for two years and I'm curious about trying the reformer. For those who've done both, which gave you better results and why?",
    category: "Discussion",
    author: USERS[2],
    flair: "Debate",
    upvotes: 89,
    comments: 67,
    timeAgo: "8h ago",
  },
  {
    id: 4,
    title: "Studio Harmonie just added new Balanced Body reformers!",
    body: "Heads up for Studio Harmonie regulars - they just replaced all their reformers with the new Balanced Body Allegro 2 series. They feel amazing!",
    category: "News",
    author: USERS[3],
    flair: "Update",
    upvotes: 45,
    comments: 8,
    timeAgo: "12h ago",
  },
  {
    id: 5,
    title: "Tips for managing lower back pain during roll-ups",
    body: "I keep getting lower back pain during roll-ups. My instructor says my core isn't engaged enough but I'm struggling to feel the right muscles. Any tips or cues that helped you?",
    category: "Technique",
    author: USERS[4],
    flair: "Help",
    upvotes: 72,
    comments: 23,
    timeAgo: "1d ago",
  },
  {
    id: 6,
    title: "Weekly challenge: 5 classes in 7 days - who's in?",
    body: "Starting Monday I'm going to try 5 classes in 7 days. Mix of reformer and mat. Who wants to join me for accountability?",
    category: "Challenges",
    author: USERS[5],
    flair: "Challenge",
    upvotes: 28,
    comments: 34,
    timeAgo: "1d ago",
  },
  {
    id: 7,
    title: "The science behind Pilates and core stability",
    body: "I found a really interesting research paper from the Journal of Bodywork and Movement Therapies about how Pilates improves core stability. Sharing the key takeaways...",
    category: "Education",
    author: USERS[6],
    flair: "Article",
    upvotes: 112,
    comments: 19,
    timeAgo: "2d ago",
  },
  {
    id: 8,
    title: "Found an amazing grip sock brand - half the price!",
    body: "I've been buying ToeSox for years but just discovered a French brand called GripParis that's half the price with similar quality. Link in comments.",
    category: "Gear",
    author: USERS[7],
    flair: "Review",
    upvotes: 67,
    comments: 31,
    timeAgo: "2d ago",
  },
  {
    id: 9,
    title: "Pilates Zen instructor spotlight: Audrey Girard",
    body: "I've been taking classes with Audrey at Pilates Zen for six months and she's genuinely one of the best instructors in Paris. Her breath-work integration is unlike anything else.",
    category: "Community",
    author: USERS[8],
    flair: "Feature",
    upvotes: 91,
    comments: 15,
    timeAgo: "3d ago",
  },
  {
    id: 10,
    title: "How often should you do Pilates per week?",
    body: "I've read conflicting advice - some say 2-3x per week is optimal, others say daily is fine. What's your experience and what do your instructors recommend?",
    category: "Discussion",
    author: USERS[9],
    flair: "Question",
    upvotes: 54,
    comments: 42,
    timeAgo: "3d ago",
  },
];

let nextForumId = 11;

// Track votes per user/post (mock: keyed by `${userId}-${postId}`)
const mockVotes = new Map<string, "up" | "down">();

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
  return `${days}d ago`;
}

function mkInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/** Row shape returned by the DB forum query. */
interface ForumDbRow {
  id: number;
  title: string;
  body: string;
  category: string;
  flair: string | null;
  createdAt: Date;
  authorId: number | null;
  authorName: string | null;
}

const MOCK_USER_ID = 1;

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
const router: IRouter = Router();

/**
 * GET /api/forum
 * Query params: ?category=Discussion
 */
router.get("/forum", async (req, res) => {
  try {
    const database = await getDatabase();

    if (database) {
      const { db, schema } = database;
      const category = req.query["category"] as string | undefined;

      let query = db
        .select({
          id: schema.forumPosts.id,
          title: schema.forumPosts.title,
          body: schema.forumPosts.body,
          category: schema.forumPosts.category,
          flair: schema.forumPosts.flair,
          createdAt: schema.forumPosts.createdAt,
          authorId: schema.users.id,
          authorName: schema.users.displayName,
        })
        .from(schema.forumPosts)
        .leftJoin(schema.users, eq(schema.forumPosts.userId, schema.users.id))
        .orderBy(desc(schema.forumPosts.createdAt));

      if (category) {
        query = query.where(ilike(schema.forumPosts.category, category)) as typeof query;
      }

      const rows: ForumDbRow[] = await query;

      // Compute vote/comment counts per post
      const results: ForumPost[] = await Promise.all(
        rows.map(async (row: ForumDbRow) => {
          // Net upvotes: count(up) - count(down)
          const [voteRow] = await db
            .select({
              net: sql<number>`COALESCE(SUM(CASE WHEN direction = 'up' THEN 1 WHEN direction = 'down' THEN -1 ELSE 0 END), 0)::int`,
            })
            .from(schema.forumVotes)
            .where(eq(schema.forumVotes.forumPostId, row.id));

          const [commentRow] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(schema.forumComments)
            .where(eq(schema.forumComments.forumPostId, row.id));

          const name = row.authorName ?? "Unknown";
          return {
            id: row.id,
            title: row.title,
            body: row.body,
            category: row.category,
            author: {
              id: row.authorId ?? 0,
              name,
              initials: mkInitials(name),
              color: "bg-rose-200",
            },
            flair: row.flair ?? "Question",
            upvotes: voteRow?.net ?? 0,
            comments: commentRow?.count ?? 0,
            timeAgo: computeTimeAgo(new Date(row.createdAt)),
          };
        }),
      );

      res.json(results);
      return;
    }

    // Fallback to mock data
    let results = [...mockForumPosts];

    const category = req.query["category"] as string | undefined;
    if (category) {
      results = results.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase(),
      );
    }

    res.json(results);
  } catch (_error) {
    res.status(500).json({ error: "Failed to fetch forum posts" });
  }
});

/**
 * POST /api/forum
 * Body: { title, category, body }
 */
router.post("/forum", async (req, res) => {
  const { title, category, body } = req.body as {
    title?: string;
    category?: string;
    body?: string;
  };

  if (!title || !category || !body) {
    res.status(400).json({ error: "title, category, and body are required" });
    return;
  }

  try {
    const database = await getDatabase();

    if (database) {
      const { db, schema } = database;

      const [newPost] = await db
        .insert(schema.forumPosts)
        .values({
          userId: MOCK_USER_ID,
          title,
          body,
          category,
          flair: "Question",
        })
        .returning();

      // Fetch user info
      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, MOCK_USER_ID))
        .limit(1);

      const name = user?.displayName ?? "Unknown";
      const result: ForumPost = {
        id: newPost.id,
        title: newPost.title,
        body: newPost.body,
        category: newPost.category,
        author: {
          id: MOCK_USER_ID,
          name,
          initials: mkInitials(name),
          color: "bg-rose-200",
        },
        flair: newPost.flair ?? "Question",
        upvotes: 0,
        comments: 0,
        timeAgo: "just now",
      };

      res.status(201).json(result);
      return;
    }

    // Fallback to mock data
    const post: ForumPost = {
      id: nextForumId++,
      title,
      body,
      category,
      author: USERS[0],
      flair: "Question",
      upvotes: 0,
      comments: 0,
      timeAgo: "just now",
    };

    mockForumPosts.unshift(post);
    res.status(201).json(post);
  } catch (_error) {
    res.status(500).json({ error: "Failed to create forum post" });
  }
});

/**
 * POST /api/forum/:id/vote
 * Body: { direction: "up" | "down" }
 */
router.post("/forum/:id/vote", async (req, res) => {
  const id = Number(req.params["id"]);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid forum post id" });
    return;
  }

  const { direction } = req.body as { direction?: string };
  if (direction !== "up" && direction !== "down") {
    res.status(400).json({ error: 'direction must be "up" or "down"' });
    return;
  }

  try {
    const database = await getDatabase();

    if (database) {
      const { db, schema } = database;

      // Check post exists
      const [post] = await db
        .select()
        .from(schema.forumPosts)
        .where(eq(schema.forumPosts.id, id))
        .limit(1);

      if (!post) {
        res.status(404).json({ error: "Forum post not found" });
        return;
      }

      // Check existing vote
      const [existingVote] = await db
        .select()
        .from(schema.forumVotes)
        .where(
          and(
            eq(schema.forumVotes.forumPostId, id),
            eq(schema.forumVotes.userId, MOCK_USER_ID),
          ),
        )
        .limit(1);

      if (existingVote) {
        if (existingVote.direction === direction) {
          // Toggle off — remove vote
          await db
            .delete(schema.forumVotes)
            .where(eq(schema.forumVotes.id, existingVote.id));
        } else {
          // Switch vote direction
          await db
            .update(schema.forumVotes)
            .set({ direction })
            .where(eq(schema.forumVotes.id, existingVote.id));
        }
      } else {
        // New vote
        await db
          .insert(schema.forumVotes)
          .values({ forumPostId: id, userId: MOCK_USER_ID, direction });
      }

      // Compute net upvotes
      const [voteRow] = await db
        .select({
          net: sql<number>`COALESCE(SUM(CASE WHEN direction = 'up' THEN 1 WHEN direction = 'down' THEN -1 ELSE 0 END), 0)::int`,
        })
        .from(schema.forumVotes)
        .where(eq(schema.forumVotes.forumPostId, id));

      res.json({ id, upvotes: voteRow?.net ?? 0 });
      return;
    }

    // Fallback to mock data
    const post = mockForumPosts.find((p) => p.id === id);
    if (!post) {
      res.status(404).json({ error: "Forum post not found" });
      return;
    }

    const voteKey = `${MOCK_USER_ID}-${id}`;
    const existing = mockVotes.get(voteKey);

    if (existing === direction) {
      post.upvotes += direction === "up" ? -1 : 1;
      mockVotes.delete(voteKey);
    } else {
      if (existing === "up") {
        post.upvotes -= 1;
      } else if (existing === "down") {
        post.upvotes += 1;
      }
      post.upvotes += direction === "up" ? 1 : -1;
      mockVotes.set(voteKey, direction);
    }

    res.json({ id: post.id, upvotes: post.upvotes });
  } catch (_error) {
    res.status(500).json({ error: "Failed to vote" });
  }
});

export default router;
