# PilatesHub Messaging / DM System Audit

**Date:** 2026-03-24
**Auditor:** Claude (automated)

---

## 1. Current State: What's Implemented

### Frontend (`MessagesPage.tsx`)
- Conversation list view with avatars, last message preview, timestamps, unread badges
- Chat view with message bubbles (sent vs received), timestamps, "Read" receipts
- Optimistic message sending (message appears instantly before API confirms)
- Typing indicator UI (shows "[Name] is typing...")
- WebSocket connection status indicator ("Live" / "Offline")
- Back navigation between chat and conversation list
- Enter-to-send, shift+enter not handled (single-line `<Input>`)
- Empty state when no conversations exist
- Hardcoded `CURRENT_USER_ID = 1` — no integration with auth context
- Inline fallback mock data — identical to the API mock data

### API (`routes/messages.ts`)
Four endpoints, all serving **in-memory mock data** (not the database):

| Endpoint | Method | Status |
|---|---|---|
| `/api/messages/conversations` | GET | Works — returns sorted mock conversations |
| `/api/messages/conversations/:id` | GET | Works — returns mock messages, marks unread as read |
| `/api/messages/conversations/:id` | POST | Works — appends to in-memory array, returns new message |
| `/api/messages/conversations` | POST | Works — creates new conversation in memory (limited to known mock users) |
| `/api/messages/unread-count` | GET | Works — sums unread counts from mock data |

All data lives in `let mockConversations` / `let mockMessages` variables. A server restart resets everything.

### WebSocket (`lib/websocket.ts`)
- Server-side `ws` WebSocket server on `/ws` path
- JWT token auth via query param on connection
- Maintains a `Map<userId, ConnectedClient[]>` for multi-device support
- Handles two message types: `message` (broadcast to recipient) and `typing` (relay to recipient)
- No persistence — WebSocket messages are fire-and-forget

### Frontend WebSocket Hook (`use-websocket.ts`)
- Connects to `ws://` or `wss://` based on page protocol
- Sends auth token via `{ type: "auth", token }` message **after** connection opens
- Auto-reconnect every 5 seconds on disconnect
- Event subscription via `on(type, handler)` pattern
- Gracefully degrades: skips connection if no token in localStorage

### Database Schema (`schema/index.ts`)
Three tables defined and migrated:

| Table | Columns | Rows in prod |
|---|---|---|
| `conversations` | id, created_at, updated_at | 6 |
| `conversation_participants` | id, conversation_id, user_id, joined_at | 14 |
| `messages` | id, conversation_id, sender_id, content, created_at, read_at | 30 |

The seed script populates 3 conversations with realistic Pilates-themed messages. Conversations 4-6 appear to have been created via the mock API at some point.

---

## 2. Data Flow

```
Current (broken) flow:
  Frontend ──fetch──> API ──returns──> in-memory mock arrays (NOT the database)
  Frontend ──WS──> WebSocket server ──relay──> other connected clients
  Database has seed data but is never read or written by the API

What the flow SHOULD be:
  Frontend ──fetch──> API ──drizzle──> PostgreSQL (conversations, messages, conversation_participants)
  Frontend ──WS──> WebSocket server ──relay──> other clients
  WebSocket server ──drizzle──> PostgreSQL (persist messages)
```

### Auth flow mismatch
- **WebSocket server** expects the JWT token as a URL query parameter: `new WebSocket(url?token=xxx)`.
- **Frontend hook** does NOT send the token in the URL. Instead it sends `{ type: "auth", token }` as a message after connecting.
- **The server never handles `type: "auth"`** — it only handles `type: "message"` and `type: "typing"`. The auth message is silently ignored.
- Result: The WebSocket connection is accepted but the user is never authenticated at the server level. The `ws.close(4001, "No token")` path never triggers because the token _is_ in the URL... except the frontend doesn't put it there. **WebSocket auth is broken.**

---

## 3. What Works

1. **UI rendering** — Conversation list and chat views render correctly with mock data
2. **API endpoints** — All 5 endpoints return valid responses with correct HTTP status codes
3. **Input validation** — Empty content returns 400, invalid IDs return 400, missing conversations return 404
4. **Optimistic updates** — Messages appear instantly in the UI before the POST completes
5. **Unread badge** — Header fetches `/api/messages/unread-count` on mount and shows badge
6. **Time formatting** — Smart relative timestamps (today = time, yesterday, day name, date)
7. **Message grouping** — Consecutive messages from the same sender are visually grouped; timestamps shown only when >5 min gap
8. **Read receipt display** — "Read" label shown on sent messages where `readAt` is not null
9. **Local notifications** — `notify.newMessage()` fires browser notification for messages when tab is not focused
10. **WebSocket server infrastructure** — The `ws` server boots, accepts connections, and has multi-device client tracking

---

## 4. What's Broken or Fake

### Critical

| Issue | Detail |
|---|---|
| **API is 100% mock data** | The API uses in-memory arrays, never touches the database. The DB has real tables with seed data that is completely ignored. |
| **No auth on message routes** | None of the message endpoints use `authMiddleware` or `optionalAuth`. Any unauthenticated request can read all conversations and send messages as user ID 1. |
| **Hardcoded user ID** | Both the API (`CURRENT_USER_ID = 1`) and the frontend (`CURRENT_USER_ID = 1`) hardcode the user. There is no multi-user support. |
| **WebSocket auth mismatch** | Frontend sends token in a post-connect message; server expects it in the URL query string. Neither side handles the other's protocol. Connection succeeds but user identity is never established server-side. |
| **Data lost on restart** | New messages are stored only in JS variables. Server restart = all messages gone. |

### Moderate

| Issue | Detail |
|---|---|
| **Everyone appears "Active now"** | The chat header always shows "Active now" and the green dot. There is no presence tracking. |
| **Everyone shows online** | Conversation list shows a green dot on every avatar. No real online/offline state. |
| **Mock user pool is tiny** | Only users 1-4 exist in the mock. Creating a conversation with any other user returns 404. |
| **Unread count never updates in real-time** | The Header fetches unread count once on mount. It never re-fetches or listens for WebSocket events. |
| **No duplicate conversation prevention** | `POST /conversations` can create multiple conversations with the same participant pair. |
| **Mark-as-read is mock-only** | `GET /conversations/:id` mutates in-memory `readAt`, but there's no dedicated mark-read endpoint and the frontend doesn't call one. |

### Minor

| Issue | Detail |
|---|---|
| **Fallback data duplicated** | The exact same mock conversations/messages are defined in both `MessagesPage.tsx` and `routes/messages.ts`. |
| **Message ID collision risk** | Frontend uses `Date.now()` for optimistic message IDs. API uses an incrementing counter. No reconciliation after POST succeeds. |
| **No error feedback on send failure** | If `POST /conversations/:id` fails, the optimistic message stays in the UI with no error indication. |
| **Typing indicator has no debounce** | Every keystroke sends a `typing` WebSocket message. Should debounce to ~1 per second. |
| **DB schema supports group chats, API doesn't** | The `conversation_participants` table allows N participants per conversation. The API assumes 1:1 only. Seed data includes a 3-person group chat. |

---

## 5. What's Missing (vs. a Real Chat System)

### Must-Have for MVP

- [ ] **Database integration** — Read/write conversations and messages from PostgreSQL via Drizzle
- [ ] **Auth-gated endpoints** — Use `authMiddleware` on all message routes, derive `userId` from JWT
- [ ] **Real user resolution** — Look up participant info from the `users` table, not a hardcoded map
- [ ] **Message persistence via WebSocket** — When a WS message arrives, save it to the DB before relaying
- [ ] **Fix WebSocket auth** — Pick one protocol (token in URL or post-connect auth message) and implement it consistently on both sides
- [ ] **New conversation from profile** — No way to start a DM from another user's profile. Need a "Message" button on user profiles.
- [ ] **Search/find users to message** — No user search or contact discovery for starting new conversations

### Important for Usability

- [ ] **Message pagination** — Currently loads all messages at once. Will break with conversation history >100 messages.
- [ ] **Real-time unread badge** — Header should listen for WebSocket `new_message` events to update the badge count without page refresh
- [ ] **Read receipts (real)** — Send `mark_read` event via WebSocket when user opens a conversation; persist `readAt` in DB
- [ ] **Online/offline presence** — Track WebSocket connection state per user; show actual status on avatars
- [ ] **Typing indicator debounce** — Throttle to max 1 event per second on the frontend
- [ ] **Error handling on send** — Show retry UI or error toast if POST fails; remove optimistic message on permanent failure
- [ ] **Message ID reconciliation** — After POST succeeds, update the optimistic message's ID with the server-assigned one
- [ ] **Delete conversation** — No way to delete or archive a conversation
- [ ] **Delete/edit messages** — No way to unsend or edit a sent message

### Nice-to-Have / Future

- [ ] **Media/image messages** — Upload and send images (upload endpoint already exists at `/uploads/image`)
- [ ] **Link previews** — Auto-detect URLs and show Open Graph previews
- [ ] **Group chats** — DB schema already supports N participants. Need UI and API support.
- [ ] **Message reactions** — Emoji reactions on individual messages
- [ ] **Push notifications** — Service worker + push subscription for notifications when app is closed
- [ ] **Message search** — Full-text search across conversation history
- [ ] **Conversation mute/block** — Mute notifications or block a user
- [ ] **Delivery status** — Sent / Delivered / Read states (currently only Sent and Read)
- [ ] **Last seen timestamps** — "Last seen 5 minutes ago" instead of hardcoded "Active now"
- [ ] **Multiline input** — Replace `<Input>` with `<textarea>` for multi-line messages

---

## 6. Recommendations

### Phase 1: Make It Real (High Priority)

1. **Wire API to database.** Replace all mock arrays in `routes/messages.ts` with Drizzle queries against `conversations`, `conversation_participants`, and `messages` tables. The schema and seed data are already there.

2. **Add auth middleware.** Apply `authMiddleware` to all message routes. Replace `CURRENT_USER_ID` with `req.user.userId` from the JWT. Remove the hardcoded user ID from the frontend and get it from the auth context.

3. **Fix WebSocket auth.** The simplest fix: change the frontend hook to pass the token in the URL query string (`ws://host/ws?token=xxx`) to match what the server expects. Alternatively, add a `type: "auth"` handler on the server side.

4. **Persist WebSocket messages.** When `handleMessage` processes a `type: "message"`, insert it into the `messages` table before broadcasting. This ensures messages survive server restarts.

5. **Add "Message" button to user profiles.** Hit `POST /api/messages/conversations` with the target user's ID. If a 1:1 conversation already exists, redirect to it instead of creating a duplicate.

### Phase 2: Polish (Medium Priority)

6. **Pagination.** Add `?cursor=` or `?before=` parameter to `GET /conversations/:id` to load messages in pages of 50. Implement infinite scroll on the frontend.

7. **Real-time unread badge.** Have the `MessagesPage` WebSocket listener also update a global unread count (via context or Zustand store) that the Header reads.

8. **Typing indicator debounce.** Add a 1-second throttle in `handleInputChange` before sending the WebSocket `typing` event.

9. **Online presence.** Track connected user IDs from the WebSocket client map. Expose a `GET /api/messages/presence` endpoint or broadcast presence changes via WebSocket.

### Phase 3: Feature Expansion (Lower Priority)

10. **Group chat UI.** The schema supports it. Build a "New Group" flow and update the chat UI to show multiple participant avatars.

11. **Image messages.** Reuse the existing `/uploads/image` endpoint. Add a `messageType` column (text/image) to the messages table.

12. **Message search.** Add a PostgreSQL full-text search index on `messages.content` and expose a `GET /api/messages/search?q=` endpoint.

---

## File Reference

| File | Role |
|---|---|
| `artifacts/pilateshub/src/pages/MessagesPage.tsx` | Frontend UI (conversation list + chat) |
| `artifacts/api-server/src/routes/messages.ts` | API routes (mock data, not DB) |
| `artifacts/api-server/src/lib/websocket.ts` | WebSocket server (auth + relay) |
| `artifacts/pilateshub/src/hooks/use-websocket.ts` | Frontend WebSocket hook |
| `artifacts/pilateshub/src/lib/notifications.ts` | Browser notification helpers |
| `artifacts/pilateshub/src/components/layout/Header.tsx` | Unread badge in header |
| `lib/db/src/schema/index.ts` | DB schema (conversations, messages, conversation_participants) |
| `scripts/src/seed.ts` | Seed data for messaging tables |
| `artifacts/api-server/src/middleware/auth.ts` | JWT auth middleware (not used by messages) |
