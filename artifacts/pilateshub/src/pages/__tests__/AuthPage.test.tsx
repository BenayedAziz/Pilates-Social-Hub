import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AuthPage from "../AuthPage";

// Mock AuthContext
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    login: vi.fn().mockResolvedValue(true),
    signup: vi.fn().mockResolvedValue(true),
  }),
}));

// Mock i18n
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "auth.signIn": "Sign In",
        "auth.signUp": "Sign Up",
        "auth.email": "Email",
        "auth.password": "Password",
        "auth.name": "Name",
        "auth.welcomeBack": "Welcome back!",
        "auth.invalidCredentials": "Invalid credentials",
      };
      return translations[key] || key;
    },
  }),
}));

// Mock sonner
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// Mock Radix Tabs
vi.mock("@/components/ui/tabs", () => ({
  Tabs: ({ children, defaultValue }: any) => (
    <div data-testid="tabs" data-value={defaultValue}>
      {children}
    </div>
  ),
  TabsList: ({ children }: any) => <div role="tablist">{children}</div>,
  TabsTrigger: ({ children, value }: any) => (
    <button role="tab" data-value={value}>
      {children}
    </button>
  ),
  TabsContent: ({ children }: any) => <div>{children}</div>,
}));

describe("AuthPage", () => {
  it("renders without crashing", () => {
    render(<AuthPage />);
    expect(screen.getByTestId("tabs")).toBeInTheDocument();
  });

  it("renders sign in and sign up tabs", () => {
    render(<AuthPage />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs.length).toBeGreaterThanOrEqual(2);
  });

  it("renders email and password inputs", () => {
    render(<AuthPage />);
    // Multiple forms have email/password
    const emailInputs = screen.getAllByRole("textbox");
    expect(emailInputs.length).toBeGreaterThan(0);
  });

  it("renders the PilatesHub branding", () => {
    render(<AuthPage />);
    // The page should contain the Activity icon / PilatesHub branding
    expect(document.querySelector("svg")).not.toBeNull();
  });
});
