import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { LeaderboardEntry } from "@/data/mock-data";

export function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors">
      <span
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
        ${entry.rank === 1 ? "bg-accent-cta text-white" : entry.rank === 2 ? "bg-muted-foreground/20 text-foreground" : entry.rank === 3 ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}
      >
        {entry.rank}
      </span>
      <Avatar className={`w-8 h-8 ${entry.user.color}`}>
        <AvatarFallback className="text-foreground font-bold text-xs">{entry.user.initials}</AvatarFallback>
      </Avatar>
      <span className="flex-1 text-sm font-semibold text-foreground">{entry.user.name}</span>
      <div className="text-right">
        <p className="text-xs font-bold text-accent-cta">{entry.calories.toLocaleString()} cal</p>
        <p className="text-[10px] text-muted-foreground/60">{entry.sessions} sessions</p>
      </div>
    </div>
  );
}
