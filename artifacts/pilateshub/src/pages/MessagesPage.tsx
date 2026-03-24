import { ArrowLeft, MessageCircle, Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useWebSocket } from "@/hooks/use-websocket";
import { apiFetch } from "@/hooks/api-fetch";
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
  const { user } = useAuth();
  const currentUserId = user?.id ?? 0;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvo, setSelectedConvo] = useState<number | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<number>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingThrottleRef = useRef<number>(0);

  const { connected, send, on } = useWebSocket();

  // Listen for presence updates
  useEffect(() => {
    const unsubPresence = on("presence", (data) => {
      if (Array.isArray(data.onlineUserIds)) {
        setOnlineUserIds(new Set(data.onlineUserIds));
      }
    });
    return unsubPresence;
  }, [on]);

  // Listen for incoming real-time messages
  useEffect(() => {
    const unsubMessage = on("new_message", (data) => {
      // If we're currently viewing this conversation, append the message
      if (data.conversationId === selectedConvo) {
        const incoming: Message = {
          id: data.id || Date.now() + Math.random(),
          conversationId: data.conversationId,
          senderId: data.senderId,
          content: data.content,
          createdAt: data.createdAt,
          readAt: null,
        };
        setChatMessages((prev) => [...prev, incoming]);

        // Mark as read since user is viewing this conversation
        const activeConversation = conversations.find((c) => c.id === data.conversationId);
        if (activeConversation) {
          send({
            type: "mark_read",
            conversationId: data.conversationId,
            recipientId: data.senderId,
          });
        }
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
  }, [on, selectedConvo, conversations, send]);

  // Listen for read receipt events
  useEffect(() => {
    const unsubRead = on("messages_read", (data) => {
      if (data.conversationId === selectedConvo) {
        setChatMessages((prev) =>
          prev.map((msg) =>
            msg.senderId === currentUserId && !msg.readAt
              ? { ...msg, readAt: data.readAt }
              : msg,
          ),
        );
      }
    });
    return unsubRead;
  }, [on, selectedConvo, currentUserId]);

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
    setLoading(true);
    apiFetch<Conversation[]>("/messages/conversations")
      .then((data) => {
        if (Array.isArray(data)) setConversations(data);
      })
      .catch(() => {
        // No fallback — just show empty state
      })
      .finally(() => setLoading(false));
  }, []);

  // Fetch messages when a conversation is selected
  useEffect(() => {
    if (!selectedConvo) return;

    setLoading(true);
    apiFetch<{ conversation: Conversation; messages: Message[] }>(
      `/messages/conversations/${selectedConvo}`,
    )
      .then((data) => {
        if (data.messages) {
          setChatMessages(data.messages);
        }
        // Clear unread count locally
        setConversations((prev) =>
          prev.map((c) => (c.id === selectedConvo ? { ...c, unreadCount: 0 } : c)),
        );
      })
      .catch(() => {
        setChatMessages([]);
      })
      .finally(() => setLoading(false));
  }, [selectedConvo]);

  // Scroll to bottom when messages change (use scrollTop to avoid iframe parent scroll)
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
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
      senderId: currentUserId,
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

    // Send to API (persistence) — the WebSocket handler also persists,
    // but this ensures the message is saved even if WS is disconnected
    apiFetch(`/messages/conversations/${selectedConvo}`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }).catch(() => {
      // Message already shown optimistically
    });
  }, [newMessage, selectedConvo, conversations, send, currentUserId]);

  // Send typing indicator on input change (throttled to 1 per second)
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewMessage(e.target.value);
      const activeConversation = conversations.find((c) => c.id === selectedConvo);
      if (activeConversation && e.target.value.trim()) {
        const now = Date.now();
        if (now - typingThrottleRef.current >= 1000) {
          typingThrottleRef.current = now;
          send({
            type: "typing",
            conversationId: selectedConvo,
            recipientId: activeConversation.participant.id,
          });
        }
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
    const isOnline = onlineUserIds.has(activeConvo.participant.id);

    return (
      <div className="flex flex-col bg-background absolute inset-0">
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
            <p className="text-[10px] text-muted-foreground leading-tight">
              {isOnline ? "Active now" : "Offline"}
            </p>
          </div>
          {/* Connection status indicator */}
          <div className="flex items-center gap-1.5" title={connected ? "Connected" : "Disconnected"}>
            <span className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-400" : "bg-gray-400"}`} />
            <span className="text-[10px] text-muted-foreground">{connected ? "Live" : "Offline"}</span>
          </div>
        </div>

        {/* Messages */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-1">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {chatMessages.map((msg, idx) => {
                const isMe = msg.senderId === currentUserId;
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

        {/* Message input — mb-20 on mobile to clear the absolutely-positioned BottomNav */}
        <div className="px-4 py-3 mb-20 md:mb-0 bg-card border-t border-border/40 flex items-center gap-2 shrink-0">
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
    <div className="p-5 bg-background min-h-full">
      <h1 className="text-xl font-bold text-foreground mb-1">Messages</h1>
      <p className="text-xs text-muted-foreground mb-5">Your conversations</p>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
            <MessageCircle className="w-7 h-7 opacity-40" />
          </div>
          <p className="text-sm font-medium">No conversations yet</p>
          <p className="text-xs text-muted-foreground/60">Start a conversation from someone's profile</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {conversations.map((convo) => {
            const isOnline = onlineUserIds.has(convo.participant.id);
            return (
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
                  {/* Online indicator — only show green dot if user is actually online */}
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-card rounded-full" />
                  )}
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
            );
          })}
        </div>
      )}
    </div>
  );
}
