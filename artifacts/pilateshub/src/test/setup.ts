import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// ---------------------------------------------------------------------------
// Global mocks for jsdom
// ---------------------------------------------------------------------------

// matchMedia (needed by useIsMobile, useTheme, Radix UI, etc.)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// IntersectionObserver (used by Radix UI dialogs, framer-motion, etc.)
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  value: MockIntersectionObserver,
});

// ResizeObserver (used by Radix UI, charts, etc.)
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
Object.defineProperty(window, "ResizeObserver", {
  writable: true,
  value: MockResizeObserver,
});

// Notification API
Object.defineProperty(window, "Notification", {
  writable: true,
  configurable: true,
  value: class MockNotification {
    static permission: NotificationPermission = "default";
    static requestPermission = vi.fn().mockResolvedValue("granted");
    constructor(
      public title: string,
      public options?: NotificationOptions,
    ) {}
  },
});

// scrollTo (called by many scroll-into-view interactions)
window.scrollTo = vi.fn() as any;

// HTMLElement.scrollIntoView
Element.prototype.scrollIntoView = vi.fn();
