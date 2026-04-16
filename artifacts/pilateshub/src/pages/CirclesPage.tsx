import { Lock, Plus, Users, X, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { GenericPageSkeleton } from "@/components/PageSkeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { PilatesCircle } from "@/data/types";
import { useCircles } from "@/hooks/use-api";

// Mock recent activity per circle
const CIRCLE_ACTIVITY = [
  { initials: "ML", color: "bg-blue-100", name: "Marie L.", action: "a complété une séance Reformer", timeAgo: "2h" },
  { initials: "TC", color: "bg-rose-100", name: "Thomas C.", action: "a rejoint le circle", timeAgo: "5h" },
  { initials: "SB", color: "bg-green-100", name: "Sophie B.", action: "a posté dans le forum", timeAgo: "1j" },
];

interface CircleDetailDialogProps {
  circle: PilatesCircle;
  onClose: () => void;
  onToggleJoin: (id: number) => void;
}

function CircleDetailDialog({ circle, onClose, onToggleJoin }: CircleDetailDialogProps) {
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[92vw] md:max-w-md rounded-2xl p-0 overflow-hidden border-none shadow-xl max-h-[88vh] flex flex-col">
        {/* Hero */}
        <div
          className="relative px-5 pt-6 pb-5 flex-shrink-0"
          style={{ background: "linear-gradient(135deg, hsl(28 22% 28%) 0%, hsl(16 50% 42%) 100%)" }}
        >
          <button type="button" onClick={onClose} className="absolute top-3 right-3 text-white/60 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center text-3xl flex-shrink-0">
              {circle.emoji}
            </div>
            <div>
              <h2 className="text-white font-black text-lg leading-tight">{circle.name}</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Users className="w-3 h-3 text-white/60" />
                <span className="text-white/60 text-xs font-medium">{circle.members.length} membres</span>
                {circle.isJoined && (
                  <span className="ml-1 bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Rejoint</span>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="bg-white/10 rounded-xl p-2.5 text-center">
              <p className="text-white font-black text-lg leading-none">{circle.totalSessions}</p>
              <p className="text-white/60 text-[10px] font-semibold mt-0.5">séances</p>
            </div>
            <div className="bg-white/10 rounded-xl p-2.5 text-center">
              <p className="text-white font-black text-lg leading-none">{(circle.totalCalories / 1000).toFixed(1)}k</p>
              <p className="text-white/60 text-[10px] font-semibold mt-0.5">calories</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5">
          {/* Description */}
          <div>
            <p className="text-sm text-foreground/80 leading-relaxed">{circle.description}</p>
          </div>

          {/* Members */}
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Membres</h3>
            <div className="flex flex-wrap gap-2">
              {circle.members.map((member) => (
                <div key={member.id} className="flex items-center gap-1.5 bg-muted/50 rounded-full pl-1 pr-3 py-1">
                  <Avatar className={`w-6 h-6 ${member.color}`}>
                    <AvatarFallback className="text-[9px] font-bold text-foreground">{member.initials}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-semibold text-foreground">{member.initials}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Activité récente</h3>
            <div className="flex flex-col gap-3">
              {CIRCLE_ACTIVITY.map((a, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <Avatar className={`w-7 h-7 flex-shrink-0 ${a.color}`}>
                    <AvatarFallback className="text-[9px] font-bold text-foreground">{a.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground leading-snug">
                      <span className="font-bold">{a.name}</span> {a.action}
                    </p>
                    <span className="text-[10px] text-muted-foreground/50">{a.timeAgo}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy note if joined */}
          {circle.isJoined && (
            <div className="flex items-center gap-2 bg-primary/5 rounded-xl p-3">
              <Zap className="w-4 h-4 text-primary fill-primary flex-shrink-0" />
              <p className="text-xs text-primary font-semibold">Tu fais partie de ce circle. Tes séances sont partagées avec les membres.</p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="px-5 py-4 border-t border-border/20 flex-shrink-0">
          <Button
            onClick={() => { onToggleJoin(circle.id); onClose(); }}
            className={`w-full h-11 font-bold rounded-xl gap-2 ${
              circle.isJoined
                ? "bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                : "bg-primary hover:bg-primary/90 text-primary-foreground"
            }`}
          >
            {circle.isJoined ? (
              <><Lock className="w-4 h-4" /> Quitter le circle</>
            ) : (
              <><Users className="w-4 h-4" /> Rejoindre le circle</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function CirclesPage() {
  const { data: apiCircles = [], isLoading } = useCircles();
  const [circles, setCircles] = useState<PilatesCircle[]>([]);
  const [selectedCircle, setSelectedCircle] = useState<PilatesCircle | null>(null);

  useEffect(() => {
    if (apiCircles.length > 0) setCircles(apiCircles);
  }, [apiCircles]);

  if (isLoading) return <GenericPageSkeleton />;

  const toggleJoin = (id: number) => {
    setCircles((prev) => prev.map((c) => (c.id === id ? { ...c, isJoined: !c.isJoined } : c)));
    const circle = circles.find((c) => c.id === id);
    if (circle?.isJoined) {
      toast.info(`Tu as quitté ${circle.name}`);
    } else {
      toast.success(`Tu as rejoint ${circle?.name} !`);
    }
  };

  const myCircles = circles.filter((c) => c.isJoined);
  const discoverCircles = circles.filter((c) => !c.isJoined);

  return (
    <div className="bg-background min-h-full animate-in fade-in duration-300 p-5">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-foreground">Pilates Circles</h1>
        <Button
          type="button"
          size="sm"
          onClick={() => toast.info("Création de circle bientôt disponible !")}
          className="bg-primary hover:bg-primary/85 text-white font-bold text-xs gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> Créer
        </Button>
      </div>

      {/* My Circles */}
      {myCircles.length > 0 && (
        <>
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Mes circles</h2>
          <div className="flex flex-col gap-3 mb-6">
            {myCircles.map((circle) => (
              <CircleCard key={circle.id} circle={circle} onToggleJoin={toggleJoin} onOpen={() => setSelectedCircle(circle)} />
            ))}
          </div>
        </>
      )}

      {/* Discover */}
      <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Découvrir</h2>
      <div className="flex flex-col gap-3">
        {discoverCircles.map((circle) => (
          <CircleCard key={circle.id} circle={circle} onToggleJoin={toggleJoin} onOpen={() => setSelectedCircle(circle)} />
        ))}
      </div>

      {/* Detail dialog */}
      {selectedCircle && (
        <CircleDetailDialog
          circle={selectedCircle}
          onClose={() => setSelectedCircle(null)}
          onToggleJoin={toggleJoin}
        />
      )}
    </div>
  );
}

function CircleCard({
  circle,
  onToggleJoin,
  onOpen,
}: {
  circle: PilatesCircle;
  onToggleJoin: (id: number) => void;
  onOpen: () => void;
}) {
  return (
    <Card
      className="border-none shadow-sm bg-card rounded-2xl cursor-pointer hover:shadow-md transition-shadow"
      onClick={onOpen}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-xl flex-shrink-0">
            {circle.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold text-sm text-foreground truncate">{circle.name}</h3>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onToggleJoin(circle.id); }}
                className={`text-xs font-bold px-3 py-1 rounded-full transition-colors border flex-shrink-0 ${
                  circle.isJoined
                    ? "bg-muted text-muted-foreground border-border"
                    : "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                }`}
              >
                {circle.isJoined ? "Rejoint" : "Rejoindre"}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{circle.description}</p>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex -space-x-1.5">
                {circle.members.slice(0, 4).map((member) => (
                  <Avatar key={member.id} className={`w-5 h-5 border border-card ${member.color}`}>
                    <AvatarFallback className="text-[7px] font-bold text-foreground">{member.initials}</AvatarFallback>
                  </Avatar>
                ))}
                {circle.members.length > 4 && (
                  <div className="w-5 h-5 rounded-full bg-border border border-card flex items-center justify-center text-[7px] font-bold text-muted-foreground">
                    +{circle.members.length - 4}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground/60">{circle.members.length} membres · {circle.totalSessions} sess.</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
