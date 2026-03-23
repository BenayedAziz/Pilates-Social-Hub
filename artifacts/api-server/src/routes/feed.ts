import { Router, type IRouter } from "express";
import { getDatabase } from "../lib/database";
import { eq, desc, sql } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface AppUser {
  id: number;
  name: string;
  initials: string;
  color: string;
}

interface FeedPost {
  id: number;
  user: AppUser;
  type: string;
  studio: string;
  duration: number;
  calories: number;
  likes: number;
  comments: number;
  timeAgo: string;
  hasPhoto: boolean;
  likedByMe: boolean;
}

// ---------------------------------------------------------------------------
// Mock users (shared reference)
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
const mockPosts: FeedPost[] = [
  { id: 1, user: USERS[0], type: "Reformer Advanced", studio: "Studio Harmonie", duration: 55, calories: 320, likes: 24, comments: 3, timeAgo: "2h ago", hasPhoto: true, likedByMe: false },
  { id: 2, user: USERS[1], type: "Mat Pilates Core", studio: "Core & Flow", duration: 45, calories: 250, likes: 12, comments: 1, timeAgo: "4h ago", hasPhoto: false, likedByMe: false },
  { id: 3, user: USERS[2], type: "Cadillac Intro", studio: "Pilates Lumiere", duration: 60, calories: 290, likes: 45, comments: 8, timeAgo: "5h ago", hasPhoto: true, likedByMe: false },
  { id: 4, user: USERS[3], type: "Wunda Chair Blast", studio: "Reform Studio Paris", duration: 45, calories: 310, likes: 18, comments: 2, timeAgo: "8h ago", hasPhoto: false, likedByMe: false },
  { id: 5, user: USERS[4], type: "Reformer Flow", studio: "Equilibre Pilates", duration: 50, calories: 275, likes: 32, comments: 5, timeAgo: "1d ago", hasPhoto: true, likedByMe: false },
  { id: 6, user: USERS[5], type: "Spine Corrector", studio: "Studio Harmonie", duration: 40, calories: 200, likes: 9, comments: 0, timeAgo: "1d ago", hasPhoto: false, likedByMe: false },
  { id: 7, user: USERS[6], type: "Tower & Reformer", studio: "BodyWork Pilates", duration: 75, calories: 410, likes: 67, comments: 14, timeAgo: "2d ago", hasPhoto: true, likedByMe: false },
  { id: 8, user: USERS[7], type: "Mat Beginner", studio: "Core & Flow", duration: 50, calories: 220, likes: 5, comments: 1, timeAgo: "2d ago", hasPhoto: false, likedByMe: false },
  { id: 9, user: USERS[8], type: "Reformer Cardio", studio: "Pilates Zen", duration: 45, calories: 350, likes: 28, comments: 4, timeAgo: "3d ago", hasPhoto: true, likedByMe: false },
  { id: 10, user: USERS[9], type: "Classical Mat", studio: "Equilibre Pilates", duration: 60, calories: 240, likes: 14, comments: 3, timeAgo: "3d ago", hasPhoto: false, likedByMe: false },
];

let nextPostId = 11;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Compute a human-readable "time ago" string from a Date. */
function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/** Build initials from a display name. */
function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/** Row shape returned by the DB feed query. */
interface FeedDbRow {
  id: number;
  type: string;
  studio: string | null;
  duration: number | null;
  calories: number | null;
  imageUrl: string | null;
  createdAt: Date;
  userId: number | null;
  userName: string | null;
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
const router: IRouter = Router();

const MOCK_CURRENT_USER_ID = 1;

/**
 * GET /api/feed
 */
router.get("/feed", async (_req, res) => {
  try {
    const database = await getDatabase();

    if (database) {
      const { db, schema } = database;

      // Fetch posts with user info
      const rows: FeedDbRow[] = await db
        .select({
          id: schema.posts.id,
          type: schema.posts.type,
          studio: schema.posts.studio,
          duration: schema.posts.duration,
          calories: schema.posts.calories,
          imageUrl: schema.posts.imageUrl,
          createdAt: schema.posts.createdAt,
          userId: schema.users.id,
          userName: schema.users.displayName,
        })
        .from(schema.posts)
        .leftJoin(schema.users, eq(schema.posts.userId, schema.users.id))
        .orderBy(desc(schema.posts.createdAt));

      // For each post, get like/comment counts
      const results: FeedPost[] = await Promise.all(
        rows.map(async (row: FeedDbRow) => {
          const [likeRow] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(schema.postLikes)
            .where(eq(schema.postLikes.postId, row.id));

          const [commentRow] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(schema.postComments)
            .where(eq(schema.postComments.postId, row.id));

          // Check if current user liked this post
          const [myLike] = await db
            .select()
            .from(schema.postLikes)
            .where(
              sql`${schema.postLikes.postId} = ${row.id} AND ${schema.postLikes.userId} = ${MOCK_CURRENT_USER_ID}`,
            )
            .limit(1);

          const name = row.userName ?? "Unknown";
          return {
            id: row.id,
            user: {
              id: row.userId ?? 0,
              name,
              initials: initials(name),
              color: "bg-rose-200",
            },
            type: row.type,
            studio: row.studio ?? "",
            duration: row.duration ?? 0,
            calories: row.calories ?? 0,
            likes: likeRow?.count ?? 0,
            comments: commentRow?.count ?? 0,
            timeAgo: timeAgo(new Date(row.createdAt)),
            hasPhoto: !!row.imageUrl,
            likedByMe: !!myLike,
          };
        }),
      );

      res.json(results);
      return;
    }

    // Fallback to mock data
    res.json(mockPosts);
  } catch (_error) {
    res.status(500).json({ error: "Failed to fetch feed" });
  }
});

/**
 * POST /api/feed
 * Body: { type, studio, duration, calories }
 */
router.post("/feed", async (req, res) => {
  const { type, studio, duration, calories } = req.body as {
    type?: string;
    studio?: string;
    duration?: number;
    calories?: number;
  };

  if (!type) {
    res.status(400).json({ error: "type is required" });
    return;
  }

  try {
    const database = await getDatabase();

    if (database) {
      const { db, schema } = database;
      const [newPost] = await db
        .insert(schema.posts)
        .values({
          userId: MOCK_CURRENT_USER_ID,
          type,
          studio: studio ?? "",
          duration: duration ?? 0,
          calories: calories ?? 0,
        })
        .returning();

      // Fetch user info
      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, MOCK_CURRENT_USER_ID))
        .limit(1);

      const name = user?.displayName ?? "Unknown";
      const result: FeedPost = {
        id: newPost.id,
        user: {
          id: MOCK_CURRENT_USER_ID,
          name,
          initials: initials(name),
          color: "bg-rose-200",
        },
        type: newPost.type,
        studio: newPost.studio ?? "",
        duration: newPost.duration ?? 0,
        calories: newPost.calories ?? 0,
        likes: 0,
        comments: 0,
        timeAgo: "just now",
        hasPhoto: false,
        likedByMe: false,
      };

      res.status(201).json(result);
      return;
    }

    // Fallback to mock data
    const post: FeedPost = {
      id: nextPostId++,
      user: USERS[0],
      type,
      studio: studio ?? "",
      duration: duration ?? 0,
      calories: calories ?? 0,
      likes: 0,
      comments: 0,
      timeAgo: "just now",
      hasPhoto: false,
      likedByMe: false,
    };

    mockPosts.unshift(post);
    res.status(201).json(post);
  } catch (_error) {
    res.status(500).json({ error: "Failed to create post" });
  }
});

/**
 * POST /api/feed/:id/like
 * Toggle like for the current user.
 */
router.post("/feed/:id/like", async (req, res) => {
  const id = Number(req.params["id"]);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid post id" });
    return;
  }

  try {
    const database = await getDatabase();

    if (database) {
      const { db, schema } = database;

      // Check if post exists
      const [post] = await db
        .select()
        .from(schema.posts)
        .where(eq(schema.posts.id, id))
        .limit(1);

      if (!post) {
        res.status(404).json({ error: "Post not found" });
        return;
      }

      // Check existing like
      const [existingLike] = await db
        .select()
        .from(schema.postLikes)
        .where(
          sql`${schema.postLikes.postId} = ${id} AND ${schema.postLikes.userId} = ${MOCK_CURRENT_USER_ID}`,
        )
        .limit(1);

      if (existingLike) {
        // Unlike
        await db
          .delete(schema.postLikes)
          .where(eq(schema.postLikes.id, existingLike.id));
      } else {
        // Like
        await db
          .insert(schema.postLikes)
          .values({ postId: id, userId: MOCK_CURRENT_USER_ID });
      }

      // Get new count
      const [likeRow] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.postLikes)
        .where(eq(schema.postLikes.postId, id));

      res.json({
        id,
        likes: likeRow?.count ?? 0,
        likedByMe: !existingLike,
      });
      return;
    }

    // Fallback to mock data
    const post = mockPosts.find((p) => p.id === id);
    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    if (post.likedByMe) {
      post.likes -= 1;
      post.likedByMe = false;
    } else {
      post.likes += 1;
      post.likedByMe = true;
    }

    res.json({ id: post.id, likes: post.likes, likedByMe: post.likedByMe });
  } catch (_error) {
    res.status(500).json({ error: "Failed to toggle like" });
  }
});

export default router;
