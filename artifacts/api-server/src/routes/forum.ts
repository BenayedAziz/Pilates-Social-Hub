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
  { id: 9, name: "Léa N", initials: "LN", color: "bg-pink-200" },
  { id: 10, name: "Hugo P", initials: "HP", color: "bg-cyan-200" },
];

// ---------------------------------------------------------------------------
// Mock data (mutable)
// ---------------------------------------------------------------------------
const forumPosts: ForumPost[] = [
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
const votes = new Map<string, "up" | "down">();

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
const router: IRouter = Router();

/**
 * GET /api/forum
 * Query params: ?category=Discussion
 */
router.get("/forum", (req, res) => {
  let results = [...forumPosts];

  const category = req.query["category"] as string | undefined;
  if (category) {
    results = results.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase(),
    );
  }

  res.json(results);
});

/**
 * POST /api/forum
 * Body: { title, category, body }
 */
router.post("/forum", (req, res) => {
  const { title, category, body } = req.body as {
    title?: string;
    category?: string;
    body?: string;
  };

  if (!title || !category || !body) {
    res.status(400).json({ error: "title, category, and body are required" });
    return;
  }

  const post: ForumPost = {
    id: nextForumId++,
    title,
    body,
    category,
    author: USERS[0], // mock current user
    flair: "Question",
    upvotes: 0,
    comments: 0,
    timeAgo: "just now",
  };

  forumPosts.unshift(post);
  res.status(201).json(post);
});

/**
 * POST /api/forum/:id/vote
 * Body: { direction: "up" | "down" }
 */
router.post("/forum/:id/vote", (req, res) => {
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

  const post = forumPosts.find((p) => p.id === id);
  if (!post) {
    res.status(404).json({ error: "Forum post not found" });
    return;
  }

  const MOCK_USER_ID = 1;
  const voteKey = `${MOCK_USER_ID}-${id}`;
  const existing = votes.get(voteKey);

  if (existing === direction) {
    // Un-vote (toggle off)
    post.upvotes += direction === "up" ? -1 : 1;
    votes.delete(voteKey);
  } else {
    // Reverse previous vote if any, then apply new
    if (existing === "up") {
      post.upvotes -= 1;
    } else if (existing === "down") {
      post.upvotes += 1;
    }
    post.upvotes += direction === "up" ? 1 : -1;
    votes.set(voteKey, direction);
  }

  res.json({ id: post.id, upvotes: post.upvotes });
});

export default router;
