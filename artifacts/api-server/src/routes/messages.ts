import { Router, type IRouter } from "express";
import { getDatabase } from "../lib/database";
import { eq, and, desc, sql, ne, isNull } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import { logger } from "../lib/logger";

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
const router: IRouter = Router();

/**
 * GET /api/messages/conversations
 * List all conversations for the authenticated user, sorted by most recent.
 */
router.get("/messages/conversations", authMiddleware, async (req, res) => {
  const userId = req.user!.userId;

  try {
    const database = await getDatabase();
    if (!database) {
      res.json([]);
      return;
    }

    const { db, schema } = database;

    // Find all conversation IDs the user participates in
    const participantRows = await db
      .select({ conversationId: schema.conversationParticipants.conversationId })
      .from(schema.conversationParticipants)
      .where(eq(schema.conversationParticipants.userId, userId));

    // Deduplicate conversation IDs (seed may have inserted duplicate participant rows)
    const convoIds = [...new Set(participantRows.map((r: any) => r.conversationId))];

    if (convoIds.length === 0) {
      res.json([]);
      return;
    }

    // Build conversations with last message + unread count + other participant info
    const conversations = [];

    for (const convoId of convoIds) {
      // Get the other participant(s) — for 1:1, there's exactly one other
      const otherParticipants = await db
        .select({
          userId: schema.conversationParticipants.userId,
          displayName: schema.users.displayName,
          avatarUrl: schema.users.avatarUrl,
        })
        .from(schema.conversationParticipants)
        .leftJoin(schema.users, eq(schema.conversationParticipants.userId, schema.users.id))
        .where(
          and(
            eq(schema.conversationParticipants.conversationId, convoId),
            ne(schema.conversationParticipants.userId, userId),
          ),
        );

      if (otherParticipants.length === 0) continue;

      const other = otherParticipants[0];
      const name = other.displayName || "User";
      const initials = name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      // Hash-based color from user ID
      const colors = [
        "bg-rose-200", "bg-green-200", "bg-blue-200", "bg-purple-200",
        "bg-yellow-200", "bg-orange-200", "bg-teal-200", "bg-indigo-200",
      ];
      const color = colors[other.userId % colors.length];

      // Get last message (order by id desc as tiebreaker when timestamps match)
      const [lastMsg] = await db
        .select({
          content: schema.messages.content,
          createdAt: schema.messages.createdAt,
        })
        .from(schema.messages)
        .where(eq(schema.messages.conversationId, convoId))
        .orderBy(desc(schema.messages.createdAt), desc(schema.messages.id))
        .limit(1);

      // Count unread messages (sent by others, not read yet)
      const [unreadResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.messages)
        .where(
          and(
            eq(schema.messages.conversationId, convoId),
            ne(schema.messages.senderId, userId),
            isNull(schema.messages.readAt),
          ),
        );

      conversations.push({
        id: convoId,
        participant: {
          id: other.userId,
          name,
          initials,
          color,
        },
        lastMessage: lastMsg?.content || "",
        lastMessageAt: lastMsg?.createdAt
          ? new Date(lastMsg.createdAt).toISOString()
          : new Date().toISOString(),
        unreadCount: unreadResult?.count || 0,
      });
    }

    // Sort by most recent message
    conversations.sort(
      (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
    );

    res.json(conversations);
  } catch (error) {
    logger.error({ error }, "Failed to fetch conversations");
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

/**
 * GET /api/messages/conversations/:id
 * Get all messages in a conversation. Marks unread messages as read.
 */
router.get("/messages/conversations/:id", authMiddleware, async (req, res) => {
  const userId = req.user!.userId;
  const id = Number(req.params["id"]);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid conversation id" });
    return;
  }

  try {
    const database = await getDatabase();
    if (!database) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }

    const { db, schema } = database;

    // Verify the user is a participant in this conversation
    const [participant] = await db
      .select()
      .from(schema.conversationParticipants)
      .where(
        and(
          eq(schema.conversationParticipants.conversationId, id),
          eq(schema.conversationParticipants.userId, userId),
        ),
      )
      .limit(1);

    if (!participant) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }

    // Fetch messages
    const msgs = await db
      .select({
        id: schema.messages.id,
        conversationId: schema.messages.conversationId,
        senderId: schema.messages.senderId,
        content: schema.messages.content,
        createdAt: schema.messages.createdAt,
        readAt: schema.messages.readAt,
      })
      .from(schema.messages)
      .where(eq(schema.messages.conversationId, id))
      .orderBy(schema.messages.createdAt);

    // Format messages with ISO strings
    const formattedMsgs = msgs.map((m: any) => ({
      id: m.id,
      conversationId: m.conversationId,
      senderId: m.senderId,
      content: m.content,
      createdAt: new Date(m.createdAt).toISOString(),
      readAt: m.readAt ? new Date(m.readAt).toISOString() : null,
    }));

    // Mark unread messages from other users as read
    await db
      .update(schema.messages)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(schema.messages.conversationId, id),
          ne(schema.messages.senderId, userId),
          isNull(schema.messages.readAt),
        ),
      );

    // Build conversation info for the response
    const otherParticipants = await db
      .select({
        userId: schema.conversationParticipants.userId,
        displayName: schema.users.displayName,
      })
      .from(schema.conversationParticipants)
      .leftJoin(schema.users, eq(schema.conversationParticipants.userId, schema.users.id))
      .where(
        and(
          eq(schema.conversationParticipants.conversationId, id),
          ne(schema.conversationParticipants.userId, userId),
        ),
      );

    const other = otherParticipants[0];
    const name = other?.displayName || "User";
    const initials = name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    const colors = [
      "bg-rose-200", "bg-green-200", "bg-blue-200", "bg-purple-200",
      "bg-yellow-200", "bg-orange-200", "bg-teal-200", "bg-indigo-200",
    ];
    const color = colors[(other?.userId || 0) % colors.length];

    const lastMsg = formattedMsgs[formattedMsgs.length - 1];

    res.json({
      conversation: {
        id,
        participant: {
          id: other?.userId,
          name,
          initials,
          color,
        },
        lastMessage: lastMsg?.content || "",
        lastMessageAt: lastMsg?.createdAt || new Date().toISOString(),
        unreadCount: 0, // Just marked as read
      },
      messages: formattedMsgs,
    });
  } catch (error) {
    logger.error({ error }, "Failed to fetch messages");
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

/**
 * POST /api/messages/conversations
 * Create a new conversation with a user, or return existing one.
 * Body: { participantId: number, message: string }
 */
router.post("/messages/conversations", authMiddleware, async (req, res) => {
  const userId = req.user!.userId;
  const { participantId, message } = req.body as {
    participantId?: number;
    message?: string;
  };

  if (!participantId || !message) {
    res.status(400).json({ error: "participantId and message are required" });
    return;
  }

  if (participantId === userId) {
    res.status(400).json({ error: "Cannot message yourself" });
    return;
  }

  try {
    const database = await getDatabase();
    if (!database) {
      res.status(500).json({ error: "Database not available" });
      return;
    }

    const { db, schema } = database;

    // Verify the target user exists
    const [targetUser] = await db
      .select({ id: schema.users.id, displayName: schema.users.displayName })
      .from(schema.users)
      .where(eq(schema.users.id, participantId))
      .limit(1);

    if (!targetUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Check for existing 1:1 conversation between these two users
    const myConvos = await db
      .select({ conversationId: schema.conversationParticipants.conversationId })
      .from(schema.conversationParticipants)
      .where(eq(schema.conversationParticipants.userId, userId));

    const theirConvos = await db
      .select({ conversationId: schema.conversationParticipants.conversationId })
      .from(schema.conversationParticipants)
      .where(eq(schema.conversationParticipants.userId, participantId));

    const myConvoIds = new Set(myConvos.map((r: any) => r.conversationId as number));
    const sharedConvoIds = [...new Set<number>(
      theirConvos
        .map((r: any) => r.conversationId as number)
        .filter((id: number) => myConvoIds.has(id)),
    )];

    // Check if any shared conversation is a 1:1 (exactly 2 distinct participants)
    let existingConvoId: number | null = null;
    for (const cId of sharedConvoIds) {
      const [countResult] = await db
        .select({ count: sql<number>`count(DISTINCT user_id)::int` })
        .from(schema.conversationParticipants)
        .where(eq(schema.conversationParticipants.conversationId, cId));
      if (countResult?.count === 2) {
        existingConvoId = cId;
        break;
      }
    }

    let convoId: number;

    if (existingConvoId) {
      // Use existing conversation — just add the new message
      convoId = existingConvoId;
    } else {
      // Create new conversation
      const [newConvo] = await db
        .insert(schema.conversations)
        .values({})
        .returning({ id: schema.conversations.id });
      convoId = newConvo.id;

      // Add both participants
      await db.insert(schema.conversationParticipants).values([
        { conversationId: convoId, userId },
        { conversationId: convoId, userId: participantId },
      ]);
    }

    // Insert the message
    const now = new Date();
    const [newMsg] = await db
      .insert(schema.messages)
      .values({
        conversationId: convoId,
        senderId: userId,
        content: message,
        createdAt: now,
      })
      .returning();

    // Update conversation timestamp
    await db
      .update(schema.conversations)
      .set({ updatedAt: now })
      .where(eq(schema.conversations.id, convoId));

    // Build participant info for response
    const name = targetUser.displayName || "User";
    const initials = name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    const colors = [
      "bg-rose-200", "bg-green-200", "bg-blue-200", "bg-purple-200",
      "bg-yellow-200", "bg-orange-200", "bg-teal-200", "bg-indigo-200",
    ];
    const color = colors[participantId % colors.length];

    res.status(201).json({
      conversation: {
        id: convoId,
        participant: {
          id: participantId,
          name,
          initials,
          color,
        },
        lastMessage: message,
        lastMessageAt: now.toISOString(),
        unreadCount: 0,
      },
      message: {
        id: newMsg.id,
        conversationId: convoId,
        senderId: userId,
        content: message,
        createdAt: now.toISOString(),
        readAt: null,
      },
    });
  } catch (error) {
    logger.error({ error }, "Failed to create conversation");
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

/**
 * POST /api/messages/conversations/:id
 * Send a message in a conversation.
 * Body: { content: string }
 */
router.post("/messages/conversations/:id", authMiddleware, async (req, res) => {
  const userId = req.user!.userId;
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

  try {
    const database = await getDatabase();
    if (!database) {
      res.status(500).json({ error: "Database not available" });
      return;
    }

    const { db, schema } = database;

    // Verify the user is a participant
    const [participant] = await db
      .select()
      .from(schema.conversationParticipants)
      .where(
        and(
          eq(schema.conversationParticipants.conversationId, id),
          eq(schema.conversationParticipants.userId, userId),
        ),
      )
      .limit(1);

    if (!participant) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }

    const now = new Date();
    const [newMsg] = await db
      .insert(schema.messages)
      .values({
        conversationId: id,
        senderId: userId,
        content,
        createdAt: now,
      })
      .returning();

    // Update conversation timestamp
    await db
      .update(schema.conversations)
      .set({ updatedAt: now })
      .where(eq(schema.conversations.id, id));

    res.status(201).json({
      id: newMsg.id,
      conversationId: id,
      senderId: userId,
      content,
      createdAt: now.toISOString(),
      readAt: null,
    });
  } catch (error) {
    logger.error({ error }, "Failed to send message");
    res.status(500).json({ error: "Failed to send message" });
  }
});

/**
 * GET /api/messages/unread-count
 * Get total unread message count for header badge.
 */
router.get("/messages/unread-count", authMiddleware, async (req, res) => {
  const userId = req.user!.userId;

  try {
    const database = await getDatabase();
    if (!database) {
      res.json({ count: 0 });
      return;
    }

    const { db, schema } = database;

    // Get all conversation IDs the user is in
    const participantRows = await db
      .select({ conversationId: schema.conversationParticipants.conversationId })
      .from(schema.conversationParticipants)
      .where(eq(schema.conversationParticipants.userId, userId));

    // Deduplicate conversation IDs (seed may have inserted duplicate participant rows)
    const convoIds = [...new Set(participantRows.map((r: any) => r.conversationId))];

    if (convoIds.length === 0) {
      res.json({ count: 0 });
      return;
    }

    // Count unread messages across all conversations
    let total = 0;
    for (const convoId of convoIds) {
      const [result] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.messages)
        .where(
          and(
            eq(schema.messages.conversationId, convoId),
            ne(schema.messages.senderId, userId),
            isNull(schema.messages.readAt),
          ),
        );
      total += result?.count || 0;
    }

    res.json({ count: total });
  } catch (error) {
    logger.error({ error }, "Failed to fetch unread count");
    res.status(500).json({ error: "Failed to fetch unread count" });
  }
});

export default router;
