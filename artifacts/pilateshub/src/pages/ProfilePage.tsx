import { Activity, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { BADGES } from "@/data/mock-data";

export default function ProfilePage() {
  const { logout } = useAuth();
  return (
    <div className="bg-background min-h-full animate-in fade-in duration-300 pb-10">
      {/* Profile header */}
      <div className="bg-card px-6 py-8 flex flex-col items-center border-b border-border/40 relative">
        <button
          type="button"
          aria-label="Edit profile"
          onClick={() => toast.info("Edit profile coming soon!")}
          className="absolute top-4 right-4 text-xs font-bold text-primary bg-primary/10 px-4 py-2 rounded-full hover:bg-primary/20 transition-colors"
        >
          Edit Profile
        </button>
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/70 text-white flex items-center justify-center text-3xl font-bold shadow-lg border-4 border-white mb-4">
          SJ
        </div>
        <h2 className="text-2xl font-bold text-foreground">Sarah Johnson</h2>
        <Badge className="mt-2 bg-secondary text-primary font-bold px-3 py-1 border-none">Advanced Level</Badge>
        <p className="text-center text-sm text-muted-foreground mt-3 max-w-xs leading-relaxed">
          Pilates enthusiast since 2019 &middot; Paris, France &middot; Reformer addict
        </p>

        <div className="flex gap-8 mt-6 w-full justify-center border-t border-border/40 pt-5">
          {[
            { value: "47", label: "Sessions" },
            { value: "23", label: "Followers" },
            { value: "31", label: "Following" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-xl font-bold text-foreground">{stat.value}</div>
              <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/60 mt-0.5">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="p-4">
        <Tabs defaultValue="activity">
          <TabsList className="w-full grid grid-cols-3 bg-muted p-1 rounded-xl h-10">
            <TabsTrigger
              value="activity"
              className="rounded-lg data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm font-bold text-xs"
            >
              Activity
            </TabsTrigger>
            <TabsTrigger
              value="badges"
              className="rounded-lg data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm font-bold text-xs"
            >
              Badges
            </TabsTrigger>
            <TabsTrigger
              value="bookings"
              className="rounded-lg data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm font-bold text-xs"
            >
              Bookings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="mt-4 flex flex-col gap-3">
            {[
              { type: "Reformer Flow", studio: "Studio Harmonie", date: "Oct 12", cal: 320, min: 55 },
              { type: "Cadillac Intro", studio: "Pilates Lumiere", date: "Oct 10", cal: 290, min: 60 },
              { type: "Mat Pilates Core", studio: "Core & Flow", date: "Oct 8", cal: 250, min: 45 },
              { type: "Reformer Advanced", studio: "Studio Harmonie", date: "Oct 6", cal: 340, min: 55 },
              { type: "Tower & Reformer", studio: "BodyWork Pilates", date: "Oct 3", cal: 410, min: 75 },
            ].map((session, i) => (
              <div key={i} className="bg-card p-4 rounded-xl shadow-sm border border-border/40 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-foreground truncate">{session.type}</h4>
                  <p className="text-xs text-muted-foreground/60 font-medium mt-0.5">
                    {session.date} &middot; {session.studio}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-bold text-accent-cta text-sm">{session.cal} cal</div>
                  <div className="text-xs text-muted-foreground/60 font-medium">{session.min} min</div>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="badges" className="mt-4 grid grid-cols-2 gap-3">
            {BADGES.map((badge) => (
              <div
                key={badge.id}
                className="bg-card p-4 rounded-xl shadow-sm border border-border/40 flex flex-col items-center text-center gap-2"
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center
                  ${
                    badge.earned
                      ? "bg-gradient-to-br from-secondary to-secondary/80 text-primary"
                      : "bg-muted text-muted-foreground/40 opacity-60"
                  }`}
                >
                  {badge.icon}
                </div>
                <div>
                  <h4 className={`font-bold text-sm ${badge.earned ? "text-foreground" : "text-muted-foreground/60"}`}>
                    {badge.name}
                  </h4>
                  <p className="text-[10px] text-muted-foreground/60 font-medium mt-0.5">
                    {badge.earned ? "Earned \u2713" : badge.description}
                  </p>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="bookings" className="mt-4 flex flex-col gap-3">
            {/* Upcoming */}
            {[
              {
                type: "Advanced Cadillac",
                studio: "Core & Flow",
                area: "Montmartre",
                date: "Oct 24",
                time: "09:00",
                status: "upcoming",
              },
              {
                type: "Reformer Flow",
                studio: "Studio Harmonie",
                area: "Marais",
                date: "Oct 26",
                time: "17:00",
                status: "upcoming",
              },
              {
                type: "Mat Pilates",
                studio: "Pilates Lumiere",
                area: "Saint-Germain",
                date: "Oct 29",
                time: "11:30",
                status: "upcoming",
              },
            ].map((booking, i) => (
              <div
                key={i}
                className="bg-card p-4 rounded-xl shadow-sm border-l-4 border-l-primary border-y border-r border-border/40"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <Badge className="mb-2 text-primary border-primary/30 bg-primary/5 font-bold text-xs border">
                      Upcoming
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
                    Reschedule
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-rose-500 hover:text-rose-600 font-bold h-8 text-xs border-border"
                    onClick={() => toast.warning("Booking cancelled.")}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ))}

            {/* Past */}
            <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-wider mt-2 px-1">
              Past Sessions
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
          </TabsContent>
        </Tabs>
      </div>

      <div className="px-4 mt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            logout();
            toast.info("Logged out.");
          }}
          className="w-full text-destructive hover:text-destructive hover:bg-destructive/8 font-bold"
        >
          Log Out
        </Button>
      </div>
    </div>
  );
}
