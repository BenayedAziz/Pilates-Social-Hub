import { Activity, Heart, Moon, TrendingUp, Watch, Zap } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWearable } from "@/hooks/use-api";

// ---------------------------------------------------------------------------
// Recovery Gauge — circular SVG ring
// ---------------------------------------------------------------------------
function RecoveryGauge({ value }: { value: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 67 ? "hsl(120, 50%, 45%)" : value >= 34 ? "hsl(45, 80%, 50%)" : "hsl(0, 60%, 50%)";

  return (
    <div className="relative w-20 h-20 flex-shrink-0">
      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80" aria-hidden="true">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="5" />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-foreground">{value}%</span>
        <span className="text-[8px] text-muted-foreground font-semibold uppercase tracking-wider">Recovery</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Metric Pill — small stat chip
// ---------------------------------------------------------------------------
function MetricPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 bg-muted/50 rounded-lg px-2 py-1.5">
      <span className="text-primary">{icon}</span>
      <div>
        <p className="text-[10px] text-muted-foreground leading-none">{label}</p>
        <p className="text-xs font-bold text-foreground leading-tight mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// WearableDashboard — main exported component
// ---------------------------------------------------------------------------
export function WearableDashboard() {
  const { data: wearableData, isLoading } = useWearable();

  const data = wearableData ?? {
    connected: false,
    provider: "none" as const,
    lastSync: "",
    recovery: 0,
    strain: 0,
    hrv: 0,
    restingHr: 0,
    sleepScore: 0,
    sleepDuration: 0,
    caloriesBurned: 0,
    activeCalories: 0,
  };

  if (isLoading) return null;

  // Disconnected state — connect CTA
  if (!data.connected) {
    return (
      <Card className="border-none shadow-sm">
        <CardContent className="p-5 text-center">
          <Watch className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-bold text-foreground">Connect Your Wearable</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Link your Whoop, Apple Watch, or Garmin to get personalized insights
          </p>
          <Link href="/settings/wearables">
            <Button className="mt-3">Connect Device</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Recovery-based recommendation
  const recommendation =
    data.recovery >= 67
      ? "Your body is ready for an intense session! Try Advanced Reformer."
      : data.recovery >= 34
        ? "Moderate session recommended. A Reformer Flow would be perfect."
        : "Take it easy today. Try a gentle Mat or Stretch class.";

  return (
    <Card className="border-none shadow-sm overflow-hidden">
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Watch className="w-4 h-4 text-primary" /> Whoop
        </CardTitle>
        <Link href="/settings/wearables">
          <Badge variant="outline" className="text-[10px] cursor-pointer hover:bg-muted/50 transition-colors">
            Synced {data.lastSync}
          </Badge>
        </Link>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        {/* Top row: gauge + metrics */}
        <div className="flex items-center gap-4">
          <RecoveryGauge value={data.recovery} />
          <div className="flex-1 grid grid-cols-2 gap-2">
            <MetricPill icon={<Zap className="w-3 h-3" />} label="Strain" value={data.strain.toFixed(1)} />
            <MetricPill icon={<Heart className="w-3 h-3" />} label="HRV" value={`${data.hrv}ms`} />
            <MetricPill icon={<Activity className="w-3 h-3" />} label="RHR" value={`${data.restingHr}bpm`} />
            <MetricPill icon={<Moon className="w-3 h-3" />} label="Sleep" value={`${data.sleepDuration}h`} />
          </div>
        </div>

        {/* AI Recommendation */}
        <div className="mt-3 bg-primary/[0.08] rounded-xl px-3 py-2.5">
          <p className="text-xs font-semibold text-primary flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3 flex-shrink-0" />
            <span>{recommendation}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
