import { ArrowLeft, CheckCircle2, MapPin, Star, Users } from "lucide-react";
import { Link, useRoute } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCoaches, useStudios } from "@/hooks/use-api";
import { GenericPageSkeleton } from "@/components/PageSkeleton";
import NotFound from "@/pages/not-found";

export default function CoachPage() {
  const [, params] = useRoute("/coach/:slug");
  const { data: COACHES = [], isLoading: coachesLoading } = useCoaches();
  const { data: STUDIOS = [], isLoading: studiosLoading } = useStudios();

  if (coachesLoading || studiosLoading) return <GenericPageSkeleton />;

  const coach = COACHES.find((c: any) => c.slug === params?.slug);

  if (!coach) return <NotFound />;

  const studios = STUDIOS.filter((s: any) => coach.studioIds.includes(s.id));

  return (
    <div className="bg-background min-h-full animate-in fade-in duration-300 pb-24">
      {/* Hero section */}
      <div className="relative bg-gradient-to-b from-primary/10 to-background px-5 pt-8 pb-6 text-center">
        {/* Back button */}
        <button
          type="button"
          onClick={() => window.history.back()}
          className="absolute top-4 left-4 p-2 rounded-full bg-card/80 backdrop-blur-sm text-foreground hover:bg-card transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Avatar */}
        <img
          src={coach.imageUrl}
          alt={coach.name}
          className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-card shadow-lg"
        />
        <h1 className="text-xl font-bold mt-3 text-foreground">{coach.name}</h1>
        <p className="text-sm text-muted-foreground">
          {coach.yearsExperience} years experience
        </p>
        <div className="flex justify-center gap-1.5 mt-2 flex-wrap">
          {coach.specialties.map((s: string) => (
            <Badge key={s} variant="secondary" className="text-xs font-medium">
              {s}
            </Badge>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 px-5 -mt-1">
        <div className="bg-muted/50 rounded-xl px-3 py-2.5 text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <Star className="w-3.5 h-3.5 text-accent-cta fill-accent-cta" />
            <span className="text-sm font-bold text-foreground">{coach.rating}</span>
          </div>
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
            Rating
          </p>
        </div>
        <div className="bg-muted/50 rounded-xl px-3 py-2.5 text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <Users className="w-3.5 h-3.5 text-primary" />
            <span className="text-sm font-bold text-foreground">{coach.reviewCount}</span>
          </div>
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
            Reviews
          </p>
        </div>
        <div className="bg-muted/50 rounded-xl px-3 py-2.5 text-center">
          <div className="mb-0.5">
            <span className="text-sm font-bold text-foreground">
              {coach.sessionsCount.toLocaleString()}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
            Sessions
          </p>
        </div>
      </div>

      {/* Quote */}
      <blockquote className="mx-5 mt-5 italic text-muted-foreground border-l-2 border-primary pl-4 text-sm leading-relaxed">
        &ldquo;{coach.quote}&rdquo;
      </blockquote>

      <Separator className="mx-5 my-5" />

      {/* Bio */}
      <section className="px-5">
        <h2 className="font-bold text-foreground text-base mb-2">About</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{coach.bio}</p>
      </section>

      <Separator className="mx-5 my-5" />

      {/* Certifications */}
      <section className="px-5">
        <h2 className="font-bold text-foreground text-base mb-3">Certifications</h2>
        <div className="flex flex-col gap-2">
          {coach.certifications.map((cert: string) => (
            <div key={cert} className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-sm text-foreground">{cert}</span>
            </div>
          ))}
        </div>
      </section>

      <Separator className="mx-5 my-5" />

      {/* Studios */}
      <section className="px-5">
        <h2 className="font-bold text-foreground text-base mb-3">Teaches At</h2>
        <div className="flex flex-col gap-3">
          {studios.map((studio) => (
            <Card
              key={studio.id}
              className="border-none shadow-sm overflow-hidden bg-card rounded-2xl card-warm"
            >
              <div className="flex gap-3">
                <div className="w-24 h-20 flex-shrink-0 overflow-hidden rounded-l-2xl">
                  <img
                    src={studio.imageUrl}
                    alt={studio.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-3 flex-1 flex flex-col justify-center">
                  <h3 className="font-semibold text-sm text-foreground leading-tight">
                    {studio.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{studio.neighborhood}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Star className="w-3 h-3 text-accent-cta fill-accent-cta" />
                    <span className="text-xs font-semibold text-foreground">{studio.rating}</span>
                    <span className="text-xs text-muted-foreground">
                      &middot; {studio.reviews} reviews
                    </span>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-5 py-4 bg-card border-t border-border z-50">
        <Button className="w-full bg-accent-cta hover:bg-accent-cta/85 text-white font-bold shadow-sm btn-premium">
          Book with {coach.name.split(" ")[0]}
        </Button>
      </div>
    </div>
  );
}
