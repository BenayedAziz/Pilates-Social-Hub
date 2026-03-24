import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Edit3,
  Eye,
  MapPin,
  MessageCircle,
  Plus,
  Settings,
  Star,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ScheduleManager } from "@/components/ScheduleManager";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const ADMIN_STUDIO = {
  name: "Studio Harmonie",
  neighborhood: "Marais",
  address: "12 Rue de Rivoli, 75004 Paris",
  description:
    "A serene reformer studio in the heart of Le Marais. We blend classical Pilates with modern training techniques in a warm, welcoming space designed for all levels.",
  rating: 4.9,
  reviews: 234,
  coaches: ["Sophie Leclerc", "Julien Moreau", "Camille Dubois"],
  verified: true,
};

const MOCK_ANALYTICS = {
  viewsThisMonth: 1247,
  viewsLastMonth: 1089,
  bookingsThisMonth: 89,
  bookingsLastMonth: 72,
  checkInsThisMonth: 156,
  checkInsLastMonth: 134,
  revenueThisMonth: 4005,
  revenueLastMonth: 3240,
  topClass: "Reformer Advanced",
  averageRating: 4.9,
  newReviews: 12,
};

const UPCOMING_BOOKINGS = [
  { id: 1, client: "Emma D.", class: "Reformer Flow", date: "Mar 24", time: "09:00", status: "confirmed" as const },
  { id: 2, client: "Lucas M.", class: "Mat Pilates", date: "Mar 24", time: "11:30", status: "confirmed" as const },
  { id: 3, client: "Sophie B.", class: "Cadillac Intro", date: "Mar 24", time: "14:00", status: "pending" as const },
  { id: 4, client: "Alex R.", class: "Reformer Advanced", date: "Mar 25", time: "09:00", status: "confirmed" as const },
  { id: 5, client: "Marie C.", class: "Reformer Flow", date: "Mar 25", time: "17:00", status: "confirmed" as const },
  { id: 6, client: "Thomas L.", class: "Mat Pilates", date: "Mar 26", time: "09:00", status: "pending" as const },
];

const RECENT_REVIEWS = [
  {
    id: 1,
    user: "Emma D.",
    rating: 5,
    text: "Absolutely love this studio! The instructors are top-notch and the reformer equipment is pristine.",
    date: "2 days ago",
    replied: false,
  },
  {
    id: 2,
    user: "Lucas M.",
    rating: 4,
    text: "Great equipment and atmosphere. A bit pricey but worth it for the quality of instruction.",
    date: "5 days ago",
    replied: true,
  },
  {
    id: 3,
    user: "Sophie B.",
    rating: 5,
    text: "Best reformer studio in Paris. Period. Sophie Leclerc is an incredible coach.",
    date: "1 week ago",
    replied: false,
  },
  {
    id: 4,
    user: "Pierre G.",
    rating: 5,
    text: "Warm and inviting space. The Cadillac intro class was exactly what I needed as a beginner.",
    date: "2 weeks ago",
    replied: true,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pctChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 100);
}

function StatCard({
  label,
  value,
  previousValue,
  prefix,
  icon: Icon,
}: {
  label: string;
  value: number;
  previousValue: number;
  prefix?: string;
  icon: React.ElementType;
}) {
  const change = pctChange(value, previousValue);
  const isPositive = change >= 0;

  return (
    <Card className="border-border/40 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <div
            className={`flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${
              isPositive
                ? "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-400/10"
                : "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-400/10"
            }`}
          >
            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(change)}%
          </div>
        </div>
        <p className="text-2xl font-bold text-foreground tracking-tight">
          {prefix}
          {value.toLocaleString()}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function StudioAdminPage() {
  const [bookings, setBookings] = useState(UPCOMING_BOOKINGS);
  const [reviews, setReviews] = useState(RECENT_REVIEWS);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  // Settings form state
  const [studioName, setStudioName] = useState(ADMIN_STUDIO.name);
  const [studioDescription, setStudioDescription] = useState(ADMIN_STUDIO.description);
  const [studioAddress, setStudioAddress] = useState(ADMIN_STUDIO.address);
  const [coaches, setCoaches] = useState(ADMIN_STUDIO.coaches);
  const [newCoach, setNewCoach] = useState("");

  // Booking actions
  const handleConfirmBooking = (id: number) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "confirmed" as const } : b)));
    toast.success("Booking confirmed!");
  };

  const handleCancelBooking = (id: number) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
    toast("Booking cancelled.", { icon: <X className="w-4 h-4" /> });
  };

  // Review reply
  const handleReply = (id: number) => {
    if (!replyText.trim()) return;
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, replied: true } : r)));
    setReplyingTo(null);
    setReplyText("");
    toast.success("Reply posted!");
  };

  // Settings actions
  const handleSaveSettings = () => {
    toast.success("Studio details saved!");
  };

  const handleAddCoach = () => {
    const name = newCoach.trim();
    if (!name) return;
    if (coaches.includes(name)) {
      toast.error("Coach already exists.");
      return;
    }
    setCoaches((prev) => [...prev, name]);
    setNewCoach("");
    toast.success(`${name} added to the team!`);
  };

  const handleRemoveCoach = (name: string) => {
    setCoaches((prev) => prev.filter((c) => c !== name));
    toast(`${name} removed.`, { icon: <Trash2 className="w-4 h-4" /> });
  };

  // Derived
  const pendingCount = bookings.filter((b) => b.status === "pending").length;

  return (
    <div className="bg-background min-h-full animate-in fade-in duration-300">
      {/* ---------- Studio Header ---------- */}
      <div
        className="relative px-5 py-6 border-b border-border/40 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, hsl(38 42% 97%) 0%, hsl(33 25% 93%) 50%, hsl(28 20% 91%) 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle at 80% 20%, hsl(28 22% 38%) 0%, transparent 50%)",
          }}
        />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">{ADMIN_STUDIO.name}</h1>
                {ADMIN_STUDIO.verified && (
                  <Badge className="bg-primary/10 text-primary border-none text-[10px] font-semibold gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Verified
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {ADMIN_STUDIO.address}
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs font-bold bg-card/80 backdrop-blur-sm"
              onClick={() => toast("Edit mode coming soon!")}
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Profile
            </Button>
          </div>
          <div className="flex gap-5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-[hsl(var(--accent-cta))] text-[hsl(var(--accent-cta))]" />
              <span className="font-semibold text-foreground">{ADMIN_STUDIO.rating}</span> ({ADMIN_STUDIO.reviews}{" "}
              reviews)
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> {ADMIN_STUDIO.coaches.length} coaches
            </span>
          </div>
        </div>
      </div>

      {/* ---------- Content ---------- */}
      <div className="p-5">
        {/* Analytics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard
            label="Profile Views"
            value={MOCK_ANALYTICS.viewsThisMonth}
            previousValue={MOCK_ANALYTICS.viewsLastMonth}
            icon={Eye}
          />
          <StatCard
            label="Bookings"
            value={MOCK_ANALYTICS.bookingsThisMonth}
            previousValue={MOCK_ANALYTICS.bookingsLastMonth}
            icon={Calendar}
          />
          <StatCard
            label="Check-ins"
            value={MOCK_ANALYTICS.checkInsThisMonth}
            previousValue={MOCK_ANALYTICS.checkInsLastMonth}
            icon={UserCheck}
          />
          <StatCard
            label="Revenue"
            value={MOCK_ANALYTICS.revenueThisMonth}
            previousValue={MOCK_ANALYTICS.revenueLastMonth}
            prefix="€"
            icon={TrendingUp}
          />
        </div>

        {/* Quick insights bar */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Badge variant="outline" className="text-[11px] font-medium gap-1 py-1 px-2.5 border-border/60">
            <BarChart3 className="w-3 h-3 text-primary" /> Top class: {MOCK_ANALYTICS.topClass}
          </Badge>
          <Badge variant="outline" className="text-[11px] font-medium gap-1 py-1 px-2.5 border-border/60">
            <Star className="w-3 h-3 fill-[hsl(var(--accent-cta))] text-[hsl(var(--accent-cta))]" /> Avg rating:{" "}
            {MOCK_ANALYTICS.averageRating}
          </Badge>
          <Badge variant="outline" className="text-[11px] font-medium gap-1 py-1 px-2.5 border-border/60">
            <MessageCircle className="w-3 h-3 text-primary" /> {MOCK_ANALYTICS.newReviews} new reviews
          </Badge>
          {pendingCount > 0 && (
            <Badge className="text-[11px] font-semibold gap-1 py-1 px-2.5 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-400/10 dark:text-amber-400 dark:border-amber-400/20">
              <Clock className="w-3 h-3" /> {pendingCount} pending
            </Badge>
          )}
        </div>

        {/* ---------- Tabs ---------- */}
        <Tabs defaultValue="bookings" className="w-full">
          <TabsList className="w-full grid grid-cols-4 mb-4">
            <TabsTrigger value="bookings" className="text-xs font-semibold gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Bookings
            </TabsTrigger>
            <TabsTrigger value="schedule" className="text-xs font-semibold gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Schedule
            </TabsTrigger>
            <TabsTrigger value="reviews" className="text-xs font-semibold gap-1.5">
              <Star className="w-3.5 h-3.5" /> Reviews
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs font-semibold gap-1.5">
              <Settings className="w-3.5 h-3.5" /> Settings
            </TabsTrigger>
          </TabsList>

          {/* -------- Bookings Tab -------- */}
          <TabsContent value="bookings">
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" /> Upcoming Bookings
                  <Badge variant="outline" className="ml-auto text-[10px] font-semibold">
                    {bookings.length} total
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {bookings.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <Calendar className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No upcoming bookings.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/40">
                    {bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors"
                      >
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center text-xs font-bold text-primary">
                          {booking.client[0]}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground truncate">{booking.client}</span>
                            <Badge
                              className={`text-[9px] font-semibold border-none px-1.5 py-0 ${
                                booking.status === "confirmed"
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400"
                                  : "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-400"
                              }`}
                            >
                              {booking.status}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {booking.class} &middot; {booking.date} at {booking.time}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1.5 flex-shrink-0">
                          {booking.status === "pending" && (
                            <Button
                              type="button"
                              size="sm"
                              className="h-7 text-[11px] font-bold bg-primary hover:bg-primary/90 text-primary-foreground px-2.5"
                              onClick={() => handleConfirmBooking(booking.id)}
                            >
                              Confirm
                            </Button>
                          )}
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-7 text-[11px] font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/8 px-2"
                            onClick={() => handleCancelBooking(booking.id)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* -------- Schedule Tab -------- */}
          <TabsContent value="schedule">
            <ScheduleManager />
          </TabsContent>

          {/* -------- Reviews Tab -------- */}
          <TabsContent value="reviews">
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Star className="w-4 h-4 fill-[hsl(var(--accent-cta))] text-[hsl(var(--accent-cta))]" /> Recent
                  Reviews
                  <Badge variant="outline" className="ml-auto text-[10px] font-semibold">
                    {MOCK_ANALYTICS.averageRating} avg
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/40">
                  {reviews.map((review) => (
                    <div key={review.id} className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0 flex items-center justify-center text-xs font-bold text-muted-foreground">
                          {review.user[0]}
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Header */}
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-foreground">{review.user}</span>
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < review.rating
                                      ? "fill-[hsl(var(--accent-cta))] text-[hsl(var(--accent-cta))]"
                                      : "text-muted-foreground/20"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-[10px] text-muted-foreground ml-auto flex-shrink-0">
                              {review.date}
                            </span>
                          </div>

                          {/* Body */}
                          <p className="text-sm text-foreground/80 leading-relaxed mb-2">{review.text}</p>

                          {/* Reply / Replied status */}
                          {review.replied ? (
                            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                              <CheckCircle2 className="w-3 h-3" /> Replied
                            </div>
                          ) : replyingTo === review.id ? (
                            <div className="flex gap-2 mt-1">
                              <Input
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Write a reply..."
                                className="h-8 text-xs flex-1"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleReply(review.id);
                                }}
                              />
                              <Button
                                type="button"
                                size="sm"
                                className="h-8 text-[11px] font-bold bg-primary hover:bg-primary/90 text-primary-foreground px-3"
                                onClick={() => handleReply(review.id)}
                              >
                                Send
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="h-8 text-[11px] px-2"
                                onClick={() => {
                                  setReplyingTo(null);
                                  setReplyText("");
                                }}
                              >
                                <X className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-7 text-[11px] font-medium text-muted-foreground hover:text-primary gap-1 px-2 -ml-2"
                              onClick={() => {
                                setReplyingTo(review.id);
                                setReplyText("");
                              }}
                            >
                              <MessageCircle className="w-3 h-3" /> Reply
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* -------- Settings Tab -------- */}
          <TabsContent value="settings">
            <div className="flex flex-col gap-4">
              {/* Studio Details */}
              <Card className="border-border/40 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-primary" /> Studio Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label htmlFor="admin-studio-name" className="text-xs font-semibold text-foreground mb-1.5 block">
                      Studio Name
                    </label>
                    <Input
                      id="admin-studio-name"
                      value={studioName}
                      onChange={(e) => setStudioName(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="admin-studio-description"
                      className="text-xs font-semibold text-foreground mb-1.5 block"
                    >
                      Description
                    </label>
                    <textarea
                      id="admin-studio-description"
                      value={studioDescription}
                      onChange={(e) => setStudioDescription(e.target.value)}
                      rows={3}
                      className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="admin-studio-neighborhood"
                        className="text-xs font-semibold text-foreground mb-1.5 block"
                      >
                        Neighborhood
                      </label>
                      <Input
                        id="admin-studio-neighborhood"
                        value={ADMIN_STUDIO.neighborhood}
                        disabled
                        className="text-sm bg-muted/50"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="admin-studio-address"
                      className="text-xs font-semibold text-foreground mb-1.5 block"
                    >
                      Address
                    </label>
                    <Input
                      id="admin-studio-address"
                      value={studioAddress}
                      onChange={(e) => setStudioAddress(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <Button
                    type="button"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm"
                    onClick={handleSaveSettings}
                  >
                    Save Changes
                  </Button>
                </CardContent>
              </Card>

              {/* Manage Coaches */}
              <Card className="border-border/40 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" /> Coaches
                    <Badge variant="outline" className="ml-auto text-[10px] font-semibold">
                      {coaches.length} active
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {coaches.map((coach) => (
                      <div
                        key={coach}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/40 group hover:bg-muted/60 transition-colors"
                      >
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                          {coach
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <span className="text-sm font-medium text-foreground flex-1">{coach}</span>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveCoach(coach)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newCoach}
                      onChange={(e) => setNewCoach(e.target.value)}
                      placeholder="Add a new coach..."
                      className="text-sm flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddCoach();
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="gap-1 text-xs font-bold h-9"
                      onClick={handleAddCoach}
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Class Schedule — now managed via the Schedule tab */}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
