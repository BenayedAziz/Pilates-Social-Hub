import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotificationSettings } from "../NotificationSettings";

// Mock the notifications module
vi.mock("@/lib/notifications", () => ({
  requestNotificationPermission: vi.fn(),
  notify: { kudosReceived: vi.fn() },
}));

// Mock sonner
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { requestNotificationPermission } from "@/lib/notifications";

beforeEach(() => {
  vi.clearAllMocks();
  // Reset permission state
  Object.defineProperty(window, "Notification", {
    writable: true,
    value: class MockNotification {
      static permission: NotificationPermission = "default";
      static requestPermission = vi.fn().mockResolvedValue("granted");
    },
  });
});

describe("NotificationSettings", () => {
  it("renders the Notifications heading", () => {
    render(<NotificationSettings />);
    expect(screen.getByText("Notifications")).toBeInTheDocument();
  });

  it("shows Enable Notifications button when permission is not granted", () => {
    render(<NotificationSettings />);
    expect(screen.getByText("Enable Notifications")).toBeInTheDocument();
  });

  it("shows settings checkboxes when permission is granted", () => {
    Object.defineProperty(window, "Notification", {
      writable: true,
      value: class {
        static permission: NotificationPermission = "granted";
      },
    });

    render(<NotificationSettings />);
    expect(screen.getByText("Booking confirmations & reminders")).toBeInTheDocument();
    expect(screen.getByText("New messages")).toBeInTheDocument();
    expect(screen.getByText("Challenge updates")).toBeInTheDocument();
    expect(screen.getByText("Kudos received")).toBeInTheDocument();
    expect(screen.getByText("Streak reminders")).toBeInTheDocument();
  });

  it("all checkboxes are checked by default", () => {
    Object.defineProperty(window, "Notification", {
      writable: true,
      value: class {
        static permission: NotificationPermission = "granted";
      },
    });

    render(<NotificationSettings />);
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(5);
    checkboxes.forEach((cb) => {
      expect(cb).toBeChecked();
    });
  });

  it("calls requestNotificationPermission when button is clicked", async () => {
    vi.mocked(requestNotificationPermission).mockResolvedValue(true);
    render(<NotificationSettings />);
    fireEvent.click(screen.getByText("Enable Notifications"));
    expect(requestNotificationPermission).toHaveBeenCalledOnce();
  });
});
