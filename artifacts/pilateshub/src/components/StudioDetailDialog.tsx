import { CheckCircle2, Star, Trophy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useApp } from "@/context/AppContext";
import type { Studio } from "@/data/mock-data";
import { STUDIO_CHECKINS } from "@/data/mock-data";

interface StudioDetailDialogProps {
  studio: Studio;
  children: React.ReactNode;
}

export function StudioDetailDialog({ studio, children }: StudioDetailDialogProps) {
  const { bookingSuccess, setBookingSuccess } = useApp();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const handleBook = () => {
    setBookingSuccess(studio.id);
    toast.success(`Booked! Your session at ${studio.name} at ${selectedTime} is confirmed.`);
  };

  return (
    <Dialog>
      <DialogTrigger
        asChild
        onClick={() => {
          setBookingSuccess(null);
          setSelectedTime(null);
        }}
      >
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-[360px] rounded-2xl p-0 overflow-hidden border-none shadow-xl">
        <div className="h-44 relative overflow-hidden">
          <img src={studio.imageUrl} alt={studio.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute bottom-3 left-4">
            <p className="text-xs text-white/80 font-medium">{studio.neighborhood}</p>
          </div>
        </div>
        <div className="p-5">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-xl font-bold text-foreground leading-tight">{studio.name}</h2>
            <Badge className="bg-secondary text-primary font-bold border-none ml-2 flex-shrink-0">
              €{studio.price}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />
            <span className="font-semibold text-foreground">{studio.rating}</span>
            <span>
              · {studio.reviews} reviews · {studio.distance}km
            </span>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed mb-4">{studio.description}</p>

          <div className="mb-4">
            <h3 className="font-bold text-sm text-foreground mb-2">Coaches</h3>
            <div className="flex gap-2">
              {studio.coaches.map((coach) => (
                <span key={coach} className="text-xs bg-muted text-foreground/80 px-2.5 py-1 rounded-full font-medium">
                  {coach}
                </span>
              ))}
            </div>
          </div>

          <h3 className="font-bold text-sm text-foreground mb-2">Available Today</h3>
          <div className="flex gap-2 mb-5 flex-wrap">
            {["09:00", "11:30", "14:00", "17:00", "19:30"].map((time) => (
              <Badge
                key={time}
                variant="outline"
                onClick={() => setSelectedTime(time)}
                className={`px-3 py-1 cursor-pointer transition-colors font-medium ${
                  selectedTime === time
                    ? "bg-primary text-white border-primary"
                    : "hover:bg-primary hover:text-white hover:border-primary"
                }`}
              >
                {time}
              </Badge>
            ))}
          </div>

          {bookingSuccess === studio.id ? (
            <Button className="w-full bg-primary hover:bg-primary/90 text-white gap-2 font-bold" disabled>
              <CheckCircle2 className="w-5 h-5" /> Booked Successfully!
            </Button>
          ) : (
            <Button
              onClick={handleBook}
              disabled={!selectedTime}
              className="w-full bg-primary hover:bg-primary/85 text-white font-bold shadow-sm disabled:opacity-50"
            >
              {selectedTime ? `Book at ${selectedTime}` : "Select a time slot"}
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => toast.success(`Checked in at ${studio.name}! 📍`)}
            className="w-full mt-2 font-bold text-xs"
          >
            📍 Check In Here
          </Button>

          <Separator className="my-4" />
          <h3 className="font-bold text-sm text-foreground mb-3">Reviews</h3>
          <div className="flex flex-col gap-3">
            {[
              { user: "Emma D.", rating: 5, text: "Absolutely love this studio! The instructors are top-notch." },
              { user: "Lucas M.", rating: 4, text: "Great equipment and atmosphere. A bit pricey but worth it." },
            ].map((review, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0 flex items-center justify-center text-xs font-bold text-muted-foreground">
                  {review.user[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-foreground">{review.user}</span>
                    <div className="flex">
                      {Array.from({ length: review.rating }).map((_, j) => (
                        <Star key={j} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{review.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Studio Regulars Leaderboard */}
          {(() => {
            const studioCheckins = STUDIO_CHECKINS.filter((c) => c.studioId === studio.id).sort(
              (a, b) => b.checkins - a.checkins,
            );
            if (studioCheckins.length === 0) return null;
            return (
              <>
                <Separator className="my-4" />
                <h3 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-accent-cta" /> Studio Regulars
                </h3>
                <div className="flex flex-col gap-2">
                  {studioCheckins.map((checkin, idx) => (
                    <div key={checkin.userId} className="flex items-center gap-2.5">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${
                          idx === 0
                            ? "bg-amber-400 text-white"
                            : idx === 1
                              ? "bg-muted-foreground/20 text-foreground"
                              : idx === 2
                                ? "bg-orange-300 text-white"
                                : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <Avatar className={`w-6 h-6 ${checkin.userColor}`}>
                        <AvatarFallback className="text-[8px] font-bold text-foreground">
                          {checkin.userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="flex-1 text-xs font-semibold text-foreground">{checkin.userName}</span>
                      <span className="text-[10px] font-bold text-primary">{checkin.checkins} visits</span>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
