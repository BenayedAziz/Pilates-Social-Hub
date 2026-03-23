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
  { id: 9, name: "Léa N", initials: "LN", color: "bg-pink-200" },
  { id: 10, name: "Hugo P", initials: "HP", color: "bg-cyan-200" },
];

// ---------------------------------------------------------------------------
// Mock data (mutable)
// ---------------------------------------------------------------------------
const posts: FeedPost[] = [
  { id: 1, user: USERS[0], type: "Reformer Advanced", studio: "Studio Harmonie", duration: 55, calories: 320, likes: 24, comments: 3, timeAgo: "2h ago", hasPhoto: true, likedByMe: false },
  { id: 2, user: USERS[1], type: "Mat Pilates Core", studio: "Core & Flow", duration: 45, calories: 250, likes: 12, comments: 1, timeAgo: "4h ago", hasPhoto: false, likedByMe: false },
  { id: 3, user: USERS[2], type: "Cadillac Intro", studio: "Pilates Lumière", duration: 60, calories: 290, likes: 45, comments: 8, timeAgo: "5h ago", hasPhoto: true, likedByMe: false },
  { id: 4, user: USERS[3], type: "Wunda Chair Blast", studio: "Reform Studio Paris", duration: 45, calories: 310, likes: 18, comments: 2, timeAgo: "8h ago", hasPhoto: false, likedByMe: false },
  { id: 5, user: USERS[4], type: "Reformer Flow", studio: "Équilibre Pilates", duration: 50, calories: 275, likes: 32, comments: 5, timeAgo: "1d ago", hasPhoto: true, likedByMe: false },
  { id: 6, user: USERS[5], type: "Spine Corrector", studio: "Studio Harmonie", duration: 40, calories: 200, likes: 9, comments: 0, timeAgo: "1d ago", hasPhoto: false, likedByMe: false },
  { id: 7, user: USERS[6], type: "Tower & Reformer", studio: "BodyWork Pilates", duration: 75, calories: 410, likes: 67, comments: 14, timeAgo: "2d ago", hasPhoto: true, likedByMe: false },
  { id: 8, user: USERS[7], type: "Mat Beginner", studio: "Core & Flow", duration: 50, calories: 220, likes: 5, comments: 1, timeAgo: "2d ago", hasPhoto: false, likedByMe: false },
  { id: 9, user: USERS[8], type: "Reformer Cardio", studio: "Pilates Zen", duration: 45, calories: 350, likes: 28, comments: 4, timeAgo: "3d ago", hasPhoto: true, likedByMe: false },
  { id: 10, user: USERS[9], type: "Classical Mat", studio: "Équilibre Pilates", duration: 60, calories: 240, likes: 14, comments: 3, timeAgo: "3d ago", hasPhoto: false, likedByMe: false },
];

let nextPostId = 11;

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
const router: IRouter = Router();

/**
 * GET /api/feed
 */
router.get("/feed", (_req, res) => {
  res.json(posts);
});

/**
 * POST /api/feed
 * Body: { type, studio, duration, calories }
 */
router.post("/feed", (req, res) => {
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

  const post: FeedPost = {
    id: nextPostId++,
    user: USERS[0], // mock current user
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

  posts.unshift(post);
  res.status(201).json(post);
});

/**
 * POST /api/feed/:id/like
 * Toggle like for the current user.
 */
router.post("/feed/:id/like", (req, res) => {
  const id = Number(req.params["id"]);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid post id" });
    return;
  }

  const post = posts.find((p) => p.id === id);
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
});

export default router;
