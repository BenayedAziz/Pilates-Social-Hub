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

interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  createdAt: string;
  readAt: string | null;
}

interface Conversation {
  id: number;
  participant: AppUser;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

// ---------------------------------------------------------------------------
// Mock users
// ---------------------------------------------------------------------------
const USERS: Record<number, AppUser> = {
  1: { id: 1, name: "Emma D", initials: "ED", color: "bg-rose-200" },
  2: { id: 2, name: "Sophie B", initials: "SB", color: "bg-green-200" },
  3: { id: 3, name: "Lucas M", initials: "LM", color: "bg-blue-200" },
};

const CURRENT_USER_ID = 1;

// ---------------------------------------------------------------------------
// Mock conversations & messages
// ---------------------------------------------------------------------------
const mockConversations: Conversation[] = [
  {
    id: 1,
    participant: USERS[2]!,
    lastMessage: "Yes! The Saturday morning class at Studio Harmonie is perfect for that.",
    lastMessageAt: "2026-03-23T09:15:00Z",
    unreadCount: 2,
  },
  {
    id: 2,
    participant: USERS[3]!,
    lastMessage: "Just finished day 12 of the challenge. My core is on fire!",
    lastMessageAt: "2026-03-22T18:30:00Z",
    unreadCount: 0,
  },
  {
    id: 3,
    participant: { id: 4, name: "Marie C", initials: "MC", color: "bg-purple-200" },
    lastMessage: "Let me know when you want to check out that new studio in the 11th!",
    lastMessageAt: "2026-03-21T14:45:00Z",
    unreadCount: 1,
  },
];

const mockMessages: Record<number, Message[]> = {
  1: [
    {
      id: 1,
      conversationId: 1,
      senderId: 2,
      content: "Hey Emma! Have you tried any good reformer classes lately?",
      createdAt: "2026-03-23T08:00:00Z",
      readAt: "2026-03-23T08:05:00Z",
    },
    {
      id: 2,
      conversationId: 1,
      senderId: 1,
      content: "I've been going to Studio Harmonie a lot. Their advanced reformer flow is incredible!",
      createdAt: "2026-03-23T08:12:00Z",
      readAt: "2026-03-23T08:15:00Z",
    },
    {
      id: 3,
      conversationId: 1,
      senderId: 2,
      content: "Ooh nice! I'm looking for something to improve my spine articulation. Any suggestions?",
      createdAt: "2026-03-23T08:20:00Z",
      readAt: "2026-03-23T08:22:00Z",
    },
    {
      id: 4,
      conversationId: 1,
      senderId: 1,
      content: "Definitely try the Cadillac class at Pilates Lumiere. Coach Isabelle is amazing for that.",
      createdAt: "2026-03-23T08:45:00Z",
      readAt: "2026-03-23T09:00:00Z",
    },
    {
      id: 5,
      conversationId: 1,
      senderId: 2,
      content: "That sounds perfect! Do they have weekend classes?",
      createdAt: "2026-03-23T09:05:00Z",
      readAt: null,
    },
    {
      id: 6,
      conversationId: 1,
      senderId: 2,
      content: "Yes! The Saturday morning class at Studio Harmonie is perfect for that.",
      createdAt: "2026-03-23T09:15:00Z",
      readAt: null,
    },
  ],
  2: [
    {
      id: 7,
      conversationId: 2,
      senderId: 3,
      content: "Hey! Are you doing the 30-day core challenge too?",
      createdAt: "2026-03-20T10:00:00Z",
      readAt: "2026-03-20T10:05:00Z",
    },
    {
      id: 8,
      conversationId: 2,
      senderId: 1,
      content: "Yes! I started last week. Already feeling the difference in my posture.",
      createdAt: "2026-03-20T10:30:00Z",
      readAt: "2026-03-20T10:35:00Z",
    },
    {
      id: 9,
      conversationId: 2,
      senderId: 3,
      content: "Same here. The teaser progressions are killing me though!",
      createdAt: "2026-03-21T14:00:00Z",
      readAt: "2026-03-21T14:10:00Z",
    },
    {
      id: 10,
      conversationId: 2,
      senderId: 1,
      content: "Haha tell me about it. I can barely hold the V-sit for 10 seconds.",
      createdAt: "2026-03-21T14:20:00Z",
      readAt: "2026-03-21T14:25:00Z",
    },
    {
      id: 11,
      conversationId: 2,
      senderId: 3,
      content: "Just finished day 12 of the challenge. My core is on fire!",
      createdAt: "2026-03-22T18:30:00Z",
      readAt: "2026-03-22T18:35:00Z",
    },
  ],
  3: [
    {
      id: 12,
      conversationId: 3,
      senderId: 4,
      content: "Emma! Did you see the new studio that opened near Bastille?",
      createdAt: "2026-03-20T09:00:00Z",
      readAt: "2026-03-20T09:10:00Z",
    },
    {
      id: 13,
      conversationId: 3,
      senderId: 1,
      content: "No, which one? I'm always looking for new places to try!",
      createdAt: "2026-03-20T09:15:00Z",
      readAt: "2026-03-20T09:20:00Z",
    },
    {
      id: 14,
      conversationId: 3,
      senderId: 4,
      content: "It's called BodyWork Pilates. They have reformer, tower, and even aerial classes.",
      createdAt: "2026-03-20T11:00:00Z",
      readAt: "2026-03-20T11:05:00Z",
    },
    {
      id: 15,
      conversationId: 3,
      senderId: 1,
      content: "Aerial pilates?! That sounds amazing. We should go together!",
      createdAt: "2026-03-20T11:30:00Z",
      readAt: "2026-03-20T11:35:00Z",
    },
    {
      id: 16,
      conversationId: 3,
      senderId: 4,
      content: "Let me know when you want to check out that new studio in the 11th!",
      createdAt: "2026-03-21T14:45:00Z",
      readAt: null,
    },
  ],
};

let nextMessageId = 17;

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
const router: IRouter = Router();

/**
 * GET /api/messages/conversations
 * List all conversations for the current user.
 */
router.get("/messages/conversations", (_req, res) => {
  try {
    // Sort by most recent message
    const sorted = [...mockConversations].sort(
      (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
    );
    res.json(sorted);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

/**
 * GET /api/messages/conversations/:id
 * Get all messages in a conversation.
 */
router.get("/messages/conversations/:id", (req, res) => {
  const id = Number(req.params["id"]);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid conversation id" });
    return;
  }

  const convo = mockConversations.find((c) => c.id === id);
  if (!convo) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  const msgs = mockMessages[id] || [];

  // Mark unread messages as read
  for (const msg of msgs) {
    if (!msg.readAt && msg.senderId !== CURRENT_USER_ID) {
      msg.readAt = new Date().toISOString();
    }
  }
  convo.unreadCount = 0;

  res.json({
    conversation: convo,
    messages: msgs,
  });
});

/**
 * POST /api/messages/conversations
 * Create a new conversation with a user.
 * Body: { participantId: number, message: string }
 */
router.post("/messages/conversations", (req, res) => {
  const { participantId, message } = req.body as {
    participantId?: number;
    message?: string;
  };

  if (!participantId || !message) {
    res.status(400).json({ error: "participantId and message are required" });
    return;
  }

  const participant = USERS[participantId];
  if (!participant) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const now = new Date().toISOString();
  const newConvoId = Math.max(...mockConversations.map((c) => c.id)) + 1;

  const newConvo: Conversation = {
    id: newConvoId,
    participant,
    lastMessage: message,
    lastMessageAt: now,
    unreadCount: 0,
  };

  const newMsg: Message = {
    id: nextMessageId++,
    conversationId: newConvoId,
    senderId: CURRENT_USER_ID,
    content: message,
    createdAt: now,
    readAt: null,
  };

  mockConversations.push(newConvo);
  mockMessages[newConvoId] = [newMsg];

  res.status(201).json({ conversation: newConvo, message: newMsg });
});

/**
 * POST /api/messages/conversations/:id
 * Send a message in a conversation.
 * Body: { content: string }
 */
router.post("/messages/conversations/:id", (req, res) => {
  const id = Number(req.params["id"]);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid conversation id" });
    return;
  }

  const { content } = req.body as { content?: string };
  if (!content) {
    res.status(400).json({ error: "content is required" });
    return;
  }

  const convo = mockConversations.find((c) => c.id === id);
  if (!convo) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  const now = new Date().toISOString();
  const newMsg: Message = {
    id: nextMessageId++,
    conversationId: id,
    senderId: CURRENT_USER_ID,
    content,
    createdAt: now,
    readAt: null,
  };

  if (!mockMessages[id]) {
    mockMessages[id] = [];
  }
  mockMessages[id].push(newMsg);

  // Update conversation last message
  convo.lastMessage = content;
  convo.lastMessageAt = now;

  res.status(201).json(newMsg);
});

/**
 * GET /api/messages/unread-count
 * Get total unread message count for header badge.
 */
router.get("/messages/unread-count", (_req, res) => {
  const total = mockConversations.reduce((sum, c) => sum + c.unreadCount, 0);
  res.json({ count: total });
});

export default router;
