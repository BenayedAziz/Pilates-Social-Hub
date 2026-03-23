import { Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ApparatusLevel {
  name: string;
  emoji: string;
  level: "locked" | "beginner" | "intermediate" | "advanced" | "master";
  sessions: number;
  nextAt: number;
  description: string;
}

const APPARATUS_JOURNEY: ApparatusLevel[] = [
  {
    name: "Mat",
    emoji: "\u{1F9D8}",
    level: "advanced",
    sessions: 28,
    nextAt: 35,
    description: "Classical mat work foundation",
  },
  {
    name: "Reformer",
    emoji: "\u{1F3CB}\u{FE0F}",
    level: "intermediate",
    sessions: 15,
    nextAt: 25,
    description: "The iconic Pilates machine",
  },
  {
    name: "Tower",
    emoji: "\u{1F5FC}",
    level: "beginner",
    sessions: 4,
    nextAt: 10,
    description: "Spring-loaded vertical training",
  },
  {
    name: "Cadillac",
    emoji: "\u{1F6CF}\u{FE0F}",
    level: "locked",
    sessions: 0,
    nextAt: 5,
    description: "Advanced trapeze table work",
  },
  {
    name: "Chair",
    emoji: "\u{1FA91}",
    level: "locked",
    sessions: 0,
    nextAt: 5,
    description: "Compact powerhouse training",
  },
];

const LEVEL_CONFIG = {
  locked: { bg: "bg-muted", text: "text-muted-foreground/50", border: "border-border", label: "Locked", pct: 0 },
  beginner: { bg: "bg-primary/8", text: "text-primary", border: "border-primary/30", label: "Beginner", pct: 25 },
  intermediate: {
    bg: "bg-primary/12",
    text: "text-primary",
    border: "border-primary/40",
    label: "Intermediate",
    pct: 50,
  },
  advanced: {
    bg: "bg-accent-cta/10",
    text: "text-accent-cta",
    border: "border-accent-cta/30",
    label: "Advanced",
    pct: 75,
  },
  master: {
    bg: "bg-accent-cta/15",
    text: "text-accent-cta",
    border: "border-accent-cta/40",
    label: "Master",
    pct: 100,
  },
};

export function JourneyMap() {
  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
          {"\u{1F5FA}\u{FE0F}"} Apparatus Journey
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="flex flex-col gap-3">
          {APPARATUS_JOURNEY.map((apparatus, index) => {
            const config = LEVEL_CONFIG[apparatus.level];
            const isLocked = apparatus.level === "locked";
            const progressPct = isLocked ? 0 : Math.min((apparatus.sessions / apparatus.nextAt) * 100, 100);

            return (
              <div key={apparatus.name} className="flex items-center gap-3">
                {/* Connector line */}
                <div className="flex flex-col items-center w-8">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-lg border-2 ${config.border} ${config.bg} ${
                      isLocked ? "opacity-40" : ""
                    }`}
                  >
                    {isLocked ? <Lock className="w-3.5 h-3.5 text-muted-foreground/40" /> : apparatus.emoji}
                  </div>
                  {index < APPARATUS_JOURNEY.length - 1 && (
                    <div className={`w-0.5 h-6 ${isLocked ? "bg-border" : "bg-primary/30"}`} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4
                      className={`font-semibold text-sm ${isLocked ? "text-muted-foreground/60" : "text-foreground"}`}
                    >
                      {apparatus.name}
                    </h4>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${config.bg} ${config.text}`}>
                      {config.label}
                    </span>
                  </div>
                  {!isLocked && (
                    <div className="mt-1.5">
                      <div className="flex justify-between text-[9px] font-semibold mb-0.5">
                        <span className="text-muted-foreground">{apparatus.sessions} sessions</span>
                        <span className="text-muted-foreground/60">Next: {apparatus.nextAt}</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 bg-primary"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {isLocked && <p className="text-[10px] text-muted-foreground/60 mt-0.5">{apparatus.description}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
