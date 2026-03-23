import { beforeEach, describe, expect, it, vi } from "vitest";
import { notify, requestNotificationPermission, sendLocalNotification } from "../notifications";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("requestNotificationPermission", () => {
  it("returns true when permission is already granted", async () => {
    Object.defineProperty(window, "Notification", {
      writable: true,
      value: class {
        static permission: NotificationPermission = "granted";
        static requestPermission = vi.fn();
      },
    });
    const result = await requestNotificationPermission();
    expect(result).toBe(true);
  });

  it("returns false when permission is denied", async () => {
    Object.defineProperty(window, "Notification", {
      writable: true,
      value: class {
        static permission: NotificationPermission = "denied";
        static requestPermission = vi.fn();
      },
    });
    const result = await requestNotificationPermission();
    expect(result).toBe(false);
  });

  it("requests permission and returns true when granted", async () => {
    Object.defineProperty(window, "Notification", {
      writable: true,
      value: class {
        static permission: NotificationPermission = "default";
        static requestPermission = vi.fn().mockResolvedValue("granted");
      },
    });
    const result = await requestNotificationPermission();
    expect(result).toBe(true);
    expect(Notification.requestPermission).toHaveBeenCalledOnce();
  });

  it("requests permission and returns false when denied", async () => {
    Object.defineProperty(window, "Notification", {
      writable: true,
      value: class {
        static permission: NotificationPermission = "default";
        static requestPermission = vi.fn().mockResolvedValue("denied");
      },
    });
    const result = await requestNotificationPermission();
    expect(result).toBe(false);
  });

  it("returns false when Notification API is not available", async () => {
    const origNotification = (window as any).Notification;
    Object.defineProperty(window, "Notification", {
      writable: true,
      configurable: true,
      value: undefined,
    });
    const result = await requestNotificationPermission();
    expect(result).toBe(false);
    // Restore
    Object.defineProperty(window, "Notification", {
      writable: true,
      configurable: true,
      value: origNotification,
    });
  });
});

describe("sendLocalNotification", () => {
  it("does nothing when permission is not granted", () => {
    Object.defineProperty(window, "Notification", {
      writable: true,
      value: class {
        static permission: NotificationPermission = "denied";
        constructor() {
          throw new Error("Should not be called");
        }
      },
    });
    // Should not throw
    expect(() => sendLocalNotification("test")).not.toThrow();
  });
});

describe("notify helpers", () => {
  it("has all expected notification types", () => {
    expect(typeof notify.bookingConfirmed).toBe("function");
    expect(typeof notify.bookingReminder).toBe("function");
    expect(typeof notify.newMessage).toBe("function");
    expect(typeof notify.challengeUpdate).toBe("function");
    expect(typeof notify.kudosReceived).toBe("function");
    expect(typeof notify.streakReminder).toBe("function");
  });
});
