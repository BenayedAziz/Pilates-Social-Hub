import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, Flame, Trophy } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { LeaderboardRow } from "@/components/LeaderboardRow";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/context/AppContext";
import { POSTS as FALLBACK_POSTS, LEADERBOARD } from "@/data/mock-data";
import { useFeed } from "@/hooks/use-api";
import CirclesPage from "@/pages/CirclesPage";
import CommunityPage from "@/pages/CommunityPage";

const FEED_PHOTOS = [
  "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&h=300&fit=crop",
  "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=500&h=300&fit=crop",
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=300&fit=crop",
  "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=500&h=300&fit=crop",
  "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&h=300&fit=crop",
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
  const { data: apiPosts } = useFeed();
  const posts = apiPosts || FALLBACK_POSTS;
  const [kudosAnimation, setKudosAnimation] = useState<number | null>(null);

  const handleKudos = (postId: number) => {
    toggleLike(postId);
    if (!likedPosts[postId]) {
      setKudosAnimation(postId);
      setTimeout(() => setKudosAnimation(null), 1000);
    }
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
    toast.success(`Session logged! ${data.type} at ${data.studio} — ${data.duration}min, ${data.calories} cal`);
    reset();
  };

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
          {/* Share bar */}
          <div className="px-4 py-3 bg-card">
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="w-full flex items-center gap-3 bg-muted/60 rounded-2xl px-4 py-3.5 text-left hover:bg-muted transition-colors border border-border/30"
                >
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                    SJ
                  </div>
                  <span className="text-sm text-muted-foreground font-medium">Share your session today...</span>
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
                    Share Session
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="p-5 flex flex-col gap-6 md:max-w-xl md:mx-auto">
            {posts.map((post, idx) => (
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
                      completed <span className="font-semibold text-foreground/80">{post.type}</span> at {post.studio}
                    </p>
                  </div>
                </CardHeader>

                {post.hasPhoto && (
                  <div className="h-44 mx-5 rounded-xl mb-3 overflow-hidden">
                    <img
                      src={FEED_PHOTOS[idx % FEED_PHOTOS.length]}
                      alt={`${post.user.name}'s ${post.type} session`}
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
                    <span className="text-xs">🤸💪🔥</span>
                    <span className="text-xs text-muted-foreground font-medium">
                      {post.likes + (likedPosts[post.id] ? 1 : 0)} kudos
                    </span>
                  </div>
                )}

                {kudosAnimation === post.id && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl animate-bounce pointer-events-none z-10">
                    🤸
                  </div>
                )}

                <CardFooter className="px-5 py-3 border-t border-border/30 flex justify-between">
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => handleKudos(post.id)}
                      aria-label={likedPosts[post.id] ? "Remove kudos" : "Give kudos"}
                      className={`flex items-center gap-1.5 text-sm font-semibold transition-all ${
                        likedPosts[post.id] ? "text-primary" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className={`text-base transition-transform ${likedPosts[post.id] ? "scale-110" : ""}`}>
                        {likedPosts[post.id] ? "🤸" : "🤸"}
                      </span>
                      <span>{post.likes + (likedPosts[post.id] ? 1 : 0)}</span>
                      {likedPosts[post.id] && <span className="text-xs font-semibold text-primary/70">Good Form!</span>}
                    </button>
                    <button
                      type="button"
                      aria-label="View comments"
                      className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
                    >
                      <span className="text-base">💬</span> {post.comments}
                    </button>
                  </div>
                  <button
                    type="button"
                    aria-label="Share post"
                    className="text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                  >
                    <span className="text-base">↗️</span>
                  </button>
                </CardFooter>
              </Card>
            ))}

            {/* Leaderboard widget */}
            <Card className="border-none shadow-sm bg-card rounded-2xl card-warm">
              <CardHeader className="p-5 pb-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-accent-cta" /> This Week's Leaders
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-2 flex flex-col gap-3">
                {LEADERBOARD.map((entry) => (
                  <LeaderboardRow key={entry.rank} entry={entry} />
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="forum" className="mt-0">
          <CommunityPage />
        </TabsContent>

        <TabsContent value="circles" className="mt-0">
          <CirclesPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
