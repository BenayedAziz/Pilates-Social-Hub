import { useState } from "react";
import { ArrowLeft, Check, ChevronRight, Unplug, Watch } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWearable } from "@/hooks/use-api";
import { GenericPageSkeleton } from "@/components/PageSkeleton";

// ---------------------------------------------------------------------------
// Integration definitions
// ---------------------------------------------------------------------------
interface Integration {
  name: string;
  icon: string;
  description: string;
  status: "connected" | "available" | "coming_soon";
}

const INTEGRATIONS: Integration[] = [
  {
    name: "Whoop",
    icon: "\u{231A}",
    description: "Recovery, strain, HRV, sleep",
    status: "connected",
  },
  {
    name: "Apple Watch",
    icon: "\u{2328}",
    description: "Heart rate, workouts, activity rings",
    status: "available",
  },
  {
    name: "Garmin",
    icon: "\u{1F3D4}",
    description: "Heart rate, stress, body battery",
    status: "available",
  },
  {
    name: "Oura Ring",
    icon: "\u{1F48D}",
    description: "Sleep, readiness, activity",
    status: "coming_soon",
  },
  {
    name: "Fitbit",
    icon: "\u{1F4F1}",
    description: "Heart rate, sleep, stress",
    status: "coming_soon",
  },
];

// ---------------------------------------------------------------------------
// Data permission toggle row
// ---------------------------------------------------------------------------
function PermissionToggle({
  label,
  description,
  enabled,
  onToggle,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        role="switch"
        aria-checked={enabled}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
          enabled ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------
export default function WearableSettingsPage() {
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

  if (isLoading) return <GenericPageSkeleton />;

  const [permissions, setPermissions] = useState({
    heartRate: true,
    sleep: true,
    recovery: true,
    strain: true,
    hrv: true,
  });

  const togglePermission = (key: keyof typeof permissions) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
    toast.success("Permission updated");
  };

  return (
    <div className="bg-background min-h-full animate-in fade-in duration-300">
      {/* Header */}
      <div
        className="relative px-5 pt-7 pb-5 flex items-center gap-3 overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, hsl(38 42% 97%) 0%, hsl(33 25% 93%) 50%, hsl(28 20% 91%) 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 20%, hsl(28 22% 38%) 0%, transparent 50%)",
          }}
        />
        <Link href="/me">
          <button
            type="button"
            className="p-2 -ml-2 text-muted-foreground hover:text-primary transition-colors relative z-10"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <div className="relative z-10">
          <h1 className="text-lg font-bold text-foreground">Connected Devices</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your wearable integrations
          </p>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-6">
        {/* Connected Device Card */}
        {data.connected && (
          <Card className="border-none shadow-sm overflow-hidden">
            <div
              className="h-1"
              style={{
                background:
                  "linear-gradient(90deg, hsl(120, 50%, 45%) 0%, hsl(120, 40%, 55%) 100%)",
              }}
            />
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Watch className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-foreground">
                      Whoop 4.0
                    </h3>
                    <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px] font-bold">
                      Connected
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Last sync: {data.lastSync}
                  </p>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="bg-muted/50 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-muted-foreground font-medium">
                    Recovery
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {data.recovery}%
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-muted-foreground font-medium">
                    HRV
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {data.hrv}ms
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-muted-foreground font-medium">
                    Strain
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {data.strain.toFixed(1)}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full mt-3 text-rose-500 hover:text-rose-600 hover:bg-rose-50 font-bold text-xs"
                onClick={() => toast.warning("Device disconnected (mock)")}
              >
                <Unplug className="w-3.5 h-3.5 mr-1" />
                Disconnect
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Available Integrations */}
        <div>
          <h2 className="text-xs font-bold text-muted-foreground/60 uppercase tracking-wider mb-3 px-1">
            Available Integrations
          </h2>
          <Card className="border-none shadow-sm">
            <CardContent className="p-0 divide-y divide-border/40">
              {INTEGRATIONS.map((device) => (
                <div
                  key={device.name}
                  className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-muted/60 flex items-center justify-center text-lg flex-shrink-0">
                    {device.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-foreground">
                      {device.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {device.description}
                    </p>
                  </div>
                  {device.status === "connected" ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px] font-bold flex-shrink-0">
                      <Check className="w-3 h-3 mr-0.5" />
                      Connected
                    </Badge>
                  ) : device.status === "available" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs font-bold flex-shrink-0"
                      onClick={() =>
                        toast.info(
                          `${device.name} connection initiated (mock)`,
                        )
                      }
                    >
                      Connect
                      <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </Button>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-[10px] text-muted-foreground/60 font-bold flex-shrink-0"
                    >
                      Coming Soon
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Data Sharing Permissions */}
        <div>
          <h2 className="text-xs font-bold text-muted-foreground/60 uppercase tracking-wider mb-3 px-1">
            Data Sharing
          </h2>
          <Card className="border-none shadow-sm">
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-sm font-bold text-foreground">
                Permissions
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Choose which health metrics PilatesHub can access
              </p>
            </CardHeader>
            <CardContent className="p-4 pt-2 divide-y divide-border/40">
              <PermissionToggle
                label="Heart Rate"
                description="Resting HR, workout HR, and zones"
                enabled={permissions.heartRate}
                onToggle={() => togglePermission("heartRate")}
              />
              <PermissionToggle
                label="Sleep"
                description="Sleep duration, quality, and stages"
                enabled={permissions.sleep}
                onToggle={() => togglePermission("sleep")}
              />
              <PermissionToggle
                label="Recovery"
                description="Daily recovery score and trends"
                enabled={permissions.recovery}
                onToggle={() => togglePermission("recovery")}
              />
              <PermissionToggle
                label="Strain"
                description="Daily strain, workout strain"
                enabled={permissions.strain}
                onToggle={() => togglePermission("strain")}
              />
              <PermissionToggle
                label="HRV"
                description="Heart rate variability readings"
                enabled={permissions.hrv}
                onToggle={() => togglePermission("hrv")}
              />
            </CardContent>
          </Card>
        </div>

        {/* Privacy note */}
        <p className="text-[10px] text-muted-foreground/40 font-medium text-center px-4 pb-4">
          Your health data is encrypted and never shared with third parties.
          PilatesHub uses it only to personalize your experience.
        </p>
      </div>
    </div>
  );
}
