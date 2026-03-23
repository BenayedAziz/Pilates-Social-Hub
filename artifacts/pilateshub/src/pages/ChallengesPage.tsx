import { CheckCircle2, Trophy, Users } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BINGO_CARD, CHALLENGES } from "@/data/mock-data";

export default function ChallengesPage() {
  const [bingoState, setBingoState] = useState(BINGO_CARD);

  const toggleBingo = (id: number) => {
    setBingoState((prev) => prev.map((cell) => (cell.id === id ? { ...cell, completed: !cell.completed } : cell)));
  };

  const completedBingo = bingoState.filter((c) => c.completed).length;

  return (
    <div className="bg-background min-h-full animate-in fade-in duration-300 p-5">
      <h1 className="text-xl font-bold text-foreground mb-4">Challenges</h1>

      <Tabs defaultValue="active">
        <TabsList className="w-full grid grid-cols-2 bg-muted p-1 rounded-xl h-10 mb-4">
          <TabsTrigger
            value="active"
            className="rounded-lg font-bold text-xs data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm"
          >
            Active
          </TabsTrigger>
          <TabsTrigger
            value="bingo"
            className="rounded-lg font-bold text-xs data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm"
          >
            Pilates Bingo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="flex flex-col gap-4 mt-0">
          {CHALLENGES.map((challenge) => {
            const pct = Math.min(Math.round((challenge.progress / challenge.target) * 100), 100);
            return (
              <Card key={challenge.id} className="border-none shadow-sm bg-card rounded-2xl">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-xl flex-shrink-0">
                      {challenge.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold text-sm text-foreground truncate">{challenge.title}</h3>
                        <Badge className="bg-secondary text-primary border-none text-[10px] font-bold flex-shrink-0">
                          {challenge.reward}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{challenge.description}</p>

                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-[10px] font-bold mb-1">
                          <span className="text-primary">
                            {challenge.progress}/{challenge.target}
                          </span>
                          <span className="text-muted-foreground/60">{pct}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground/60 font-medium">
                        <Users className="w-3 h-3" /> {challenge.participants} participating
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="bingo" className="mt-0">
          <Card className="border-none shadow-sm bg-card rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm text-foreground">March Pilates Bingo</h3>
                <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold">
                  {completedBingo}/16
                </Badge>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {bingoState.map((cell) => (
                  <button
                    key={cell.id}
                    type="button"
                    onClick={() => toggleBingo(cell.id)}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center p-1.5 text-center transition-all ${
                      cell.completed
                        ? "bg-primary/15 text-primary border-2 border-primary/30"
                        : "bg-muted/50 text-muted-foreground border-2 border-transparent hover:border-border"
                    }`}
                  >
                    {cell.completed && <CheckCircle2 className="w-4 h-4 mb-0.5" />}
                    <span className="text-[8px] font-bold leading-tight">{cell.text}</span>
                  </button>
                ))}
              </div>

              {completedBingo >= 12 && (
                <div className="mt-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl px-3 py-2 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <p className="text-xs font-bold text-amber-700">
                    Almost there! Complete 4 more for a Bingo Master badge!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
