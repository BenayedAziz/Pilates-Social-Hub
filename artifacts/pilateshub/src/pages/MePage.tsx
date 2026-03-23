import { CheckCircle2, Clock, Settings, Trophy, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Link } from "wouter";
import { JourneyMap } from "@/components/JourneyMap";
import { NotificationSettings } from "@/components/NotificationSettings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WearableDashboard } from "@/components/WearableDashboard";
import { WeeklyRecap } from "@/components/WeeklyRecap";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useBadges, useChallenges } from "@/hooks/use-api";
import { GenericPageSkeleton } from "@/components/PageSkeleton";

export default function MePage() {
  const { user, logout } = useAuth();
  const { currentStreak, totalSessions, totalCalories } = useApp();
  const { t } = useTranslation();
  const { data: BADGES = [], isLoading: badgesLoading } = useBadges();
  const { data: CHALLENGES = [] } = useChallenges();

  if (badgesLoading) return <GenericPageSkeleton />;

  return (
    <div className="bg-background min-h-full animate-in fade-in duration-300">
      {/* Profile Header -- warm, personal, like a journal cover */}
      <div
        className="relative px-5 pt-7 pb-6 flex items-center gap-4 overflow-hidden"
        style={{ background: "linear-gradient(135deg, hsl(38 42% 97%) 0%, hsl(33 25% 93%) 50%, hsl(28 20% 91%) 100%)" }}
      >
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle at 80% 20%, hsl(28 22% 38%) 0%, transparent 50%)" }}
        />
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center text-xl font-bold shadow-lg border-3 border-card glow-warm relative z-10">
          {user?.initials || "?"}
        </div>
        <div className="flex-1 relative z-10">
          <h1 className="text-lg font-bold text-foreground">{user?.name || "Sarah Johnson"}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Advanced Level &middot; Paris</p>
        </div>
        <Link href="/me/settings">
          <button
            type="button"
            aria-label="Settings"
            className="p-2 text-muted-foreground hover:text-primary transition-colors relative z-10"
          >
            <Settings className="w-5 h-5" />
          </button>
        </Link>
      </div>

      <div className="p-5 flex flex-col gap-6">
        {/* Weekly Recap */}
        <WeeklyRecap />

        {/* Wearable Health Metrics */}
        <WearableDashboard />

        {/* Quick Stats Row -- warm gradient cards */}
        <div className="grid grid-cols-3 gap-3">
          <div
            className="rounded-2xl p-4 text-center text-primary-foreground shadow-sm"
            style={{ background: "linear-gradient(135deg, hsl(28 22% 38%) 0%, hsl(28 20% 48%) 100%)" }}
          >
            <div className="text-2xl font-bold">{totalSessions}</div>
            <div className="text-[10px] uppercase tracking-wider opacity-75 font-semibold mt-1">{t("me.sessions")}</div>
          </div>
          <div
            className="rounded-2xl p-4 text-center text-white shadow-sm"
            style={{ background: "linear-gradient(135deg, hsl(16 50% 52%) 0%, hsl(16 45% 62%) 100%)" }}
          >
            <div className="text-2xl font-bold">{(totalCalories / 1000).toFixed(1)}k</div>
            <div className="text-[10px] uppercase tracking-wider opacity-75 font-semibold mt-1">{t("me.calories")}</div>
          </div>
          <div
            className="rounded-2xl p-4 text-center text-white shadow-sm"
            style={{ background: "linear-gradient(135deg, hsl(42 28% 42%) 0%, hsl(42 28% 55%) 100%)" }}
          >
            <div className="text-2xl font-bold">{currentStreak}</div>
            <div className="text-[10px] uppercase tracking-wider opacity-75 font-semibold mt-1">{t("me.dayStreak")}</div>
          </div>
        </div>

        {/* Apparatus Journey */}
        <JourneyMap />

        {/* Active Challenge Preview */}
        <Card className="border-none shadow-sm">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" /> {t("me.currentChallenges")}
            </CardTitle>
            <Link href="/challenges">
              <span className="text-primary text-xs font-bold uppercase tracking-wider cursor-pointer hover:underline">
                {t("me.viewAll")}
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

        {/* Badges horizontal scroll */}
        <Card className="border-none shadow-sm">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-foreground">{t("me.badges")}</CardTitle>
            <span className="text-primary text-xs font-bold uppercase tracking-wider">
              {BADGES.filter((b) => b.earned).length}/{BADGES.length} {t("me.earned")}
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
              {BADGES.map((badge) => (
                <div key={badge.id} className="flex flex-col items-center text-center gap-2 flex-shrink-0">
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
                    className={`text-[10px] font-bold leading-tight w-16 ${badge.earned ? "text-foreground" : "text-muted-foreground/60"}`}
                  >
                    {badge.name}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Sessions */}
        <Card className="border-none shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold text-foreground">{t("me.upcomingSessions")}</CardTitle>
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

        {/* Booking History */}
        <Card className="border-none shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold text-foreground">{t("me.bookings")}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2 flex flex-col gap-3">
            {/* Upcoming bookings */}
            {[
              {
                type: "Advanced Cadillac",
                studio: "Core & Flow",
                area: "Montmartre",
                date: "Oct 24",
                time: "09:00",
              },
              {
                type: "Reformer Flow",
                studio: "Studio Harmonie",
                area: "Marais",
                date: "Oct 26",
                time: "17:00",
              },
              {
                type: "Mat Pilates",
                studio: "Pilates Lumiere",
                area: "Saint-Germain",
                date: "Oct 29",
                time: "11:30",
              },
            ].map((booking, i) => (
              <div
                key={i}
                className="bg-card p-4 rounded-xl shadow-sm border-l-4 border-l-primary border-y border-r border-border/40"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <Badge className="mb-2 text-primary border-primary/30 bg-primary/5 font-bold text-xs border">
                      {t("me.upcoming")}
                    </Badge>
                    <h4 className="font-bold text-sm text-foreground">{booking.type}</h4>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">
                      {booking.studio} &middot; {booking.area}
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2 text-center min-w-[52px]">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase">{booking.date.split(" ")[0]}</p>
                    <p className="text-lg font-bold text-foreground">{booking.date.split(" ")[1]}</p>
                    <p className="text-[9px] text-muted-foreground/60">{booking.time}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 font-bold h-8 text-xs"
                    onClick={() => toast.info("Reschedule request sent.")}
                  >
                    {t("me.reschedule")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-rose-500 hover:text-rose-600 font-bold h-8 text-xs border-border"
                    onClick={() => toast.warning("Booking cancelled.")}
                  >
                    {t("me.cancel")}
                  </Button>
                </div>
              </div>
            ))}

            {/* Past sessions */}
            <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-wider mt-2 px-1">
              {t("me.pastSessions")}
            </p>
            {[
              { type: "Reformer Advanced", studio: "Studio Harmonie", date: "Oct 12", time: "17:00" },
              { type: "Mat Pilates Core", studio: "Core & Flow", date: "Oct 8", time: "11:30" },
            ].map((booking, i) => (
              <div
                key={i}
                className="bg-card p-4 rounded-xl shadow-sm border border-border/40 flex items-center gap-3 opacity-60"
              >
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-bold text-sm text-foreground">{booking.type}</p>
                  <p className="text-xs text-muted-foreground/60 font-medium">
                    {booking.studio} &middot; {booking.date} &middot; {booking.time}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <NotificationSettings />

        {/* Log Out */}
        <button
          type="button"
          onClick={() => {
            logout();
            toast.info("Logged out.");
          }}
          className="w-full py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
        >
          {t("me.logOut")}
        </button>

        <p className="text-center text-[10px] text-muted-foreground/40 font-medium pb-4">PilatesHub v1.0.0</p>
      </div>
    </div>
  );
}
