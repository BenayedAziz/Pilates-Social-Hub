import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  FlaskConical,
  MapPin,
  Phone,
  Shield,
  Sparkles,
  User,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocation, useRoute } from "wouter";
import { GenericPageSkeleton } from "@/components/PageSkeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useClasses, useCreateBooking, useStudios } from "@/hooks/use-api";
import { useBookingPayment } from "@/hooks/use-payments";
import { notify } from "@/lib/notifications";

// ---------------------------------------------------------------------------
// ICS calendar file generator
// ---------------------------------------------------------------------------
function generateIcsFile(params: {
  className: string;
  studioName: string;
  studioAddress: string;
  startDate: Date;
  durationMinutes: number;
  coachName: string | null;
  bookingRef: string;
}): string {
  const { className, studioName, studioAddress, startDate, durationMinutes, coachName, bookingRef } = params;

  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

  // Format date to ICS format: YYYYMMDDTHHMMSSZ
  function toIcsDate(d: Date): string {
    return d
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  }

  const now = new Date();
  const uid = `${bookingRef}-${now.getTime()}@pilateshub.com`;

  const description = [
    `${className} at ${studioName}`,
    coachName ? `Coach: ${coachName}` : null,
    `Duration: ${durationMinutes} minutes`,
    `Booking ref: ${bookingRef}`,
    "",
    "Booked via PiHub - https://pilateshub.com",
  ]
    .filter(Boolean)
    .join("\\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//PiHub//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `DTSTART:${toIcsDate(startDate)}`,
    `DTEND:${toIcsDate(endDate)}`,
    `DTSTAMP:${toIcsDate(now)}`,
    `UID:${uid}`,
    `SUMMARY:${className} - ${studioName}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${studioAddress}`,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-PT1H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${className} at ${studioName} starts in 1 hour`,
    "END:VALARM",
    "BEGIN:VALARM",
    "TRIGGER:-PT15M",
    "ACTION:DISPLAY",
    `DESCRIPTION:${className} at ${studioName} starts in 15 minutes`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

function downloadIcsFile(icsContent: string, filename: string): void {
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Level color helper
// ---------------------------------------------------------------------------
function levelColor(level: string) {
  const l = level.toLowerCase();
  if (l === "beginner") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";
  if (l === "intermediate") return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
  if (l === "advanced") return "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300";
  return "bg-primary/10 text-primary";
}

// ---------------------------------------------------------------------------
// Capitalize helper
// ---------------------------------------------------------------------------
function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ---------------------------------------------------------------------------
// Types for API class data
// ---------------------------------------------------------------------------
interface ApiClass {
  id: number;
  studioId: number;
  coachId: number | null;
  title: string;
  type: string;
  level: string;
  description: string | null;
  duration: number;
  maxCapacity: number;
  price: number;
  scheduledAt: string;
  studioName: string;
  coachName: string | null;
}

// Derived time slot from scheduledAt
interface TimeSlot {
  classId: number;
  date: Date;
  dateLabel: string;
  dayLabel: string;
  time: string;
}

// ---------------------------------------------------------------------------
// Build day/slot structure from real classes
// ---------------------------------------------------------------------------
function buildSlots(classes: ApiClass[]): { days: DayGroup[]; slots: TimeSlot[] } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const slots: TimeSlot[] = classes
    .map((cls) => {
      const date = new Date(cls.scheduledAt);
      const diffDays = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const dayLabel =
        diffDays === 0 ? "Today" : diffDays === 1 ? "Tomorrow" : date.toLocaleDateString("en-GB", { weekday: "short" });
      const dateLabel = date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
      const time = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
      return { classId: cls.id, date, dateLabel, dayLabel, time };
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  // Group by calendar day
  const dayMap = new Map<string, TimeSlot[]>();
  for (const slot of slots) {
    const key = slot.date.toISOString().slice(0, 10);
    if (!dayMap.has(key)) dayMap.set(key, []);
    dayMap.get(key)!.push(slot);
  }

  const days: DayGroup[] = [];
  let idx = 0;
  for (const [, daySlots] of dayMap) {
    days.push({
      index: idx++,
      dayLabel: daySlots[0].dayLabel,
      dateLabel: daySlots[0].dateLabel,
      slots: daySlots,
    });
  }

  return { days, slots };
}

interface DayGroup {
  index: number;
  dayLabel: string;
  dateLabel: string;
  slots: TimeSlot[];
}

const SERVICE_FEE = 2.5;

// ---------------------------------------------------------------------------
// BookingPage component
// ---------------------------------------------------------------------------
export default function BookingPage() {
  const [, params] = useRoute("/booking/:studioId");
  const [, navigate] = useLocation();
  const studioId = params ? Number(params.studioId) : null;
  const { data: STUDIOS = [], isLoading: studiosLoading } = useStudios();
  const { data: apiClasses = [], isLoading: classesLoading } = useClasses(studioId ?? undefined);
  const createBooking = useCreateBooking();
  const bookingPayment = useBookingPayment();

  const foundStudio = STUDIOS.find((s: any) => s.id === studioId);

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [bookingResult, setBookingResult] = useState<any>(null);

  const selectedClass = useMemo(
    () => apiClasses.find((c: ApiClass) => c.id === selectedClassId) ?? null,
    [apiClasses, selectedClassId],
  );

  const { days } = useMemo(() => {
    if (!selectedClass) return { days: [] as DayGroup[], slots: [] as TimeSlot[] };
    // Show all schedule entries for the selected class title at this studio
    const relevantClasses = apiClasses.filter(
      (c: ApiClass) => c.title === selectedClass.title && c.studioId === selectedClass.studioId,
    );
    return buildSlots(relevantClasses);
  }, [apiClasses, selectedClass]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  if (studiosLoading || classesLoading) return <GenericPageSkeleton />;

  if (!foundStudio) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6">
        <p className="text-lg font-semibold text-foreground">Studio not found</p>
        <Button variant="outline" onClick={() => navigate("/")}>
          Back to Explore
        </Button>
      </div>
    );
  }

  const studio = foundStudio!;

  // De-duplicate classes by title for step 1 (show each class type once)
  const uniqueClasses: ApiClass[] = [];
  const seenTitles = new Set<string>();
  for (const cls of apiClasses as ApiClass[]) {
    if (!seenTitles.has(cls.title)) {
      seenTitles.add(cls.title);
      uniqueClasses.push(cls);
    }
  }

  // ---------------------------------------------------------------------------
  // Step progress indicator
  // ---------------------------------------------------------------------------
  const stepLabels = ["Class", "Time", "Confirm", "Done"];

  function StepIndicator() {
    return (
      <div className="flex items-center justify-center gap-1 py-4 px-6">
        {stepLabels.map((label, i) => {
          const stepNum = i + 1;
          const isActive = stepNum === currentStep;
          const isComplete = stepNum < currentStep;
          return (
            <div key={label} className="flex items-center gap-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  isComplete
                    ? "bg-accent-cta text-white"
                    : isActive
                      ? "bg-accent-cta text-white shadow-md shadow-accent-cta/30"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {isComplete ? <Check className="w-3.5 h-3.5" /> : stepNum}
              </div>
              <span
                className={`text-[11px] font-semibold mr-1 hidden sm:inline ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
              {i < stepLabels.length - 1 && (
                <div
                  className={`w-6 h-0.5 rounded-full transition-colors duration-300 ${
                    isComplete ? "bg-accent-cta" : "bg-muted"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Back / close header
  // ---------------------------------------------------------------------------
  function BookingHeader() {
    return (
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3">
          {currentStep < 4 ? (
            <button
              type="button"
              onClick={() => {
                if (currentStep === 1) navigate("/");
                else setCurrentStep((s) => s - 1);
              }}
              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-8" />
          )}
          <div className="flex-1 text-center">
            <p className="text-sm font-bold text-foreground">{studio.name}</p>
            <p className="text-[11px] text-muted-foreground">{studio.neighborhood}</p>
          </div>
          <div className="w-8" />
        </div>
        <StepIndicator />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // STEP 1 — Select Class (real API data)
  // ---------------------------------------------------------------------------
  function StepSelectClass() {
    if (uniqueClasses.length === 0) {
      return (
        <div className="px-4 pb-6 space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="pt-2 pb-1">
            <h2 className="text-lg font-bold text-foreground">No classes available</h2>
            <p className="text-sm text-muted-foreground">
              {studio.name} has no upcoming classes scheduled. Check back later!
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/")} className="w-full">
            Back to Explore
          </Button>
        </div>
      );
    }

    return (
      <div className="px-4 pb-6 space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="pt-2 pb-1">
          <h2 className="text-lg font-bold text-foreground">Choose your class</h2>
          <p className="text-sm text-muted-foreground">Select from available sessions at {studio.name}</p>
        </div>

        {uniqueClasses.map((cls: ApiClass) => (
          <Card
            key={cls.id}
            onClick={() => {
              setSelectedClassId(cls.id);
              setSelectedDay(0);
              setSelectedSlot(null);
              setCurrentStep(2);
            }}
            className="cursor-pointer border border-border/60 hover:border-accent-cta/40 hover:shadow-md transition-all duration-200 group"
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-bold text-foreground group-hover:text-accent-cta transition-colors">
                    {cls.title}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                    <User className="w-3.5 h-3.5" />
                    <span>{cls.coachName ?? "TBA"}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <span className="text-lg font-black text-foreground">{cls.price}</span>
                  <span className="text-xs text-muted-foreground ml-0.5 font-medium">EUR</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap mt-3">
                <Badge variant="outline" className="text-[11px] font-semibold gap-1 px-2 py-0.5">
                  <Clock className="w-3 h-3" />
                  {cls.duration} min
                </Badge>
                <Badge className={`text-[11px] font-semibold px-2 py-0.5 border-none ${levelColor(cls.level)}`}>
                  {capitalize(cls.level)}
                </Badge>
                <span className="ml-auto text-xs font-semibold text-muted-foreground">{cls.maxCapacity} spots</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent-cta transition-colors" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // STEP 2 — Select Time Slot (derived from scheduledAt)
  // ---------------------------------------------------------------------------
  function StepSelectTime() {
    if (!selectedClass) return null;

    const currentDaySlots = days[selectedDay]?.slots ?? [];

    // If only one time slot exists, auto-select it
    const allSlots = days.flatMap((d) => d.slots);
    if (allSlots.length === 1 && !selectedSlot) {
      // Will be set on next render after user sees it
    }

    return (
      <div className="px-4 pb-6 space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
        {/* Selected class summary */}
        <Card className="border border-accent-cta/30 bg-accent-cta/5">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-cta/15 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-accent-cta" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-foreground truncate">{selectedClass.title}</p>
              <p className="text-xs text-muted-foreground">
                {selectedClass.coachName ?? "TBA"} &middot; {selectedClass.duration} min &middot;{" "}
                {capitalize(selectedClass.level)}
              </p>
            </div>
            <span className="font-black text-foreground text-sm flex-shrink-0">{selectedClass.price} EUR</span>
          </CardContent>
        </Card>

        {days.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No time slots available for this class.</p>
          </div>
        ) : (
          <>
            {/* Day selector tabs */}
            <div>
              <h3 className="text-sm font-bold text-foreground mb-2">Select a date</h3>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                {days.map((day) => (
                  <button
                    type="button"
                    key={day.index}
                    onClick={() => {
                      setSelectedDay(day.index);
                      setSelectedSlot(null);
                    }}
                    className={`flex-shrink-0 flex flex-col items-center px-3.5 py-2 rounded-xl border transition-all duration-200 ${
                      selectedDay === day.index
                        ? "bg-accent-cta text-white border-accent-cta shadow-md shadow-accent-cta/25"
                        : "bg-card border-border/60 hover:border-accent-cta/40"
                    }`}
                  >
                    <span
                      className={`text-[11px] font-semibold ${selectedDay === day.index ? "text-white/80" : "text-muted-foreground"}`}
                    >
                      {day.dayLabel}
                    </span>
                    <span
                      className={`text-xs font-bold mt-0.5 ${selectedDay === day.index ? "text-white" : "text-foreground"}`}
                    >
                      {day.dateLabel}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Time grid */}
            <div>
              <h3 className="text-sm font-bold text-foreground mb-2">Available times</h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {currentDaySlots.map((slot) => {
                  const isSelected = selectedSlot?.time === slot.time && selectedSlot?.dateLabel === slot.dateLabel;
                  return (
                    <button
                      type="button"
                      key={`${slot.dateLabel}-${slot.time}`}
                      onClick={() => setSelectedSlot(slot)}
                      className={`relative px-3 py-2.5 rounded-xl text-sm font-bold border transition-all duration-200 ${
                        isSelected
                          ? "bg-accent-cta text-white border-accent-cta shadow-md shadow-accent-cta/25"
                          : "bg-card border-border/60 text-foreground hover:border-accent-cta/40 hover:shadow-sm"
                      }`}
                    >
                      {slot.time}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Continue button */}
        <Button
          onClick={() => setCurrentStep(3)}
          disabled={!selectedSlot}
          className="w-full bg-accent-cta hover:bg-accent-cta/85 text-white font-bold h-12 text-sm rounded-xl shadow-md shadow-accent-cta/20 disabled:opacity-40 disabled:shadow-none transition-all duration-200"
        >
          {selectedSlot ? `Continue with ${selectedSlot.time}` : "Select a time slot"}
        </Button>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // STEP 3 — Confirm & Pay (calls real API)
  // ---------------------------------------------------------------------------
  function StepConfirm() {
    if (!selectedClass || !selectedSlot) return null;

    const total = selectedClass.price + SERVICE_FEE;

    const handleConfirm = () => {
      // Step 1: Create payment intent via the payments API
      bookingPayment.mutate(
        {
          studioName: studio.name,
          className: selectedClass.title,
          amount: total,
        },
        {
          onSuccess: (paymentResult) => {
            // Step 2: Payment intent created (or mock success) — now create the booking
            createBooking.mutate(
              {
                classId: selectedSlot.classId,
                studioId: selectedClass.studioId,
                timeSlot: selectedSlot.time,
                paymentIntentId: paymentResult.paymentIntentId,
              },
              {
                onSuccess: (data: any) => {
                  setBookingResult(data);
                  setCurrentStep(4);
                  toast.success("Booking confirmed!");
                  notify.bookingConfirmed(studio.name, selectedSlot!.time);
                },
                onError: (err: any) => {
                  toast.error(err.message || "Failed to create booking. Please try again.");
                },
              },
            );
          },
          onError: (err: any) => {
            toast.error(err.message || "Payment failed. Please try again.");
          },
        },
      );
    };

    return (
      <div className="px-4 pb-6 space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="pt-1 pb-1">
          <h2 className="text-lg font-bold text-foreground">Confirm your booking</h2>
          <p className="text-sm text-muted-foreground">Review your session details below</p>
        </div>

        {/* Booking summary card */}
        <Card className="border border-border/60 overflow-hidden">
          <div className="h-28 relative overflow-hidden">
            <img src={studio.imageUrl} alt={studio.name} loading="lazy" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-3 left-4">
              <p className="text-white font-bold text-sm">{studio.name}</p>
              <p className="text-white/70 text-xs">{studio.neighborhood}</p>
            </div>
          </div>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-accent-cta/10 flex items-center justify-center flex-shrink-0">
                <Zap className="w-4.5 h-4.5 text-accent-cta" />
              </div>
              <div>
                <p className="font-bold text-sm text-foreground">{selectedClass.title}</p>
                <p className="text-xs text-muted-foreground">
                  {capitalize(selectedClass.level)} &middot; {selectedClass.duration} min
                </p>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="text-sm font-semibold text-foreground">
                    {selectedSlot.dayLabel}, {selectedSlot.dateLabel}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Time</p>
                  <p className="text-sm font-semibold text-foreground">{selectedSlot.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Coach</p>
                  <p className="text-sm font-semibold text-foreground">{selectedClass.coachName ?? "TBA"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm font-semibold text-foreground">{studio.neighborhood}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Price breakdown */}
        <Card className="border border-border/60">
          <CardContent className="p-4 space-y-2.5">
            <h3 className="font-bold text-sm text-foreground">Price breakdown</h3>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{selectedClass.title}</span>
              <span className="font-semibold text-foreground">{selectedClass.price.toFixed(2)} EUR</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Service fee</span>
              <span className="font-semibold text-foreground">{SERVICE_FEE.toFixed(2)} EUR</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="font-bold text-foreground">Total</span>
              <span className="font-black text-foreground text-base">{total.toFixed(2)} EUR</span>
            </div>
          </CardContent>
        </Card>

        {/* Cancellation policy */}
        <div className="flex items-start gap-2.5 px-1">
          <Shield className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Free cancellation up to 12 hours before the session. Late cancellations will be charged the full amount.
            No-shows may affect future booking priority.
          </p>
        </div>

        {/* Confirm CTA */}
        <Button
          onClick={handleConfirm}
          disabled={bookingPayment.isPending || createBooking.isPending}
          className="w-full bg-accent-cta hover:bg-accent-cta/85 text-white font-bold h-13 text-sm rounded-xl shadow-lg shadow-accent-cta/25 disabled:opacity-70 transition-all duration-200"
        >
          {bookingPayment.isPending || createBooking.isPending ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {bookingPayment.isPending ? "Processing payment..." : "Confirming booking..."}
            </span>
          ) : (
            <>Confirm Booking &mdash; {total.toFixed(2)} EUR</>
          )}
        </Button>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // STEP 4 — Booking Confirmed (shows real booking reference)
  // ---------------------------------------------------------------------------
  function StepConfirmed() {
    if (!selectedClass || !selectedSlot) return null;

    const bookingRef = bookingResult?.id
      ? `PH-${String(bookingResult.id).padStart(5, "0")}`
      : `PH-${Date.now().toString(36).toUpperCase().slice(-6)}`;

    return (
      <div className="px-4 pb-6 flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
        {/* Checkmark animation */}
        <div className="mt-8 mb-6 relative">
          <div className="w-24 h-24 rounded-full bg-accent-cta/10 flex items-center justify-center animate-in zoom-in-0 duration-700">
            <div className="w-16 h-16 rounded-full bg-accent-cta flex items-center justify-center shadow-lg shadow-accent-cta/30">
              <Check className="w-8 h-8 text-white" strokeWidth={3} />
            </div>
          </div>
          <Sparkles className="w-5 h-5 text-accent-cta absolute -top-1 -right-1 animate-pulse" />
          <Sparkles
            className="w-4 h-4 text-accent-cta/60 absolute -bottom-1 -left-2 animate-pulse"
            style={{ animationDelay: "0.5s" }}
          />
        </div>

        <h2 className="text-xl font-black text-foreground mb-1">Booking Confirmed!</h2>
        <p className="text-sm text-muted-foreground mb-6 text-center">You're all set. See you on the mat!</p>

        {/* Booking details card */}
        <Card className="w-full border border-accent-cta/20 bg-accent-cta/5 mb-6">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-3 pb-2">
              <img
                src={studio.imageUrl}
                alt={studio.name}
                loading="lazy"
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div>
                <p className="font-bold text-sm text-foreground">{studio.name}</p>
                <p className="text-xs text-muted-foreground">{studio.neighborhood}</p>
              </div>
            </div>
            <Separator className="opacity-50" />
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-accent-cta flex-shrink-0" />
                <span className="text-sm text-foreground font-semibold">{selectedClass.title}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-accent-cta flex-shrink-0" />
                <span className="text-sm text-foreground">
                  {selectedSlot.dayLabel}, {selectedSlot.dateLabel} at {selectedSlot.time}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-accent-cta flex-shrink-0" />
                <span className="text-sm text-foreground">{selectedClass.coachName ?? "TBA"}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-accent-cta flex-shrink-0" />
                <span className="text-sm text-foreground">{selectedClass.duration} minutes</span>
              </div>
            </div>
            <Separator className="opacity-50" />
            <div className="flex justify-between pt-1">
              <span className="text-sm font-bold text-foreground">Total paid</span>
              <span className="text-sm font-black text-accent-cta">
                {(selectedClass.price + SERVICE_FEE).toFixed(2)} EUR
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Confirmation reference */}
        <p className="text-xs text-muted-foreground mb-6">
          Booking ref: <span className="font-mono font-bold text-foreground">{bookingRef}</span>
        </p>

        {/* Action buttons */}
        <div className="w-full space-y-2.5">
          <Button
            variant="outline"
            onClick={() => {
              const icsContent = generateIcsFile({
                className: selectedClass.title,
                studioName: studio.name,
                studioAddress: studio.address ?? studio.neighborhood ?? "See studio details",
                startDate: selectedSlot.date,
                durationMinutes: selectedClass.duration,
                coachName: selectedClass.coachName,
                bookingRef,
              });
              const safeName = selectedClass.title.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
              downloadIcsFile(icsContent, `pilateshub-${safeName}.ics`);
              toast.success("Calendar file downloaded!");
            }}
            className="w-full font-bold h-11 rounded-xl gap-2"
          >
            <Download className="w-4 h-4" />
            Add to Calendar (.ics)
          </Button>
          <Button
            onClick={() => navigate("/")}
            className="w-full bg-accent-cta hover:bg-accent-cta/85 text-white font-bold h-11 rounded-xl shadow-md shadow-accent-cta/20"
          >
            Back to Explore
          </Button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Smart Directory redirect banner — encourages real booking on studio site
  // ---------------------------------------------------------------------------
  const hasWebsite = Boolean(studio.website);
  const hasPhone = Boolean(studio.phone);

  function SmartDirectoryBanner() {
    return (
      <div className="mx-4 mt-3 mb-1 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-950/30 p-3">
        <div className="flex items-start gap-2.5">
          <FlaskConical className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-1">Demo Booking Flow</p>
            <p className="text-[11px] text-amber-700/80 dark:text-amber-400/70 leading-relaxed mb-2">
              This is a demonstration of in-app booking. To book a real session, use the studio's own booking system.
            </p>
            {hasWebsite ? (
              <a
                href={studio.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-800 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-200 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                Book on {studio.name}'s website
              </a>
            ) : hasPhone ? (
              <a
                href={`tel:${studio.phone}`}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-800 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-200 transition-colors"
              >
                <Phone className="w-3 h-3" />
                Call {studio.phone}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-full bg-background">
      <BookingHeader />
      {currentStep < 4 && <SmartDirectoryBanner />}
      {currentStep === 1 && <StepSelectClass />}
      {currentStep === 2 && <StepSelectTime />}
      {currentStep === 3 && <StepConfirm />}
      {currentStep === 4 && <StepConfirmed />}
    </div>
  );
}
