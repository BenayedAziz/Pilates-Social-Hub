import { Flame, Target, Trophy, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/context/AppContext";

export function WeeklyRecap() {
  const { weeklyGoal, weeklyCompleted, currentStreak, totalCalories } = useApp();
  const progress = Math.min((weeklyCompleted / weeklyGoal) * 100, 100);
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <Card className="border-none shadow-sm overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" /> Weekly Recap
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="flex items-center gap-5">
          {/* Circular progress */}
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96" aria-hidden="true">
              <circle cx="48" cy="48" r="40" fill="none" stroke="hsl(var(--secondary))" strokeWidth="6" />
              <circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-foreground">{weeklyCompleted}</span>
              <span className="text-[9px] font-semibold text-muted-foreground/60">of {weeklyGoal}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Flame className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{currentStreak}</p>
                <p className="text-[9px] text-muted-foreground/60 font-semibold">Day Streak</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent-cta/10 flex items-center justify-center">
                <Target className="w-4 h-4 text-accent-cta" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{Math.round(totalCalories / 1000)}k</p>
                <p className="text-[9px] text-muted-foreground/60 font-semibold">Total Cal</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-primary/70" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">
                  {weeklyCompleted >= weeklyGoal ? "Done!" : `${weeklyGoal - weeklyCompleted} left`}
                </p>
                <p className="text-[9px] text-muted-foreground/60 font-semibold">Weekly Goal</p>
              </div>
            </div>
          </div>
        </div>

        {/* Streak fire animation when streak > 7 */}
        {currentStreak >= 7 && (
          <div className="mt-3 bg-accent-cta/8 rounded-xl px-3 py-2 flex items-center gap-2">
            <span className="text-lg">🔥</span>
            <p className="text-xs font-semibold text-accent-cta">
              {currentStreak} day streak! Your longest is {Math.max(currentStreak, 18)} days.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
