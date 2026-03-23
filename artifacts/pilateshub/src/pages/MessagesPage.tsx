import { ArrowLeft, MessageCircle, Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWebSocket } from "@/hooks/use-websocket";
import { notify } from "@/lib/notifications";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Participant {
  id: number;
  name: string;
  initials: string;
  color: string;
}

interface Conversation {
  id: number;
  participant: Participant;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  createdAt: string;
  readAt: string | null;
}

// ---------------------------------------------------------------------------
// Mock data (inline fallback — mirrors the API mock data)
// ---------------------------------------------------------------------------
const CURRENT_USER_ID = 1;

const fallbackConversations: Conversation[] = [
  {
    id: 1,
    participant: { id: 2, name: "Sophie B", initials: "SB", color: "bg-green-200" },
    lastMessage: "Yes! The Saturday morning class at Studio Harmonie is perfect for that.",
    lastMessageAt: "2026-03-23T09:15:00Z",
    unreadCount: 2,
  },
  {
    id: 2,
    participant: { id: 3, name: "Lucas M", initials: "LM", color: "bg-blue-200" },
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

const fallbackMessages: Record<number, Message[]> = {
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays === 1) {
    return "Yesterday";
  }
  if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: "short" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function formatChatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>(fallbackConversations);
  const [selectedConvo, setSelectedConvo] = useState<number | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { connected, send, on } = useWebSocket();

  // Listen for incoming real-time messages
  useEffect(() => {
    const unsubMessage = on("new_message", (data) => {
      // If we're currently viewing this conversation, append the message
      if (data.conversationId === selectedConvo) {
        const incoming: Message = {
          id: Date.now() + Math.random(),
          conversationId: data.conversationId,
          senderId: data.senderId,
          content: data.content,
          createdAt: data.createdAt,
          readAt: null,
        };
        setChatMessages((prev) => [...prev, incoming]);
      }

      // Update the conversation list preview
      setConversations((prev) =>
        prev.map((c) =>
          c.id === data.conversationId
            ? {
                ...c,
                lastMessage: data.content,
                lastMessageAt: data.createdAt,
                unreadCount: data.conversationId === selectedConvo ? c.unreadCount : c.unreadCount + 1,
              }
            : c,
        ),
      );

      // Send push notification when page is not focused
      if (document.hidden || data.conversationId !== selectedConvo) {
        const convo = conversations.find((c) => c.id === data.conversationId);
        if (convo) {
          notify.newMessage(convo.participant.name, data.content);
        }
      }
    });

    return unsubMessage;
  }, [on, selectedConvo, conversations]);

  // Listen for typing indicators
  useEffect(() => {
    const unsubTyping = on("typing", (data) => {
      if (data.conversationId === selectedConvo) {
        // Find the participant name
        const convo = conversations.find((c) => c.id === data.conversationId);
        if (convo) {
          setTypingUser(convo.participant.name);
          // Clear typing indicator after 3 seconds
          if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
          typingTimerRef.current = setTimeout(() => {
            setTypingUser(null);
          }, 3000);
        }
      }
    });

    return unsubTyping;
  }, [on, selectedConvo, conversations]);

  // Clear typing indicator when switching conversations
  useEffect(() => {
    setTypingUser(null);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
  }, [selectedConvo]);

  // Fetch conversations on mount
  useEffect(() => {
    fetch("/api/messages/conversations")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setConversations(data);
      })
      .catch(() => {
        // Use fallback data
      });
  }, []);

  // Fetch messages when a conversation is selected
  useEffect(() => {
    if (!selectedConvo) return;

    setLoading(true);
    fetch(`/api/messages/conversations/${selectedConvo}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.messages) {
          setChatMessages(data.messages);
        } else {
          setChatMessages(fallbackMessages[selectedConvo] || []);
        }
        // Clear unread count locally
        setConversations((prev) => prev.map((c) => (c.id === selectedConvo ? { ...c, unreadCount: 0 } : c)));
      })
      .catch(() => {
        setChatMessages(fallbackMessages[selectedConvo] || []);
      })
      .finally(() => setLoading(false));
  }, [selectedConvo]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const sendMessage = useCallback(() => {
    if (!newMessage.trim() || !selectedConvo) return;

    const content = newMessage.trim();
    const now = new Date().toISOString();
    const activeConversation = conversations.find((c) => c.id === selectedConvo);

    // Optimistic update
    const optimisticMsg: Message = {
      id: Date.now(),
      conversationId: selectedConvo,
      senderId: CURRENT_USER_ID,
      content,
      createdAt: now,
      readAt: null,
    };
    setChatMessages((prev) => [...prev, optimisticMsg]);
    setNewMessage("");

    // Update conversation list preview
    setConversations((prev) =>
      prev.map((c) => (c.id === selectedConvo ? { ...c, lastMessage: content, lastMessageAt: now } : c)),
    );

    // Send via WebSocket for real-time delivery
    if (activeConversation) {
      send({
        type: "message",
        conversationId: selectedConvo,
        recipientId: activeConversation.participant.id,
        content,
      });
    }

    // Send to API (persistence)
    fetch(`/api/messages/conversations/${selectedConvo}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    }).catch(() => {
      // Message already shown optimistically
    });
  }, [newMessage, selectedConvo, conversations, send]);

  // Send typing indicator on input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewMessage(e.target.value);
      const activeConversation = conversations.find((c) => c.id === selectedConvo);
      if (activeConversation && e.target.value.trim()) {
        send({
          type: "typing",
          conversationId: selectedConvo,
          recipientId: activeConversation.participant.id,
        });
      }
    },
    [selectedConvo, conversations, send],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const activeConvo = conversations.find((c) => c.id === selectedConvo);

  // =========================================================================
  // Chat view
  // =========================================================================
  if (selectedConvo && activeConvo) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-5 py-3 bg-card border-b border-border/40 flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              setSelectedConvo(null);
              setChatMessages([]);
            }}
            className="p-1.5 -ml-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            aria-label="Back to conversations"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Avatar className="h-9 w-9">
            <AvatarFallback className={`${activeConvo.participant.color} text-foreground font-bold text-xs`}>
              {activeConvo.participant.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <span className="font-bold text-sm text-foreground">{activeConvo.participant.name}</span>
            <p className="text-[10px] text-muted-foreground leading-tight">Active now</p>
          </div>
          {/* Connection status indicator */}
          <div className="flex items-center gap-1.5" title={connected ? "Connected" : "Disconnected"}>
            <span
              className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-400" : "bg-gray-400"}`}
            />
            <span className="text-[10px] text-muted-foreground">
              {connected ? "Live" : "Offline"}
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-1">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {chatMessages.map((msg, idx) => {
                const isMe = msg.senderId === CURRENT_USER_ID;
                const showTimestamp =
                  idx === 0 ||
                  new Date(msg.createdAt).getTime() - new Date(chatMessages[idx - 1].createdAt).getTime() >
                    5 * 60 * 1000;
                const isLastInGroup =
                  idx === chatMessages.length - 1 || chatMessages[idx + 1].senderId !== msg.senderId;

                return (
                  <div key={msg.id}>
                    {showTimestamp && (
                      <div className="flex justify-center my-3">
                        <span className="text-[10px] text-muted-foreground/60 bg-muted/40 px-3 py-1 rounded-full">
                          {formatChatTime(msg.createdAt)}
                        </span>
                      </div>
                    )}
                    <div
                      className={`flex ${isMe ? "justify-end" : "justify-start"} ${isLastInGroup ? "mb-2" : "mb-0.5"}`}
                    >
                      <div
                        className={`max-w-[75%] px-4 py-2.5 ${
                          isMe
                            ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md"
                            : "bg-muted text-foreground rounded-2xl rounded-bl-md"
                        }`}
                      >
                        <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                      </div>
                    </div>
                    {isLastInGroup && (
                      <div className={`flex ${isMe ? "justify-end" : "justify-start"} px-1 mb-1`}>
                        <span className="text-[10px] text-muted-foreground/50">
                          {formatChatTime(msg.createdAt)}
                          {isMe && msg.readAt && " · Read"}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Typing indicator */}
              {typingUser && (
                <div className="flex justify-start mb-2">
                  <div className="bg-muted text-muted-foreground rounded-2xl rounded-bl-md px-4 py-2.5">
                    <p className="text-sm italic">{typingUser} is typing...</p>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Message input */}
        <div className="px-4 py-3 bg-card border-t border-border/40 flex items-center gap-2 shrink-0">
          <Input
            value={newMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-muted/50 border-0 rounded-full px-4 py-2.5 text-sm focus-visible:ring-1 focus-visible:ring-primary/30 placeholder:text-muted-foreground/50"
          />
          <Button
            size="icon"
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="h-10 w-10 rounded-full bg-primary hover:bg-primary/85 text-primary-foreground shadow-md disabled:opacity-30 disabled:shadow-none transition-all shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // Conversation list view
  // =========================================================================
  return (
    <div className="p-5">
      <h1 className="text-xl font-bold text-foreground mb-1">Messages</h1>
      <p className="text-xs text-muted-foreground mb-5">Your conversations</p>

      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
            <MessageCircle className="w-7 h-7 opacity-40" />
          </div>
          <p className="text-sm font-medium">No conversations yet</p>
          <p className="text-xs text-muted-foreground/60">Start a conversation from someone's profile</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {conversations.map((convo) => (
            <button
              key={convo.id}
              type="button"
              onClick={() => setSelectedConvo(convo.id)}
              className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/50 active:bg-muted/70 transition-colors text-left"
            >
              <div className="relative shrink-0">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className={`${convo.participant.color} text-foreground font-bold text-sm`}>
                    {convo.participant.initials}
                  </AvatarFallback>
                </Avatar>
                {/* Online indicator */}
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-card rounded-full" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-sm ${convo.unreadCount > 0 ? "font-bold text-foreground" : "font-semibold text-foreground/90"}`}
                  >
                    {convo.participant.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {formatMessageTime(convo.lastMessageAt)}
                  </span>
                </div>
                <p
                  className={`text-xs mt-0.5 truncate ${
                    convo.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"
                  }`}
                >
                  {convo.lastMessage}
                </p>
              </div>

              {convo.unreadCount > 0 && (
                <span className="w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center shrink-0 shadow-sm">
                  {convo.unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
