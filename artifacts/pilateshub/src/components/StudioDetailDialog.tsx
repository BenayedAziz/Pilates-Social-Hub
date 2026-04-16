import { ExternalLink, FlaskConical, Globe, MapPin, Pen, Phone, Star, ThumbsUp, Trophy } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { WriteReviewDialog } from "@/components/WriteReviewDialog";

import type { Studio } from "@/data/types";
import { useCoaches, useGoogleReviews, useStudioCheckins, useStudioReviews } from "@/hooks/use-api";

interface StudioDetailDialogProps {
  studio: Studio;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function StudioDetailDialog({ studio, children, open, onOpenChange }: StudioDetailDialogProps) {
  const [, navigate] = useLocation();
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const { data: COACHES = [] } = useCoaches();
  const { data: apiReviews = [] } = useStudioReviews(studio.id);
  const { data: apiCheckins = [] } = useStudioCheckins(studio.id);
  const { data: googleReviews = [] } = useGoogleReviews(studio.id);

  const hasWebsite = Boolean(studio.website);
  const hasPhone = Boolean(studio.phone);
  const hasAddress = Boolean(studio.address);

  // Merge pending (locally added) reviews with API reviews
  const studioReviews = useMemo(
    () => [...pendingReviews, ...apiReviews],
    [pendingReviews, apiReviews],
  );

  // Rating summary
  const avgRating =
    studioReviews.length > 0
      ? (studioReviews.reduce((sum, r) => sum + r.rating, 0) / studioReviews.length).toFixed(1)
      : "0.0";
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: studioReviews.filter((r) => r.rating === star).length,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="w-[calc(100vw-2rem)] max-w-[520px] md:max-w-2xl rounded-2xl p-0 overflow-hidden border-none shadow-xl max-h-[85vh] flex flex-col">
        <div className="overflow-y-auto flex-1">
        <div className="p-5 md:p-6">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-xl font-bold text-foreground leading-tight">{studio.name}</h2>
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
            <div className="flex gap-2 flex-wrap">
              {studio.coaches.map((coachName) => {
                const coachProfile = COACHES.find((c) => c.name === coachName);
                if (coachProfile) {
                  return (
                    <Link key={coachName} href={`/coach/${coachProfile.slug}`}>
                      <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium cursor-pointer hover:bg-primary/20 transition-colors">
                        {coachName}
                      </span>
                    </Link>
                  );
                }
                return (
                  <span
                    key={coachName}
                    className="text-xs bg-muted text-foreground/80 px-2.5 py-1 rounded-full font-medium"
                  >
                    {coachName}
                  </span>
                );
              })}
            </div>
          </div>

          {/* External Booking CTA — Smart Directory (Model B) */}
          {hasWebsite ? (
            <a href={studio.website} target="_blank" rel="noopener noreferrer" className="block w-full">
              <Button
                className="w-full bg-accent-cta hover:bg-accent-cta/85 text-white font-bold shadow-sm gap-2"
                type="button"
              >
                <ExternalLink className="w-4 h-4" />
                Book on Their Site
              </Button>
            </a>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium text-center">
                Contact this studio directly to book
              </p>
              {hasPhone && (
                <a href={`tel:${studio.phone}`} className="block w-full">
                  <Button
                    className="w-full bg-accent-cta hover:bg-accent-cta/85 text-white font-bold shadow-sm gap-2"
                    type="button"
                  >
                    <Phone className="w-4 h-4" />
                    Call {studio.phone}
                  </Button>
                </a>
              )}
              {!hasPhone && hasAddress && (
                <Button
                  className="w-full bg-accent-cta hover:bg-accent-cta/85 text-white font-bold shadow-sm gap-2"
                  type="button"
                  onClick={() => {
                    const q = encodeURIComponent(studio.address || studio.name);
                    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank");
                  }}
                >
                  <MapPin className="w-4 h-4" />
                  View on Google Maps
                </Button>
              )}
              {!hasPhone && !hasAddress && (
                <Button
                  className="w-full bg-accent-cta hover:bg-accent-cta/85 text-white font-bold shadow-sm gap-2"
                  type="button"
                  disabled
                >
                  <Phone className="w-4 h-4" />
                  Contact Studio
                </Button>
              )}
            </div>
          )}

          {/* Demo booking link — internal flow for demonstration purposes */}
          <button
            type="button"
            onClick={() => navigate(`/booking/${studio.id}`)}
            className="w-full mt-1 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary font-medium transition-colors py-1"
          >
            <FlaskConical className="w-3 h-3" />
            Try Demo Booking Flow
          </button>

          {/* Contact info row */}
          {(hasWebsite || hasPhone || hasAddress) && (
            <div className="flex flex-wrap gap-2 mt-3">
              {hasWebsite && (
                <a
                  href={studio.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  <Globe className="w-3 h-3" />
                  Website
                </a>
              )}
              {hasPhone && (
                <a
                  href={`tel:${studio.phone}`}
                  className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  <Phone className="w-3 h-3" />
                  {studio.phone}
                </a>
              )}
              {hasAddress && (
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                  <MapPin className="w-3 h-3" />
                  {studio.address}
                </span>
              )}
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={() => toast.success(`Checked in at ${studio.name}!`)}
            className="w-full mt-2 font-bold text-xs"
          >
            Check In Here
          </Button>

          <Separator className="my-4" />

          {/* Rating Summary */}
          <div className="flex items-start gap-4 mb-4">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black text-foreground leading-none">{avgRating}</span>
              <div className="flex mt-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i <= Math.round(Number(avgRating))
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-muted-foreground mt-0.5">{studioReviews.length} reviews</span>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              {ratingCounts.map(({ star, count }) => (
                <div key={star} className="flex items-center gap-1.5">
                  <span className="text-[10px] font-medium text-muted-foreground w-3 text-right">{star}</span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all"
                      style={{
                        width: studioReviews.length > 0 ? `${(count / studioReviews.length) * 100}%` : "0%",
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground w-4">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews Header + Write Button */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-foreground">Reviews</h3>
            <WriteReviewDialog
              studioName={studio.name}
              studioId={studio.id}
              onReviewAdded={(review) => setPendingReviews((prev) => [review, ...prev])}
            >
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1 font-semibold">
                <Pen className="w-3 h-3" /> Write a Review
              </Button>
            </WriteReviewDialog>
          </div>

          {/* Reviews List */}
          <div className="flex flex-col gap-3">
            {studioReviews.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-2">No reviews yet. Be the first!</p>
            )}
            {studioReviews.map((review) => (
              <div key={review.id} className="flex gap-3">
                <Avatar className={`w-8 h-8 flex-shrink-0 ${review.userColor}`}>
                  <AvatarFallback className="text-[10px] font-bold text-foreground">
                    {review.userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-foreground">{review.userName}</span>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star
                          key={j}
                          className={`w-3 h-3 ${
                            j < review.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{review.text}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-muted-foreground">{review.date}</span>
                    {review.helpful > 0 && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <ThumbsUp className="w-2.5 h-2.5" /> {review.helpful}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Google Reviews Section */}
          {googleReviews.length > 0 && (
            <>
              <Separator className="my-4" />
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-4 h-4 flex-shrink-0"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <h3 className="font-bold text-sm text-foreground">Google Reviews</h3>
                </div>
                <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {googleReviews.length} reviews
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {googleReviews.slice(0, 5).map((review: any, idx: number) => (
                  <div key={review.id || idx} className="flex gap-3">
                    {review.authorPhotoUrl ? (
                      <img
                        src={review.authorPhotoUrl}
                        alt={review.authorName}
                        loading="lazy"
                        className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
                      />
                    ) : (
                      <Avatar className="w-8 h-8 flex-shrink-0 bg-blue-100">
                        <AvatarFallback className="text-[10px] font-bold text-blue-700">
                          {review.authorName
                            ?.split(" ")
                            .map((w: string) => w[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2) || "?"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold text-foreground">{review.authorName}</span>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, j) => (
                            <Star
                              key={j}
                              className={`w-3 h-3 ${
                                j < review.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.text && (
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{review.text}</p>
                      )}
                      {review.relativeTimeDescription && (
                        <span className="text-[10px] text-muted-foreground mt-1 block">
                          {review.relativeTimeDescription}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {/* Google Attribution - required by Google ToS */}
              <div className="flex items-center justify-center gap-1.5 mt-3 py-2 bg-muted/50 rounded-lg">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span className="text-[10px] text-muted-foreground font-medium">Reviews from Google</span>
              </div>
            </>
          )}

          {/* Studio Regulars Leaderboard */}
          {(() => {
            const studioCheckins = [...apiCheckins].sort((a: any, b: any) => b.checkins - a.checkins);
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
