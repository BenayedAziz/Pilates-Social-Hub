import { Bell } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { notify, requestNotificationPermission } from "@/lib/notifications";

export function NotificationSettings() {
  const [permission, setPermission] = useState<NotificationPermission>(
    "Notification" in window ? Notification.permission : "denied",
  );

  const enableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setPermission(granted ? "granted" : "denied");
    if (granted) {
      toast.success("Notifications enabled!");
      // Send a test notification
      notify.kudosReceived("PilatesHub");
    } else {
      toast.error("Notifications blocked. Enable them in browser settings.");
    }
  };

  const settings = [
    { key: "bookings", label: "Booking confirmations & reminders", default: true },
    { key: "messages", label: "New messages", default: true },
    { key: "challenges", label: "Challenge updates", default: true },
    { key: "kudos", label: "Kudos received", default: true },
    { key: "streaks", label: "Streak reminders", default: true },
  ];

  return (
    <Card className="border-none shadow-sm">
      <CardContent className="p-5">
        <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" /> Notifications
        </h3>

        {permission !== "granted" ? (
          <button
            type="button"
            onClick={enableNotifications}
            className="w-full py-3 bg-primary/10 text-primary font-bold text-sm rounded-xl hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
          >
            <Bell className="w-4 h-4" /> Enable Notifications
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            {settings.map((s) => (
              <label key={s.key} className="flex items-center justify-between py-2">
                <span className="text-sm text-foreground">{s.label}</span>
                <input type="checkbox" defaultChecked={s.default} className="w-4 h-4 accent-primary rounded" />
              </label>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
