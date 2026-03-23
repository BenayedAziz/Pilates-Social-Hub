import { StudioAnalytics } from "@/components/StudioAnalytics";

export default function StudioAnalyticsPage() {
  return (
    <div className="bg-background min-h-full animate-in fade-in duration-300 p-5">
      <h1 className="text-xl font-bold text-foreground mb-5">Studio Analytics</h1>
      <StudioAnalytics />
    </div>
  );
}
