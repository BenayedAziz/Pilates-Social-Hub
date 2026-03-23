import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CIRCLES, type PilatesCircle } from "@/data/mock-data";

export default function CirclesPage() {
  const [circles, setCircles] = useState(CIRCLES);

  const toggleJoin = (id: number) => {
    setCircles((prev) => prev.map((c) => (c.id === id ? { ...c, isJoined: !c.isJoined } : c)));
    const circle = circles.find((c) => c.id === id);
    if (circle?.isJoined) {
      toast.info(`Left ${circle.name}`);
    } else {
      toast.success(`Joined ${circle?.name}!`);
    }
  };

  const myCircles = circles.filter((c) => c.isJoined);
  const discoverCircles = circles.filter((c) => !c.isJoined);

  return (
    <div className="bg-background min-h-full animate-in fade-in duration-300 p-5">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-foreground">Pilates Circles</h1>
        <Button type="button" size="sm" className="bg-primary hover:bg-primary/85 text-white font-bold text-xs gap-1">
          <Plus className="w-3.5 h-3.5" /> Create
        </Button>
      </div>

      {/* My Circles */}
      {myCircles.length > 0 && (
        <>
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">My Circles</h2>
          <div className="flex flex-col gap-4 mb-6">
            {myCircles.map((circle) => (
              <CircleCard key={circle.id} circle={circle} onToggleJoin={toggleJoin} />
            ))}
          </div>
        </>
      )}

      {/* Discover */}
      <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Discover</h2>
      <div className="flex flex-col gap-4">
        {discoverCircles.map((circle) => (
          <CircleCard key={circle.id} circle={circle} onToggleJoin={toggleJoin} />
        ))}
      </div>
    </div>
  );
}

function CircleCard({ circle, onToggleJoin }: { circle: PilatesCircle; onToggleJoin: (id: number) => void }) {
  return (
    <Card className="border-none shadow-sm bg-card rounded-2xl">
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl flex-shrink-0">
            {circle.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold text-sm text-foreground truncate">{circle.name}</h3>
              <button
                type="button"
                onClick={() => onToggleJoin(circle.id)}
                className={`text-xs font-bold px-3 py-1 rounded-full transition-colors border ${
                  circle.isJoined
                    ? "bg-muted text-muted-foreground border-border"
                    : "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                }`}
              >
                {circle.isJoined ? "Joined" : "Join"}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{circle.description}</p>

            {/* Members avatars */}
            <div className="flex items-center mt-2.5 gap-2">
              <div className="flex -space-x-2">
                {circle.members.slice(0, 4).map((member) => (
                  <Avatar key={member.id} className={`w-6 h-6 border-2 border-white ${member.color}`}>
                    <AvatarFallback className="text-[8px] font-bold text-foreground">{member.initials}</AvatarFallback>
                  </Avatar>
                ))}
                {circle.members.length > 4 && (
                  <div className="w-6 h-6 rounded-full bg-border border-2 border-white flex items-center justify-center text-[8px] font-bold text-muted-foreground">
                    +{circle.members.length - 4}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground/60 font-medium">{circle.members.length} members</span>
            </div>

            {/* Stats */}
            <div className="flex gap-4 mt-2">
              <span className="text-[10px] font-bold text-primary">{circle.totalSessions} sessions</span>
              <span className="text-[10px] font-bold text-accent-cta">
                {(circle.totalCalories / 1000).toFixed(1)}k cal
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
