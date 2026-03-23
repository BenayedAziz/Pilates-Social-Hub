import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  CreditCard,
  MapPin,
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
import { useStudios } from "@/hooks/use-api";
import { notify } from "@/lib/notifications";

// ---------------------------------------------------------------------------
// Mock class data per studio
// ---------------------------------------------------------------------------
interface StudioClass {
  id: number;
  name: string;
  coach: string;
  duration: number;
  level: string;
  price: number;
  spotsLeft: number;
}

const MOCK_CLASSES: StudioClass[] = [
  {
    id: 1,
    name: "Reformer Flow",
    coach: "Sophie Leclerc",
    duration: 55,
    level: "Intermediate",
    price: 45,
    spotsLeft: 4,
  },
  { id: 2, name: "Mat Pilates Core", coach: "Julien Moreau", duration: 45, level: "Beginner", price: 38, spotsLeft: 8 },
  {
    id: 3,
    name: "Cadillac Advanced",
    coach: "Sophie Leclerc",
    duration: 60,
    level: "Advanced",
    price: 55,
    spotsLeft: 2,
  },
  { id: 4, name: "Tower Session", coach: "Julien Moreau", duration: 50, level: "All Levels", price: 42, spotsLeft: 6 },
  {
    id: 5,
    name: "Reformer & Stretch",
    coach: "Marie Dubois",
    duration: 50,
    level: "Beginner",
    price: 40,
    spotsLeft: 5,
  },
  { id: 6, name: "Power Pilates", coach: "Antoine Petit", duration: 55, level: "Advanced", price: 52, spotsLeft: 3 },
];

// ---------------------------------------------------------------------------
// Time‑slot generation for the next 7 days
// ---------------------------------------------------------------------------
const TIMES = ["07:00", "08:30", "09:00", "10:30", "11:30", "14:00", "15:30", "17:00", "18:30", "19:30"];

interface TimeSlot {
  date: Date;
  dateLabel: string;
  dayLabel: string;
  time: string;
  isFull: boolean;
}

function generateSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const today = new Date();
  for (let d = 0; d < 7; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    const dayLabel = d === 0 ? "Today" : d === 1 ? "Tomorrow" : date.toLocaleDateString("en-GB", { weekday: "short" });
    const dateLabel = date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    for (const time of TIMES) {
      // Deterministic "full" slots based on day + time hash
      const hash = (d * 17 + TIMES.indexOf(time) * 7) % 10;
      slots.push({ date, dateLabel, dayLabel, time, isFull: hash < 2 });
    }
  }
  return slots;
}

const SERVICE_FEE = 2.5;

// ---------------------------------------------------------------------------
// Level color helper
// ---------------------------------------------------------------------------
function levelColor(level: string) {
  switch (level) {
    case "Beginner":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";
    case "Intermediate":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
    case "Advanced":
      return "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300";
    default:
      return "bg-primary/10 text-primary";
  }
}

// ---------------------------------------------------------------------------
// BookingPage component
// ---------------------------------------------------------------------------
export default function BookingPage() {
  const [, params] = useRoute("/booking/:studioId");
  const [, navigate] = useLocation();
  const studioId = params ? Number(params.studioId) : null;
  const { data: STUDIOS = [], isLoading: studiosLoading } = useStudios();

  const foundStudio = STUDIOS.find((s: any) => s.id === studioId);

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedClass, setSelectedClass] = useState<StudioClass | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const allSlots = useMemo(() => generateSlots(), []);

  // Group slots by day index
  const days = Array.from({ length: 7 }, (_, i) => {
    const daySlots = allSlots.filter((_, idx) => Math.floor(idx / TIMES.length) === i);
    return {
      index: i,
      dayLabel: daySlots[0]?.dayLabel ?? "",
      dateLabel: daySlots[0]?.dateLabel ?? "",
      slots: daySlots,
    };
  });

  // Assign studio-specific classes based on studio coaches
  const studioClasses = foundStudio
    ? MOCK_CLASSES.map((c) => ({
        ...c,
        coach: foundStudio.coaches[c.id % foundStudio.coaches.length] ?? c.coach,
        price: Math.round(foundStudio.price + (c.price - 45) * 0.8),
      }))
    : MOCK_CLASSES;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  if (studiosLoading) return <GenericPageSkeleton />;

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

  // After the guard, studio is guaranteed to be defined
  const studio = foundStudio!;

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
  // STEP 1 — Select Class
  // ---------------------------------------------------------------------------
  function StepSelectClass() {
    return (
      <div className="px-4 pb-6 space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="pt-2 pb-1">
          <h2 className="text-lg font-bold text-foreground">Choose your class</h2>
          <p className="text-sm text-muted-foreground">Select from available sessions at {studio.name}</p>
        </div>

        {studioClasses.map((cls) => (
          <Card
            key={cls.id}
            onClick={() => {
              setSelectedClass(cls);
              setCurrentStep(2);
            }}
            className="cursor-pointer border border-border/60 hover:border-accent-cta/40 hover:shadow-md transition-all duration-200 group"
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-bold text-foreground group-hover:text-accent-cta transition-colors">
                    {cls.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                    <User className="w-3.5 h-3.5" />
                    <span>{cls.coach}</span>
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
                  {cls.level}
                </Badge>
                <span className="ml-auto text-xs font-semibold text-muted-foreground">
                  {cls.spotsLeft <= 3 ? (
                    <span className="text-rose-500 font-bold">{cls.spotsLeft} spots left</span>
                  ) : (
                    <>{cls.spotsLeft} spots left</>
                  )}
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent-cta transition-colors" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // STEP 2 — Select Time Slot
  // ---------------------------------------------------------------------------
  function StepSelectTime() {
    if (!selectedClass) return null;

    const currentDaySlots = days[selectedDay]?.slots ?? [];

    return (
      <div className="px-4 pb-6 space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
        {/* Selected class summary */}
        <Card className="border border-accent-cta/30 bg-accent-cta/5">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-cta/15 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-accent-cta" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-foreground truncate">{selectedClass.name}</p>
              <p className="text-xs text-muted-foreground">
                {selectedClass.coach} &middot; {selectedClass.duration} min &middot; {selectedClass.level}
              </p>
            </div>
            <span className="font-black text-foreground text-sm flex-shrink-0">{selectedClass.price} EUR</span>
          </CardContent>
        </Card>

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
                  key={slot.time}
                  disabled={slot.isFull}
                  onClick={() => setSelectedSlot(slot)}
                  className={`relative px-3 py-2.5 rounded-xl text-sm font-bold border transition-all duration-200 ${
                    slot.isFull
                      ? "bg-muted/50 text-muted-foreground/40 border-border/30 cursor-not-allowed"
                      : isSelected
                        ? "bg-accent-cta text-white border-accent-cta shadow-md shadow-accent-cta/25"
                        : "bg-card border-border/60 text-foreground hover:border-accent-cta/40 hover:shadow-sm"
                  }`}
                >
                  {slot.time}
                  {slot.isFull && (
                    <span className="absolute -top-1.5 -right-1.5 text-[9px] bg-muted-foreground/20 text-muted-foreground rounded-full px-1.5 py-0.5 font-bold">
                      Full
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

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
  // STEP 3 — Confirm & Pay
  // ---------------------------------------------------------------------------
  function StepConfirm() {
    if (!selectedClass || !selectedSlot) return null;

    const total = selectedClass.price + SERVICE_FEE;

    const handleConfirm = () => {
      setIsProcessing(true);
      // Simulate payment processing
      setTimeout(() => {
        setIsProcessing(false);
        setCurrentStep(4);
        toast.success("Payment processed successfully!");
        notify.bookingConfirmed(studio.name, selectedSlot!.time);
      }, 1800);
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
                <p className="font-bold text-sm text-foreground">{selectedClass.name}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedClass.level} &middot; {selectedClass.duration} min
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
                  <p className="text-sm font-semibold text-foreground">{selectedClass.coach}</p>
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
              <span className="text-muted-foreground">{selectedClass.name}</span>
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

        {/* Payment method */}
        <Card className="border border-border/60">
          <CardContent className="p-4">
            <h3 className="font-bold text-sm text-foreground mb-3">Payment method</h3>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/40">
              <div className="w-10 h-7 rounded-md bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                <CreditCard className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Visa ending in 4242</p>
                <p className="text-xs text-muted-foreground">Expires 12/28</p>
              </div>
              <Check className="w-4 h-4 text-accent-cta" />
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
          disabled={isProcessing}
          className="w-full bg-accent-cta hover:bg-accent-cta/85 text-white font-bold h-13 text-sm rounded-xl shadow-lg shadow-accent-cta/25 disabled:opacity-70 transition-all duration-200"
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            <>Confirm Booking &mdash; {total.toFixed(2)} EUR</>
          )}
        </Button>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // STEP 4 — Booking Confirmed
  // ---------------------------------------------------------------------------
  function StepConfirmed() {
    if (!selectedClass || !selectedSlot) return null;

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
                <span className="text-sm text-foreground font-semibold">{selectedClass.name}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-accent-cta flex-shrink-0" />
                <span className="text-sm text-foreground">
                  {selectedSlot.dayLabel}, {selectedSlot.dateLabel} at {selectedSlot.time}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-accent-cta flex-shrink-0" />
                <span className="text-sm text-foreground">{selectedClass.coach}</span>
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
          Booking ref:{" "}
          <span className="font-mono font-bold text-foreground">
            PH-{Date.now().toString(36).toUpperCase().slice(-6)}
          </span>
        </p>

        {/* Action buttons */}
        <div className="w-full space-y-2.5">
          <Button
            variant="outline"
            onClick={() => toast.success("Calendar event created (placeholder)")}
            className="w-full font-bold h-11 rounded-xl gap-2"
          >
            <Calendar className="w-4 h-4" />
            Add to Calendar
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
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-full bg-background">
      <BookingHeader />
      {currentStep === 1 && <StepSelectClass />}
      {currentStep === 2 && <StepSelectTime />}
      {currentStep === 3 && <StepConfirm />}
      {currentStep === 4 && <StepConfirmed />}
    </div>
  );
}
