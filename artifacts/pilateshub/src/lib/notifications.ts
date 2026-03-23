export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;

  const permission = await Notification.requestPermission();
  return permission === "granted";
}

export function sendLocalNotification(title: string, options?: NotificationOptions) {
  if (Notification.permission !== "granted") return;

  // Use service worker notification if available, else direct
  if (navigator.serviceWorker?.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: "SHOW_NOTIFICATION",
      title,
      options: {
        icon: "/favicon.svg",
        badge: "/favicon.svg",
        ...options,
      },
    });
  } else {
    new Notification(title, {
      icon: "/favicon.svg",
      ...options,
    });
  }
}

// Predefined notification types
export const notify = {
  bookingConfirmed: (studioName: string, time: string) => {
    sendLocalNotification("Booking Confirmed!", {
      body: `Your session at ${studioName} at ${time} is confirmed.`,
      tag: "booking",
    });
  },

  bookingReminder: (studioName: string, className: string, minutesBefore: number) => {
    sendLocalNotification(`Session in ${minutesBefore} minutes`, {
      body: `${className} at ${studioName} starts soon. Don't forget your grip socks!`,
      tag: "reminder",
    });
  },

  newMessage: (senderName: string, preview: string) => {
    sendLocalNotification(`Message from ${senderName}`, {
      body: preview.length > 50 ? `${preview.slice(0, 50)}...` : preview,
      tag: "message",
    });
  },

  challengeUpdate: (challengeName: string, progress: string) => {
    sendLocalNotification(`Challenge Update: ${challengeName}`, {
      body: progress,
      tag: "challenge",
    });
  },

  kudosReceived: (fromName: string) => {
    sendLocalNotification("Good Form!", {
      body: `${fromName} gave you kudos on your session.`,
      tag: "kudos",
    });
  },

  streakReminder: (currentStreak: number) => {
    sendLocalNotification("Don't break your streak!", {
      body: `You're on a ${currentStreak}-day streak. Book a session today to keep it going!`,
      tag: "streak",
    });
  },
};
