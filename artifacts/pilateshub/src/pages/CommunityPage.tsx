import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, MessageCircle, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { EmptyState } from "@/components/EmptyState";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useApp } from "@/context/AppContext";
import { useForum } from "@/hooks/use-api";
import { CommunityPageSkeleton } from "@/components/PageSkeleton";

const newDiscussionSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  category: z.string().min(1, "Pick a category"),
  body: z.string().min(10, "Write at least 10 characters"),
});
type NewDiscussionForm = z.infer<typeof newDiscussionSchema>;

export default function CommunityPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const { votes, toggleVote } = useApp();
  const { data: allForumPosts = [], isLoading } = useForum();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NewDiscussionForm>({
    resolver: zodResolver(newDiscussionSchema),
  });

  if (isLoading) return <CommunityPageSkeleton />;

  const onPostDiscussion = (data: NewDiscussionForm) => {
    toast.success(`Discussion "${data.title}" posted in ${data.category}!`);
    reset();
  };

  const filteredPosts =
    activeCategory === "All" ? allForumPosts : allForumPosts.filter((p) => p.category === activeCategory);

  const flairColors: Record<string, string> = {
    Beginner: "bg-green-100 text-green-700",
    Intermediate: "bg-blue-100 text-blue-700",
    Advanced: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="flex flex-col h-full bg-background animate-in fade-in duration-300 relative">
      {/* Category tabs */}
      <div className="px-4 py-3 bg-card sticky top-0 z-10 shadow-sm">
        <div role="tablist" className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
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
          {filteredPosts.map((post) => (
            <Card
              key={post.id}
              className="border border-border/40 shadow-sm hover:border-primary/30 transition-colors cursor-pointer bg-card rounded-2xl"
            >
              <CardContent className="p-5 flex gap-3">
                {/* Vote column */}
                <div className="flex flex-col items-center gap-1 min-w-[36px]">
                  <button
                    type="button"
                    aria-label="Upvote"
                    onClick={() => toggleVote(post.id, "up")}
                    className={`p-1 rounded-lg transition-colors ${votes[post.id] === "up" ? "text-orange-500 bg-orange-50" : "text-muted-foreground/40 hover:text-orange-400 hover:bg-orange-50"}`}
                  >
                    <ChevronRight className="w-5 h-5 -rotate-90" />
                  </button>
                  <span
                    className={`font-black text-sm ${votes[post.id] === "up" ? "text-orange-500" : votes[post.id] === "down" ? "text-indigo-500" : "text-foreground/80"}`}
                  >
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
                        <AvatarFallback className="text-[8px] font-bold text-foreground">
                          {post.author.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-semibold text-foreground/80">{post.author.name}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${flairColors[post.flair] || "bg-muted text-muted-foreground"}`}
                      >
                        {post.flair}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground/60">
                      <MessageCircle className="w-3.5 h-3.5" /> {post.comments}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* FAB */}
      <Dialog>
        <DialogTrigger asChild>
          <button
            type="button"
            aria-label="New discussion"
            className="absolute bottom-20 right-4 w-14 h-14 bg-primary text-white rounded-full shadow-xl flex items-center justify-center hover:bg-primary/85 hover:scale-105 transition-all z-20"
          >
            <Plus className="w-6 h-6" />
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-[340px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-bold">New Discussion</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <Input
              placeholder="Post title..."
              className="font-semibold bg-muted/50 border-border"
              {...register("title")}
            />
            {errors.title && <p className="text-xs text-destructive -mt-1">{errors.title.message}</p>}
            <select
              className="flex h-10 w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              defaultValue=""
              {...register("category")}
            >
              <option value="" disabled>
                Select a category
              </option>
              <option value="Technique">Technique</option>
              <option value="Nutrition">Nutrition</option>
              <option value="Studios">Studios</option>
              <option value="Gear">Gear</option>
              <option value="Challenges">Challenges</option>
            </select>
            {errors.category && <p className="text-xs text-destructive -mt-1">{errors.category.message}</p>}
            <textarea
              className="flex min-h-[100px] w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              placeholder="What's on your mind?"
              {...register("body")}
            />
            {errors.body && <p className="text-xs text-destructive -mt-1">{errors.body.message}</p>}
            <Button
              onClick={handleSubmit(onPostDiscussion)}
              className="w-full bg-primary hover:bg-primary/85 text-white font-bold"
            >
              Post to Community
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
