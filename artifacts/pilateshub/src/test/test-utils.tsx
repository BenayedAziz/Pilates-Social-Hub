/**
 * Shared test utilities — providers, mocks, and helpers used across test files.
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type RenderOptions, render } from "@testing-library/react";
import type { ReactElement } from "react";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider } from "@/context/AuthContext";

// ---------------------------------------------------------------------------
// Fresh QueryClient per test (prevents cross-test cache leaks)
// ---------------------------------------------------------------------------
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

// ---------------------------------------------------------------------------
// All-providers wrapper
// ---------------------------------------------------------------------------
export function AllProviders({ children }: { children: React.ReactNode }) {
  const qc = createTestQueryClient();
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <AppProvider>{children}</AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

// ---------------------------------------------------------------------------
// Query-only wrapper (no Auth/App — useful for hook tests)
// ---------------------------------------------------------------------------
export function QueryWrapper({ children }: { children: React.ReactNode }) {
  const qc = createTestQueryClient();
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

// ---------------------------------------------------------------------------
// Custom render that wraps with AllProviders
// ---------------------------------------------------------------------------
export function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) {
  return render(ui, { wrapper: AllProviders, ...options });
}

// ---------------------------------------------------------------------------
// Mock fetch helper
// ---------------------------------------------------------------------------
export function mockFetchOnce(data: unknown, ok = true) {
  (globalThis.fetch as ReturnType<typeof import("vitest").vi.fn>).mockResolvedValueOnce({
    ok,
    status: ok ? 200 : 400,
    json: async () => data,
  });
}

export function mockFetchError(message = "Network error") {
  (globalThis.fetch as ReturnType<typeof import("vitest").vi.fn>).mockRejectedValueOnce(new Error(message));
}
