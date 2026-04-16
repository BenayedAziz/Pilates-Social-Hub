import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, Flame, Globe, Lock, MessageCircle, Send, Share2, Trophy, Users, X, Zap } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { FeedPageSkeleton } from "@/components/PageSkeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/context/AppContext";
import { useFeed, useLeaderboard } from "@/hooks/use-api";
import CirclesPage from "@/pages/CirclesPage";
import CommunityPage from "@/pages/CommunityPage";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface SessionData {
  type: string;
  studio: string;
  duration: number;
  calories: number;
}

interface LocalPost {
  id: number;
  user: { id: number; name: string; initials: string; color: string };
  type: string;
  studio: string;
  duration: number;
  calories: number;
  title: string;
  caption: string;
  feeling: string;
  audience: string;
  hasPhoto: boolean;
  timeAgo: string;
  likes: number;
  comments: number;
}

// ---------------------------------------------------------------------------
// Mini session card preview (used inside the post dialog)
// ---------------------------------------------------------------------------
function SessionCardPreview({ data }: { data: SessionData }) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
  return (
    <div
      className="rounded-2xl px-4 py-4 flex items-center gap-4"
      style={{ background: "linear-gradient(135deg, hsl(28 22% 28%) 0%, hsl(16 50% 42%) 100%)" }}
    >
      <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
        <Zap className="w-5 h-5 text-white fill-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-bold text-sm truncate">{data.type} · {data.studio}</p>
        <p className="text-white/60 text-[11px]">{dateStr}</p>
      </div>
      <div className="flex gap-3 flex-shrink-0">
        <div className="text-center">
          <p className="text-white font-black text-base leading-none">{data.duration}</p>
          <p className="text-white/50 text-[9px] uppercase">min</p>
        </div>
        <div className="text-center">
          <p className="text-white font-black text-base leading-none">{data.calories}</p>
          <p className="text-white/50 text-[9px] uppercase">cal</p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Strava-style post dialog
// ---------------------------------------------------------------------------
const FEELINGS = [
  { value: "terrible", label: "Terrible", icon: "😩" },
  { value: "mauvaise", label: "Mauvaise", icon: "😕" },
  { value: "ok", label: "Ok", icon: "😐" },
  { value: "bonne", label: "Bonne", icon: "🙂" },
  { value: "excellente", label: "Top !", icon: "🔥" },
];

const AUDIENCES = [
  { value: "everyone", label: "Tout le monde", icon: Globe },
  { value: "followers", label: "Mes followers", icon: Users },
  { value: "only_me", label: "Moi seulement", icon: Lock },
];

interface SessionPostDialogProps {
  data: SessionData;
  onPublish: (post: Omit<LocalPost, "id" | "user" | "hasPhoto" | "timeAgo" | "likes" | "comments">) => void;
  onClose: () => void;
}

function SessionPostDialog({ data, onPublish, onClose }: SessionPostDialogProps) {
  const [title, setTitle] = useState(`${data.type} chez ${data.studio}`);
  const [caption, setCaption] = useState("");
  const [feeling, setFeeling] = useState("bonne");
  const [audience, setAudience] = useState("everyone");

  const handlePublish = () => {
    onPublish({ type: data.type, studio: data.studio, duration: data.duration, calories: data.calories, title, caption, feeling, audience });
    toast.success("Publié sur le Feed !");
    onClose();
  };

  const handleShareExternal = async () => {
    const text = `${title} — ${data.duration}min · ${data.calories}cal 🔥 via PiHub`;
    if (navigator.share) {
      try { await navigator.share({ text, title: "Ma session PiHub" }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Copié dans le presse-papier !");
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[92vw] md:max-w-[400px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
          <DialogTitle className="text-base font-black text-foreground">Publier ta séance</DialogTitle>
          <button type="button" onClick={onClose} className="text-muted-foreground/50 hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 pb-5 flex flex-col gap-4">
          {/* Card preview */}
          <SessionCardPreview data={data} />

          {/* Title */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Titre</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-muted/50 border border-border/60 rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Description <span className="text-muted-foreground/40 font-normal normal-case">(optionnel)</span></label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Comment s'est passée ta séance ?"
              rows={3}
              className="w-full bg-muted/50 border border-border/60 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          {/* Feeling */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2 block">Comment tu t'es senti(e) ?</label>
            <div className="flex gap-2">
              {FEELINGS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFeeling(f.value)}
                  className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 transition-all ${
                    feeling === f.value
                      ? "border-primary bg-primary/8 shadow-sm"
                      : "border-border/40 bg-muted/30 hover:border-border"
                  }`}
                >
                  <span className="text-lg leading-none">{f.icon}</span>
                  <span className={`text-[9px] font-bold ${feeling === f.value ? "text-primary" : "text-muted-foreground/60"}`}>{f.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Audience */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2 block">Qui peut voir ?</label>
            <div className="flex flex-col gap-2">
              {AUDIENCES.map((a) => {
                const Icon = a.icon;
                return (
                  <button
                    key={a.value}
                    type="button"
                    onClick={() => setAudience(a.value)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition-all text-left ${
                      audience === a.value
                        ? "border-primary bg-primary/8"
                        : "border-border/40 bg-muted/30 hover:border-border"
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${audience === a.value ? "text-primary" : "text-muted-foreground/60"}`} />
                    <span className={`text-sm font-semibold ${audience === a.value ? "text-primary" : "text-foreground"}`}>{a.label}</span>
                    {audience === a.value && <div className="ml-auto w-2 h-2 rounded-full bg-primary" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 pt-3 flex flex-col gap-2 border-t border-border/20 flex-shrink-0">
          <Button onClick={handlePublish} className="w-full font-bold h-11 gap-2 bg-primary hover:bg-primary/90">
            <Zap className="w-4 h-4 fill-current" />
            Publier sur le Feed
          </Button>
          <Button variant="outline" onClick={handleShareExternal} className="w-full font-semibold gap-2">
            <Share2 className="w-4 h-4" />
            Partager à l'extérieur
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const FEED_PHOTOS = [
  "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&h=300&fit=crop",
  "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=500&h=300&fit=crop",
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=300&fit=crop",
  "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=500&h=300&fit=crop",
  "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&h=300&fit=crop",
];

// Mock comments per post index
const MOCK_COMMENTS = [
  [
    { id: 1, initials: "ML", color: "bg-blue-100", name: "Marie L.", text: "Super session ! 💪", timeAgo: "2m" },
    { id: 2, initials: "TC", color: "bg-rose-100", name: "Thomas C.", text: "T'as battu mon record 😅", timeAgo: "5m" },
  ],
  [
    { id: 3, initials: "SB", color: "bg-green-100", name: "Sophie B.", text: "Quel studio tu recommandes ?", timeAgo: "1m" },
  ],
  [
    { id: 4, initials: "AM", color: "bg-purple-100", name: "Antoine M.", text: "On y va ensemble la prochaine fois !", timeAgo: "8m" },
    { id: 5, initials: "LR", color: "bg-amber-100", name: "Léa R.", text: "Impressionnant 🔥", timeAgo: "12m" },
    { id: 6, initials: "PD", color: "bg-teal-100", name: "Paul D.", text: "Belle progression !", timeAgo: "20m" },
  ],
];

const logSessionSchema = z.object({
  type: z.string().min(1, "Session type is required"),
  studio: z.string().min(1, "Studio/location is required"),
  duration: z.coerce.number().min(1, "Min 1 minute").max(300, "Max 300 minutes"),
  calories: z.coerce.number().min(0, "Must be positive").max(5000, "Max 5000"),
});
type LogSessionForm = z.infer<typeof logSessionSchema>;

export default function FeedPage() {
  const { likedPosts, toggleLike, following, toggleFollow } = useApp();
  const { data: apiPosts = [], isLoading: postsLoading } = useFeed();
  const { data: LEADERBOARD = [] } = useLeaderboard();
  const [pulseAnimation, setPulseAnimation] = useState<number | null>(null);
  const [openComments, setOpenComments] = useState<Set<number>>(new Set());
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [localComments, setLocalComments] = useState<Record<number, { id: number; initials: string; color: string; name: string; text: string; timeAgo: string }[]>>(() => {
    try { return JSON.parse(localStorage.getItem("pilateshub-comments") ?? "{}"); } catch { return {}; }
  });
  const [localPosts, setLocalPosts] = useState<LocalPost[]>(() => {
    try { return JSON.parse(localStorage.getItem("pilateshub-local-posts") ?? "[]"); } catch { return []; }
  });
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [postDialogOpen, setPostDialogOpen] = useState(false);

  const posts = [...localPosts, ...apiPosts];

  const handlePublishPost = (fields: Omit<LocalPost, "id" | "user" | "hasPhoto" | "timeAgo" | "likes" | "comments">) => {
    const newPost: LocalPost = {
      id: Date.now(),
      user: { id: 0, name: "Sarah J.", initials: "SJ", color: "bg-primary/20" },
      hasPhoto: false,
      timeAgo: "maintenant",
      likes: 0,
      comments: 0,
      ...fields,
    };
    setLocalPosts((prev) => {
      const updated = [newPost, ...prev];
      localStorage.setItem("pilateshub-local-posts", JSON.stringify(updated));
      return updated;
    });
  };

  const handlePulse = (postId: number) => {
    toggleLike(postId);
    if (!likedPosts[postId]) {
      setPulseAnimation(postId);
      setTimeout(() => setPulseAnimation(null), 1000);
    }
  };

  const toggleComments = (postId: number) => {
    setOpenComments((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  const submitComment = (postId: number, _idx: number) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    const newComment = { id: Date.now(), initials: "SJ", color: "bg-primary/15", name: "Sarah J.", text, timeAgo: "now" };
    setLocalComments((prev) => {
      const updated = { ...prev, [postId]: [newComment, ...(prev[postId] ?? [])] };
      localStorage.setItem("pilateshub-comments", JSON.stringify(updated));
      return updated;
    });
    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LogSessionForm>({
    resolver: zodResolver(logSessionSchema),
  });

  const onLogSession = (data: LogSessionForm) => {
    setSessionData({ type: data.type, studio: data.studio, duration: data.duration, calories: data.calories });
    setPostDialogOpen(true);
    reset();
  };

  if (postsLoading) return <FeedPageSkeleton />;

  return (
    <div className="flex flex-col bg-background min-h-full animate-in fade-in duration-300">
      <Tabs defaultValue="activity">
        <div className="px-4 py-3 bg-card sticky top-0 z-10 border-b border-border/40">
          <TabsList className="w-full grid grid-cols-3 bg-muted p-1 rounded-xl h-9">
            <TabsTrigger value="activity" className="rounded-lg font-semibold text-xs">
              Activity
            </TabsTrigger>
            <TabsTrigger value="forum" className="rounded-lg font-semibold text-xs">
              Forum
            </TabsTrigger>
            <TabsTrigger value="circles" className="rounded-lg font-semibold text-xs">
              Circles
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="activity" className="mt-0">
          {/* Leaderboard sticky banner */}
          <div className="sticky top-[56px] z-10 bg-card border-b border-border/30 px-4 py-3">
            <div className="flex items-center gap-1 mb-2">
              <Trophy className="w-4 h-4 text-accent-cta" />
              <span className="text-xs font-bold text-foreground uppercase tracking-wide">Top de la semaine</span>
            </div>
            <div className="flex gap-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              {LEADERBOARD.slice(0, 5).map((entry, i) => (
                <div key={entry.rank} className="flex flex-col items-center gap-1.5 flex-shrink-0 min-w-[56px]">
                  <div className="relative">
                    <Avatar className={`w-10 h-10 border-2 ${i === 0 ? "border-accent-cta shadow-md" : "border-border"} ${entry.color ?? "bg-muted"}`}>
                      <AvatarFallback className="text-xs font-bold text-foreground">{entry.initials}</AvatarFallback>
                    </Avatar>
                    <span className={`absolute -top-1 -right-1 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-card ${i === 0 ? "bg-accent-cta text-white" : "bg-muted text-muted-foreground"}`}>
                      {i + 1}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-foreground/80 truncate max-w-[56px] text-center">{entry.name?.split(" ")[0]}</span>
                  <span className="text-[10px] text-muted-foreground/60 font-medium">{entry.sessions} sess.</span>
                </div>
              ))}
            </div>
          </div>

          {/* Share bar */}
          <div className="px-4 py-3 bg-card border-b border-border/20">
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="w-full flex items-center gap-3 bg-muted/60 rounded-2xl px-4 py-3.5 text-left hover:bg-muted transition-colors border border-border/30"
                >
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                    SJ
                  </div>
                  <span className="text-sm text-muted-foreground font-medium">Partager ta session...</span>
                  <div className="ml-auto bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0">
                    Post
                  </div>
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-[340px] rounded-3xl border-border/40">
                <DialogHeader>
                  <DialogTitle className="font-semibold">Log a Session</DialogTitle>
                </DialogHeader>
                <div className="grid gap-3 py-3">
                  <Input
                    placeholder="Session type (e.g. Reformer Flow)"
                    className="bg-muted/50 border-border/60"
                    {...register("type")}
                  />
                  {errors.type && <p className="text-xs text-destructive -mt-1">{errors.type.message}</p>}
                  <Input
                    placeholder="Studio or Home"
                    className="bg-muted/50 border-border/60"
                    {...register("studio")}
                  />
                  {errors.studio && <p className="text-xs text-destructive -mt-1">{errors.studio.message}</p>}
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        placeholder="Duration (min)"
                        type="number"
                        className="bg-muted/50 border-border/60"
                        {...register("duration")}
                      />
                      {errors.duration && <p className="text-xs text-destructive mt-1">{errors.duration.message}</p>}
                    </div>
                    <div className="flex-1">
                      <Input
                        placeholder="Calories"
                        type="number"
                        className="bg-muted/50 border-border/60"
                        {...register("calories")}
                      />
                      {errors.calories && <p className="text-xs text-destructive mt-1">{errors.calories.message}</p>}
                    </div>
                  </div>
                  <Button
                    onClick={handleSubmit(onLogSession)}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold mt-1 btn-premium"
                  >
                    Continuer →
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="p-5 flex flex-col gap-6 md:max-w-xl md:mx-auto">
            {posts.map((post, idx) => {
              const mockComments = MOCK_COMMENTS[idx % MOCK_COMMENTS.length];
              const extra = localComments[post.id] ?? [];
              const allComments = [...extra, ...mockComments];
              const isCommentsOpen = openComments.has(post.id);

              return (
                <Card
                  key={post.id}
                  className="relative border-none shadow-sm overflow-hidden bg-card rounded-2xl card-warm"
                >
                  <CardHeader className="p-5 pb-3 flex flex-row items-start gap-3">
                    <Avatar className={`w-10 h-10 flex-shrink-0 ${post.user.color} border-2 border-card shadow-sm`}>
                      <AvatarFallback className="text-foreground font-bold text-sm">{post.user.initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold text-sm text-foreground truncate">{post.user.name}</h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-muted-foreground">{post.timeAgo}</span>
                          <button
                            type="button"
                            aria-label={following[post.user.id] ? "Unfollow" : "Follow"}
                            onClick={() => toggleFollow(post.user.id)}
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors border ${following[post.user.id] ? "bg-muted text-muted-foreground border-border" : "bg-primary/8 text-primary border-primary/20 hover:bg-primary/15"}`}
                          >
                            {following[post.user.id] ? "Following" : "Follow"}
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {(post as any).title
                          ? <span className="font-semibold text-foreground/80">{(post as any).title}</span>
                          : <>completed <span className="font-semibold text-foreground/80">{post.type}</span> at {post.studio}</>}
                      </p>
                    </div>
                  </CardHeader>

                  {(post as any).caption && (
                    <div className="px-5 pb-3">
                      <p className="text-sm text-foreground/80 leading-relaxed">{(post as any).caption}</p>
                    </div>
                  )}

                  {post.hasPhoto && (
                    <div className="h-44 mx-5 rounded-xl mb-3 overflow-hidden">
                      <img
                        src={FEED_PHOTOS[idx % FEED_PHOTOS.length]}
                        alt={`${post.user.name}'s ${post.type} session`}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <CardContent className="px-5 pb-3">
                    <div className="flex gap-3">
                      <div className="flex items-center gap-1.5 bg-primary/8 px-3 py-2 rounded-xl text-sm text-primary font-semibold">
                        <Clock className="w-4 h-4 flex-shrink-0" /> {post.duration} min
                      </div>
                      <div className="flex items-center gap-1.5 bg-accent-cta/8 px-3 py-2 rounded-xl text-sm text-accent-cta font-semibold">
                        <Flame className="w-4 h-4 flex-shrink-0" /> {post.calories} cal
                      </div>
                    </div>
                  </CardContent>

                  {(post.likes > 0 || likedPosts[post.id]) && (
                    <div className="px-5 pb-2 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-primary fill-primary" />
                      <span className="text-xs text-muted-foreground font-medium">
                        {post.likes + (likedPosts[post.id] ? 1 : 0)} pulses
                      </span>
                    </div>
                  )}

                  {pulseAnimation === post.id && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
                      <Zap className="w-12 h-12 text-primary fill-primary animate-bounce" />
                    </div>
                  )}

                  <CardFooter className="px-5 py-3 border-t border-border/30 flex justify-between">
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => handlePulse(post.id)}
                        aria-label={likedPosts[post.id] ? "Remove pulse" : "Give pulse"}
                        className={`flex items-center gap-1.5 text-sm font-semibold transition-all ${
                          likedPosts[post.id] ? "text-primary" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Zap className={`w-4 h-4 transition-transform ${likedPosts[post.id] ? "scale-110 fill-primary" : ""}`} />
                        <span>{post.likes + (likedPosts[post.id] ? 1 : 0)}</span>
                        {likedPosts[post.id] && <span className="text-xs font-semibold text-primary/70">Pulse!</span>}
                      </button>
                      <button
                        type="button"
                        aria-label="Toggle comments"
                        onClick={() => toggleComments(post.id)}
                        className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${isCommentsOpen ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        <MessageCircle className={`w-4 h-4 ${isCommentsOpen ? "fill-primary/20" : ""}`} />
                        {allComments.length + post.comments}
                      </button>
                    </div>
                    <button
                      type="button"
                      aria-label="Share post"
                      onClick={() => toast.info("Partage bientôt disponible !")}
                      className="text-muted-foreground/40 hover:text-muted-foreground transition-colors text-sm"
                    >
                      ↗
                    </button>
                  </CardFooter>

                  {/* Comment section */}
                  {isCommentsOpen && (
                    <div className="border-t border-border/30 bg-muted/20">
                      {/* Existing comments */}
                      <div className="px-5 pt-3 flex flex-col gap-3 max-h-48 overflow-y-auto">
                        {allComments.map((c) => (
                          <div key={c.id} className="flex items-start gap-2">
                            <Avatar className={`w-6 h-6 flex-shrink-0 ${c.color}`}>
                              <AvatarFallback className="text-[9px] font-bold text-foreground">{c.initials}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 bg-card rounded-xl px-3 py-2 shadow-sm">
                              <div className="flex items-baseline gap-2">
                                <span className="text-[11px] font-bold text-foreground">{c.name}</span>
                                <span className="text-[10px] text-muted-foreground/50">{c.timeAgo}</span>
                              </div>
                              <p className="text-xs text-foreground/80 mt-0.5">{c.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* Comment input */}
                      <div className="px-5 py-3 flex items-center gap-2">
                        <Avatar className="w-7 h-7 flex-shrink-0 bg-primary/15">
                          <AvatarFallback className="text-[10px] font-bold text-primary">SJ</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 flex items-center gap-2 bg-card rounded-2xl border border-border/40 px-3 py-2">
                          <input
                            type="text"
                            placeholder="Ajouter un commentaire..."
                            value={commentInputs[post.id] ?? ""}
                            onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))}
                            onKeyDown={(e) => e.key === "Enter" && submitComment(post.id, idx)}
                            className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground/50 text-foreground"
                          />
                          <button
                            type="button"
                            onClick={() => submitComment(post.id, idx)}
                            className="text-primary hover:text-primary/80 transition-colors"
                            aria-label="Send comment"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}

            {/* Bottom spacer */}
            <div className="h-4" />
          </div>
        </TabsContent>

        <TabsContent value="forum" className="mt-0">
          <CommunityPage />
        </TabsContent>

        <TabsContent value="circles" className="mt-0">
          <CirclesPage />
        </TabsContent>
      </Tabs>

      {/* Post to feed dialog */}
      {postDialogOpen && sessionData && (
        <SessionPostDialog
          data={sessionData}
          onPublish={handlePublishPost}
          onClose={() => { setPostDialogOpen(false); setSessionData(null); }}
        />
      )}
    </div>
  );
}
