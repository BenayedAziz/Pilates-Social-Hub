import { Activity, Calendar as CalendarIcon, CheckCircle2, Clock, Flame, Trophy, Users } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Link } from "wouter";
import { JourneyMap } from "@/components/JourneyMap";
import { LeaderboardRow } from "@/components/LeaderboardRow";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeeklyRecap } from "@/components/WeeklyRecap";
import { useApp } from "@/context/AppContext";
import { BADGES, CALORIE_DATA, CHALLENGES, LEADERBOARD } from "@/data/mock-data";

export default function DashboardPage() {
  const { currentStreak, totalSessions, totalCalories } = useApp();
  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];
  const completedDays = [true, true, true, true, false, true, false];

  return (
    <div className="p-4 flex flex-col gap-4 animate-in fade-in duration-300">
      {/* Weekly Recap */}
      <WeeklyRecap />

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-primary text-white border-none shadow-md">
          <CardContent className="p-4 flex flex-col items-center text-center gap-1">
            <Trophy className="w-5 h-5 opacity-80 mb-0.5" />
            <div className="text-2xl font-bold">{totalSessions}</div>
            <div className="text-[10px] uppercase tracking-wider opacity-80 font-bold">Sessions</div>
          </CardContent>
        </Card>
        <Card className="bg-accent-cta text-white border-none shadow-md">
          <CardContent className="p-4 flex flex-col items-center text-center gap-1">
            <Flame className="w-5 h-5 opacity-80 mb-0.5" />
            <div className="text-2xl font-bold">{(totalCalories / 1000).toFixed(1)}k</div>
            <div className="text-[10px] uppercase tracking-wider opacity-80 font-bold">Calories</div>
          </CardContent>
        </Card>
        <Card className="bg-primary/70 text-white border-none shadow-md">
          <CardContent className="p-4 flex flex-col items-center text-center gap-1">
            <Activity className="w-5 h-5 opacity-80 mb-0.5" />
            <div className="text-2xl font-bold">{currentStreak}</div>
            <div className="text-[10px] uppercase tracking-wider opacity-80 font-bold">Day Streak</div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly calendar */}
      <Card className="border-none shadow-sm">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
            <CalendarIcon className="w-4 h-4 text-primary" /> This Week
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="flex justify-between">
            {weekDays.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-bold text-muted-foreground/60">{day}</span>
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all
                  ${
                    completedDays[i]
                      ? "bg-primary text-white shadow-sm"
                      : i === 4
                        ? "border-2 border-primary text-primary bg-card"
                        : "bg-muted text-muted-foreground/60"
                  }`}
                >
                  {completedDays[i] ? <CheckCircle2 className="w-4 h-4" /> : day}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Calories chart */}
      <Card className="border-none shadow-sm">
        <CardHeader className="p-4 pb-1">
          <CardTitle className="text-sm font-bold text-foreground">Calories Burned (8 Weeks)</CardTitle>
        </CardHeader>
        <CardContent className="p-4 h-44 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={CALORIE_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="week"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: "rgba(125,155,118,0.08)", radius: 6 }}
                contentStyle={{
                  borderRadius: "10px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="calories" fill="hsl(var(--primary))" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card className="border-none shadow-sm">
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold text-foreground">Badges</CardTitle>
          <span className="text-primary text-xs font-bold uppercase tracking-wider">
            {BADGES.filter((b) => b.earned).length}/{BADGES.length} Earned
          </span>
        </CardHeader>
        <CardContent className="p-4 pt-2 grid grid-cols-3 md:grid-cols-6 gap-4">
          {BADGES.map((badge) => (
            <div key={badge.id} className="flex flex-col items-center text-center gap-2">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-all
                ${
                  badge.earned
                    ? "bg-gradient-to-br from-secondary to-secondary/80 text-primary shadow-primary/10"
                    : "bg-muted text-muted-foreground/40 opacity-60"
                }`}
              >
                {badge.icon}
              </div>
              <span
                className={`text-[10px] font-bold leading-tight ${badge.earned ? "text-foreground" : "text-muted-foreground/60"}`}
              >
                {badge.name}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Apparatus Journey Map */}
      <JourneyMap />

      {/* Current Challenges */}
      <Card className="border-none shadow-sm">
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" /> Current Challenges
          </CardTitle>
          <Link href="/challenges">
            <span className="text-primary text-xs font-bold uppercase tracking-wider cursor-pointer hover:underline">
              View All
            </span>
          </Link>
        </CardHeader>
        <CardContent className="p-4 pt-2 flex flex-col gap-3">
          {CHALLENGES.slice(0, 2).map((challenge) => {
            const pct = Math.min(Math.round((challenge.progress / challenge.target) * 100), 100);
            return (
              <div key={challenge.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg flex-shrink-0">
                  {challenge.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-foreground truncate">{challenge.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{challenge.description}</p>
                  <div className="mt-2">
                    <div className="flex justify-between text-[10px] font-bold mb-1">
                      <span className="text-primary">
                        {challenge.progress}/{challenge.target}
                      </span>
                      <span className="text-muted-foreground/60">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground/60 font-medium">
                    <Users className="w-3 h-3" /> {challenge.participants} participating
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Upcoming sessions */}
      <Card className="border-none shadow-sm">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold text-foreground">Upcoming Sessions</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2 flex flex-col gap-3">
          {[
            { date: "Oct 24", studio: "Core & Flow", type: "Advanced Cadillac", time: "09:00" },
            { date: "Oct 26", studio: "Studio Harmonie", type: "Reformer Flow", time: "17:00" },
            { date: "Oct 29", studio: "Pilates Lumiere", type: "Mat Pilates", time: "11:30" },
          ].map((session, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
              <div className="bg-primary/10 rounded-lg p-2 text-center min-w-[44px]">
                <p className="text-[9px] font-bold text-primary uppercase">{session.date.split(" ")[0]}</p>
                <p className="text-base font-bold text-primary">{session.date.split(" ")[1]}</p>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-foreground leading-tight">{session.type}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {session.studio} &middot; {session.time}
                </p>
              </div>
              <Clock className="w-4 h-4 text-muted-foreground/40" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Friends leaderboard */}
      <Card className="border-none shadow-sm">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
            <Trophy className="w-4 h-4 text-accent-cta" /> Friends Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2 flex flex-col gap-2">
          {LEADERBOARD.map((entry) => (
            <LeaderboardRow key={entry.rank} entry={entry} />
          ))}
          <div className="flex items-center gap-3 p-2 rounded-xl bg-primary/8 border border-primary/20 mt-1">
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-primary text-white">
              6
            </span>
            <Avatar className="w-8 h-8 bg-primary/20">
              <AvatarFallback className="text-primary font-bold text-xs">SJ</AvatarFallback>
            </Avatar>
            <span className="flex-1 text-sm font-bold text-primary">You</span>
            <span className="text-xs font-bold text-primary">8 sessions</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
