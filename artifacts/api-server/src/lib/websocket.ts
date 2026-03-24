import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import { eq, and, ne, isNull } from "drizzle-orm";
import { verifyToken } from "../middleware/auth";
import { getDatabase } from "./database";
import { logger } from "./logger";

interface ConnectedClient {
  ws: WebSocket;
  userId: number;
}

const clients: Map<number, ConnectedClient[]> = new Map();

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws, req) => {
    // Extract token from query string
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const token = url.searchParams.get("token");

    if (!token) {
      ws.close(4001, "No token");
      return;
    }

    let userId: number;
    try {
      const payload = verifyToken(token);
      userId = payload.userId;
    } catch {
      ws.close(4002, "Invalid token");
      return;
    }

    // Register client
    const existing = clients.get(userId) || [];
    existing.push({ ws, userId });
    clients.set(userId, existing);
    logger.info({ userId }, "WebSocket client connected");

    // Broadcast presence to all connected users
    broadcastPresence();

    ws.on("message", (raw) => {
      try {
        const data = JSON.parse(raw.toString());
        handleMessage(userId, data);
      } catch {
        // ignore malformed messages
      }
    });

    ws.on("close", () => {
      const userClients = clients.get(userId) || [];
      clients.set(
        userId,
        userClients.filter((c) => c.ws !== ws),
      );
      if (clients.get(userId)?.length === 0) clients.delete(userId);
      logger.info({ userId }, "WebSocket client disconnected");
      broadcastPresence();
    });
  });

  return wss;
}

async function handleMessage(senderId: number, data: any) {
  if (data.type === "message" && data.conversationId && data.content) {
    // Relay to the recipient for real-time delivery.
    // Persistence is handled by the POST /api/messages/conversations/:id route,
    // which the frontend always calls alongside the WS send.
    if (data.recipientId) {
      sendToUser(data.recipientId, {
        type: "new_message",
        conversationId: data.conversationId,
        senderId,
        content: data.content,
        createdAt: new Date().toISOString(),
      });
    }
  }

  if (data.type === "typing" && data.conversationId) {
    if (data.recipientId) {
      sendToUser(data.recipientId, {
        type: "typing",
        conversationId: data.conversationId,
        userId: senderId,
      });
    }
  }

  // Handle mark_read events from the frontend
  if (data.type === "mark_read" && data.conversationId) {
    try {
      const database = await getDatabase();
      if (database) {
        const { db, schema } = database;
        await db
          .update(schema.messages)
          .set({ readAt: new Date() })
          .where(
            and(
              eq(schema.messages.conversationId, data.conversationId),
              ne(schema.messages.senderId, senderId),
              isNull(schema.messages.readAt),
            ),
          );

        // Notify the other user that their messages were read
        if (data.recipientId) {
          sendToUser(data.recipientId, {
            type: "messages_read",
            conversationId: data.conversationId,
            readBy: senderId,
            readAt: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      logger.error({ error }, "Failed to mark messages as read");
    }
  }
}

/**
 * Broadcast the list of online user IDs to all connected clients.
 */
function broadcastPresence() {
  const onlineUserIds = Array.from(clients.keys());
  const payload = JSON.stringify({
    type: "presence",
    onlineUserIds,
  });
  for (const [, userClients] of clients) {
    for (const { ws } of userClients) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    }
  }
}

export function sendToUser(userId: number, data: any) {
  const userClients = clients.get(userId) || [];
  const message = JSON.stringify(data);
  userClients.forEach(({ ws }) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  });
}

/**
 * Get the set of currently online user IDs.
 */
export function getOnlineUserIds(): number[] {
  return Array.from(clients.keys());
}
