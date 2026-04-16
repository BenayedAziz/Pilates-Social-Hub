import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, MessageCircle, Plus, Send, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { EmptyState } from "@/components/EmptyState";
import { CommunityPageSkeleton } from "@/components/PageSkeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useApp } from "@/context/AppContext";
import { useForum } from "@/hooks/use-api";

const newDiscussionSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  category: z.string().min(1, "Pick a category"),
  body: z.string().min(10, "Write at least 10 characters"),
});
type NewDiscussionForm = z.infer<typeof newDiscussionSchema>;

// Mock replies per post index
const MOCK_REPLIES: Record<number, { id: number; initials: string; color: string; name: string; flair: string; text: string; timeAgo: string; upvotes: number }[]> = {
  0: [
    { id: 1, initials: "ML", color: "bg-blue-100", name: "Marie L.", flair: "Intermediate", text: "Super question ! J'ai eu le même problème au début. Concentre-toi sur le \"scoop\" du bas ventre.", timeAgo: "2h", upvotes: 4 },
    { id: 2, initials: "TC", color: "bg-rose-100", name: "Thomas C.", flair: "Advanced", text: "La neutre pelvis, c'est clé. Essaie de garder un espace entre ton bas dos et le tapis.", timeAgo: "1h", upvotes: 7 },
    { id: 3, initials: "SB", color: "bg-green-100", name: "Sophie B.", flair: "Beginner", text: "Merci pour ce thread, c'est exactement ce dont j'avais besoin !", timeAgo: "45m", upvotes: 2 },
  ],
  1: [
    { id: 4, initials: "PD", color: "bg-purple-100", name: "Paul D.", flair: "Advanced", text: "Les studios en 8ème sont généralement bien équipés. Pilates Studio Paris est top.", timeAgo: "3h", upvotes: 5 },
    { id: 5, initials: "LR", color: "bg-amber-100", name: "Léa R.", flair: "Intermediate", text: "J'ai essayé 3 studios à Paris, je peux te partager mes avis en DM !", timeAgo: "2h", upvotes: 3 },
  ],
  2: [
    { id: 6, initials: "AM", color: "bg-teal-100", name: "Antoine M.", flair: "Beginner", text: "Je débutais il y a 6 mois, le reformer m'a vraiment aidé pour le dos.", timeAgo: "5h", upvotes: 9 },
  ],
};

interface ForumPost {
  id: number;
  title: string;
  category: string;
  timeAgo: string;
  author: { name: string; initials: string; color: string };
  flair: string;
  upvotes: number;
  comments: number;
  body?: string;
}

interface ThreadDialogProps {
  post: ForumPost;
  postIndex: number;
  open: boolean;
  onClose: () => void;
  vote: "up" | "down" | undefined;
  onToggleVote: (id: number, dir: "up" | "down") => void;
}

function ThreadDialog({ post, postIndex, open, onClose, vote, onToggleVote }: ThreadDialogProps) {
  const [replyText, setReplyText] = useState("");
  const [localReplies, setLocalReplies] = useState<typeof MOCK_REPLIES[0]>([]);
  const mockReplies = MOCK_REPLIES[postIndex % Object.keys(MOCK_REPLIES).length] ?? [];
  const allReplies = [...localReplies, ...mockReplies];

  const submitReply = () => {
    const text = replyText.trim();
    if (!text) return;
    setLocalReplies((prev) => [
      { id: Date.now(), initials: "SJ", color: "bg-primary/15", name: "Sarah J.", flair: "Intermediate", text, timeAgo: "now", upvotes: 0 },
      ...prev,
    ]);
    setReplyText("");
    toast.success("Réponse publiée !");
  };

  const flairColors: Record<string, string> = {
    Beginner: "bg-green-100 text-green-700",
    Intermediate: "bg-blue-100 text-blue-700",
    Advanced: "bg-purple-100 text-purple-700",
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[92vw] md:max-w-lg rounded-2xl p-0 overflow-hidden border-none shadow-xl max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border/30 flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge className="text-[10px] h-5 px-1.5 border border-primary/20 bg-primary/8 text-primary font-bold">
                {post.category}
              </Badge>
              <span className="text-[10px] text-muted-foreground/60">{post.timeAgo}</span>
            </div>
            <h2 className="font-bold text-sm text-foreground leading-snug">{post.title}</h2>
          </div>
          <button type="button" onClick={onClose} className="text-muted-foreground/50 hover:text-foreground transition-colors flex-shrink-0 mt-0.5">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* OP content */}
        <div className="px-4 py-3 border-b border-border/20 flex gap-3">
          {/* Vote */}
          <div className="flex flex-col items-center gap-1 min-w-[32px]">
            <button type="button" onClick={() => onToggleVote(post.id, "up")}
              className={`p-1 rounded-lg transition-colors ${vote === "up" ? "text-orange-500 bg-orange-50" : "text-muted-foreground/30 hover:text-orange-400"}`}>
              <ChevronRight className="w-4 h-4 -rotate-90" />
            </button>
            <span className={`font-black text-xs ${vote === "up" ? "text-orange-500" : vote === "down" ? "text-indigo-500" : "text-foreground/70"}`}>
              {post.upvotes + (vote === "up" ? 1 : vote === "down" ? -1 : 0)}
            </span>
            <button type="button" onClick={() => onToggleVote(post.id, "down")}
              className={`p-1 rounded-lg transition-colors ${vote === "down" ? "text-indigo-500 bg-indigo-50" : "text-muted-foreground/30 hover:text-indigo-400"}`}>
              <ChevronRight className="w-4 h-4 rotate-90" />
            </button>
          </div>
          {/* Author + body */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <Avatar className={`w-6 h-6 ${post.author.color}`}>
                <AvatarFallback className="text-[9px] font-bold text-foreground">{post.author.initials}</AvatarFallback>
              </Avatar>
              <span className="text-xs font-bold text-foreground/80">{post.author.name}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${flairColors[post.flair] || "bg-muted text-muted-foreground"}`}>{post.flair}</span>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">
              {post.body ?? "Partagez vos techniques, conseils et retours d'expérience sur ce sujet avec la communauté PiHub !"}
            </p>
          </div>
        </div>

        {/* Replies */}
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-4">
          <p className="text-[11px] font-bold text-muted-foreground/50 uppercase tracking-wide">{allReplies.length} réponse{allReplies.length !== 1 ? "s" : ""}</p>
          {allReplies.map((reply) => (
            <div key={reply.id} className="flex gap-3">
              <Avatar className={`w-7 h-7 flex-shrink-0 ${reply.color}`}>
                <AvatarFallback className="text-[9px] font-bold text-foreground">{reply.initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-foreground">{reply.name}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${flairColors[reply.flair] || "bg-muted text-muted-foreground"}`}>{reply.flair}</span>
                  <span className="text-[10px] text-muted-foreground/40 ml-auto">{reply.timeAgo}</span>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed">{reply.text}</p>
                {reply.upvotes > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <ChevronRight className="w-3 h-3 -rotate-90 text-orange-400" />
                    <span className="text-[10px] text-muted-foreground/50 font-semibold">{reply.upvotes}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Reply input */}
        <div className="px-4 py-3 border-t border-border/30 flex items-center gap-2 bg-muted/20">
          <Avatar className="w-7 h-7 flex-shrink-0 bg-primary/15">
            <AvatarFallback className="text-[10px] font-bold text-primary">SJ</AvatarFallback>
          </Avatar>
          <div className="flex-1 flex items-center gap-2 bg-card rounded-2xl border border-border/40 px-3 py-2">
            <input
              type="text"
              placeholder="Répondre..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitReply()}
              className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground/50 text-foreground"
            />
            <button type="button" onClick={submitReply} className="text-primary hover:text-primary/80 transition-colors" aria-label="Send reply">
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function CommunityPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const { votes, toggleVote } = useApp();
  const { data: allForumPosts = [], isLoading } = useForum();
  const [openThreadPost, setOpenThreadPost] = useState<{ post: ForumPost; index: number } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<NewDiscussionForm>({
    resolver: zodResolver(newDiscussionSchema),
  });

  if (isLoading) return <CommunityPageSkeleton />;

  const onPostDiscussion = (data: NewDiscussionForm) => {
    toast.success(`Discussion "${data.title}" publiée dans ${data.category} !`);
    reset();
  };

  const filteredPosts =
    activeCategory === "All" ? allForumPosts : allForumPosts.filter((p: any) => p.category === activeCategory);

  const flairColors: Record<string, string> = {
    Beginner: "bg-green-100 text-green-700",
    Intermediate: "bg-blue-100 text-blue-700",
    Advanced: "bg-purple-100 text-purple-700",
  };

  const bodyValue = watch("body") ?? "";

  return (
    <div className="flex flex-col bg-background animate-in fade-in duration-300 relative">
      {/* Category tabs + new discussion button — sticky below the feed tabs bar (56px) */}
      <div className="px-4 py-3 bg-card sticky top-[52px] z-10 shadow-sm border-b border-border/20">
        <div className="flex items-center gap-2 mb-2.5">
          <div role="tablist" className="flex gap-2 overflow-x-auto flex-1" style={{ scrollbarWidth: "none" }}>
            {["All", "Technique", "Nutrition", "Studios", "Gear", "Challenges"].map((cat) => (
              <button
                type="button"
                role="tab"
                aria-selected={activeCategory === cat}
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full whitespace-nowrap text-sm font-bold transition-colors flex-shrink-0
                  ${activeCategory === cat ? "bg-primary text-white" : "bg-muted text-foreground/80 hover:bg-border"}`}
              >
                {cat}
              </button>
            ))}
          </div>
          {/* New discussion button — inline at top */}
          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                aria-label="Nouvelle discussion"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-full text-xs font-bold flex-shrink-0 hover:bg-primary/85 transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Nouveau
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-[340px] rounded-2xl p-0 overflow-hidden border-none">
              <DialogHeader className="p-4 pb-0">
                <DialogTitle className="font-bold">Nouvelle discussion</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3 p-4">
                <Input
                  placeholder="Titre du post..."
                  className="font-semibold bg-muted/50 border-border"
                  {...register("title")}
                />
                {errors.title && <p className="text-xs text-destructive -mt-1">{errors.title.message}</p>}
                <select
                  className="flex h-10 w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  defaultValue=""
                  {...register("category")}
                >
                  <option value="" disabled>Choisir une catégorie</option>
                  <option value="Technique">Technique</option>
                  <option value="Nutrition">Nutrition</option>
                  <option value="Studios">Studios</option>
                  <option value="Gear">Gear</option>
                  <option value="Challenges">Challenges</option>
                </select>
                {errors.category && <p className="text-xs text-destructive -mt-1">{errors.category.message}</p>}
                <div className="relative">
                  <textarea
                    className="flex min-h-[90px] w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    placeholder="Qu'est-ce que tu as en tête ?"
                    {...register("body")}
                  />
                  <span className={`absolute bottom-2 right-2 text-[10px] font-medium ${bodyValue.length > 280 ? "text-destructive" : "text-muted-foreground/40"}`}>
                    {bodyValue.length}/300
                  </span>
                </div>
                {errors.body && <p className="text-xs text-destructive -mt-1">{errors.body.message}</p>}
                <Button
                  onClick={handleSubmit(onPostDiscussion)}
                  className="w-full bg-primary hover:bg-primary/85 text-white font-bold"
                >
                  Publier
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="pb-24">
          <EmptyState
            icon={<MessageCircle className="w-8 h-8" />}
            title="No discussions yet"
            description="Be the first to start a discussion in this category!"
          />
        </div>
      ) : (
        <div className="p-5 flex flex-col gap-4 pb-24 md:max-w-2xl md:mx-auto">
          {filteredPosts.map((post: any, idx: number) => (
            <Card
              key={post.id}
              className="border border-border/40 shadow-sm hover:border-primary/30 transition-colors cursor-pointer bg-card rounded-2xl"
              onClick={() => setOpenThreadPost({ post, index: idx })}
            >
              <CardContent className="p-5 flex gap-3">
                {/* Vote column */}
                <div className="flex flex-col items-center gap-1 min-w-[36px]" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    aria-label="Upvote"
                    onClick={() => toggleVote(post.id, "up")}
                    className={`p-1 rounded-lg transition-colors ${votes[post.id] === "up" ? "text-orange-500 bg-orange-50" : "text-muted-foreground/40 hover:text-orange-400 hover:bg-orange-50"}`}
                  >
                    <ChevronRight className="w-5 h-5 -rotate-90" />
                  </button>
                  <span className={`font-black text-sm ${votes[post.id] === "up" ? "text-orange-500" : votes[post.id] === "down" ? "text-indigo-500" : "text-foreground/80"}`}>
                    {post.upvotes + (votes[post.id] === "up" ? 1 : votes[post.id] === "down" ? -1 : 0)}
                  </span>
                  <button
                    type="button"
                    aria-label="Downvote"
                    onClick={() => toggleVote(post.id, "down")}
                    className={`p-1 rounded-lg transition-colors ${votes[post.id] === "down" ? "text-indigo-500 bg-indigo-50" : "text-muted-foreground/40 hover:text-indigo-400 hover:bg-indigo-50"}`}
                  >
                    <ChevronRight className="w-5 h-5 rotate-90" />
                  </button>
                </div>
                {/* Post content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <Badge className="text-[10px] h-5 px-1.5 border border-primary/20 bg-primary/8 text-primary font-bold">
                      {post.category}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground/60 font-medium">{post.timeAgo}</span>
                  </div>
                  <h3 className="font-bold text-foreground leading-snug mb-2 text-sm">{post.title}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <Avatar className={`w-5 h-5 ${post.author.color}`}>
                        <AvatarFallback className="text-[8px] font-bold text-foreground">{post.author.initials}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-semibold text-foreground/80">{post.author.name}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${flairColors[post.flair] || "bg-muted text-muted-foreground"}`}>
                        {post.flair}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground/60">
                      <MessageCircle className="w-3.5 h-3.5" />
                      {post.comments + (MOCK_REPLIES[idx % Object.keys(MOCK_REPLIES).length]?.length ?? 0)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Thread dialog */}
      {openThreadPost && (
        <ThreadDialog
          post={openThreadPost.post}
          postIndex={openThreadPost.index}
          open={!!openThreadPost}
          onClose={() => setOpenThreadPost(null)}
          vote={votes[openThreadPost.post.id] as "up" | "down" | undefined}
          onToggleVote={toggleVote}
        />
      )}

    </div>
  );
}
