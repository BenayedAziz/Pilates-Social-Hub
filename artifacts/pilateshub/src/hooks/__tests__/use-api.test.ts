import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryWrapper } from "@/test/test-utils";
import {
  useBadges,
  useBingoCard,
  useBookings,
  useBrands,
  useCalorieData,
  useChallenges,
  useCircles,
  useClasses,
  useCoaches,
  useCurrentUser,
  useFeed,
  useForum,
  useGoogleReviews,
  useLeaderboard,
  useProducts,
  useStudio,
  useStudioCheckins,
  useStudioReviews,
  useStudios,
  useWearable,
} from "../use-api";

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
  localStorage.clear();
});

function mockOk(data: unknown) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => data,
  });
}

function mockError(status = 400, message = "Bad request") {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status,
    statusText: "Bad Request",
    json: async () => ({ message }),
  });
}

describe("use-api hooks", () => {
  // ------------------------------------------------------------------
  // useStudios
  // ------------------------------------------------------------------
  describe("useStudios", () => {
    it("calls /api/studios with default params when no args", async () => {
      mockOk([{ id: 1, name: "Studio A" }]);
      const { result } = renderHook(() => useStudios(), { wrapper: QueryWrapper });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("/api/studios?"), expect.anything());
      // Default Paris coords
      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain("lat=48.856");
      expect(url).toContain("lng=2.352");
    });

    it("includes bounding-box params when bounds provided", async () => {
      mockOk([]);
      const bounds = { sw_lat: 48.8, sw_lng: 2.3, ne_lat: 48.9, ne_lng: 2.4 };
      const { result } = renderHook(
        () => useStudios(undefined, undefined, undefined, undefined, undefined, undefined, bounds),
        {
          wrapper: QueryWrapper,
        },
      );
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain("sw_lat=48.8");
      expect(url).toContain("ne_lng=2.4");
    });

    it("normalizes studio fields (lat/lng fallback)", async () => {
      mockOk([{ id: 1, name: "S", latitude: 48.1, longitude: 2.1 }]);
      const { result } = renderHook(() => useStudios(), { wrapper: QueryWrapper });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data![0].lat).toBe(48.1);
      expect(result.current.data![0].lng).toBe(2.1);
    });

    it("includes query param when search string given", async () => {
      mockOk([]);
      const { result } = renderHook(() => useStudios("yoga"), { wrapper: QueryWrapper });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain("q=yoga");
    });
  });

  // ------------------------------------------------------------------
  // useStudio
  // ------------------------------------------------------------------
  describe("useStudio", () => {
    it("calls /api/studios/:id", async () => {
      mockOk({ id: 42, name: "Test Studio" });
      const { result } = renderHook(() => useStudio(42), { wrapper: QueryWrapper });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("/api/studios/42"), expect.anything());
      expect(result.current.data.name).toBe("Test Studio");
    });
  });

  // ------------------------------------------------------------------
  // useClasses
  // ------------------------------------------------------------------
  describe("useClasses", () => {
    it("calls /api/classes without params", async () => {
      mockOk([{ id: 1, name: "Mat" }]);
      const { result } = renderHook(() => useClasses(), { wrapper: QueryWrapper });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("/api/classes"), expect.anything());
    });

    it("passes studioId and type when provided", async () => {
      mockOk([]);
      const { result } = renderHook(() => useClasses(5, "reformer"), { wrapper: QueryWrapper });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain("studioId=5");
      expect(url).toContain("type=reformer");
    });
  });

  // ------------------------------------------------------------------
  // useFeed
  // ------------------------------------------------------------------
  describe("useFeed", () => {
    it("calls /api/feed", async () => {
      mockOk([{ id: 1, text: "hi" }]);
      const { result } = renderHook(() => useFeed(), { wrapper: QueryWrapper });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("/api/feed"), expect.anything());
    });
  });

  // ------------------------------------------------------------------
  // useForum
  // ------------------------------------------------------------------
  describe("useForum", () => {
    it("calls /api/forum without category", async () => {
      mockOk([]);
      const { result } = renderHook(() => useForum(), { wrapper: QueryWrapper });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toBe("/api/forum");
    });

    it("includes category param", async () => {
      mockOk([]);
      const { result } = renderHook(() => useForum("Equipment"), { wrapper: QueryWrapper });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain("category=Equipment");
    });

    it('ignores "All" as category', async () => {
      mockOk([]);
      const { result } = renderHook(() => useForum("All"), { wrapper: QueryWrapper });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toBe("/api/forum");
    });
  });

  // ------------------------------------------------------------------
  // useProducts
  // ------------------------------------------------------------------
  describe("useProducts", () => {
    it("calls /api/products", async () => {
      mockOk([{ id: 1, name: "Grip Socks" }]);
      const { result } = renderHook(() => useProducts(), { wrapper: QueryWrapper });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("/api/products"), expect.anything());
    });

    it("normalizes imageUrl and rating defaults", async () => {
      mockOk([{ id: 1, name: "P" }]);
      const { result } = renderHook(() => useProducts(), { wrapper: QueryWrapper });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data![0].imageUrl).toBe("");
      expect(result.current.data![0].rating).toBe(0);
    });
  });

  // ------------------------------------------------------------------
  // useBookings
  // ------------------------------------------------------------------
  describe("useBookings", () => {
    it("calls /api/bookings", async () => {
      mockOk([]);
      const { result } = renderHook(() => useBookings(), { wrapper: QueryWrapper });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("/api/bookings"), expect.anything());
    });
  });

  // ------------------------------------------------------------------
  // useBrands
  // ------------------------------------------------------------------
  describe("useBrands", () => {
    it("calls /api/brands", async () => {
      mockOk([{ id: 1, name: "Balanced Body" }]);
      const { result } = renderHook(() => useBrands(), { wrapper: QueryWrapper });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("/api/brands"), expect.anything());
    });
  });

  // ------------------------------------------------------------------
  // useCoaches
  // ------------------------------------------------------------------
  describe("useCoaches", () => {
    it("calls /api/coaches", async () => {
      mockOk([]);
      const { result } = renderHook(() => useCoaches(), { wrapper: QueryWrapper });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("/api/coaches"), expect.anything());
    });
  });

  // ------------------------------------------------------------------
  // useChallenges
  // ------------------------------------------------------------------
  describe("useChallenges", () => {
    it("calls /api/challenges", async () => {
      mockOk([]);
      const { result } = renderHook(() => useChallenges(), { wrapper: QueryWrapper });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("/api/challenges"), expect.anything());
    });
  });

  // ------------------------------------------------------------------
  // useBingoCard
  // ------------------------------------------------------------------
  describe("useBingoCard", () => {
    it("calls /api/bingo", async () => {
      mockOk([]);
      const { result } = renderHook(() => useBingoCard(), { wrapper: QueryWrapper });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("/api/bingo"), expect.anything());
    });
  });

  // ------------------------------------------------------------------
  // useBadges
  // ------------------------------------------------------------------
  describe("useBadges", () => {
    it("calls /api/badges and maps icon names to emoji", async () => {
      mockOk([{ id: 1, name: "Fire Starter", iconName: "flame" }]);
      const { result } = renderHook(() => useBadges(), { wrapper: QueryWrapper });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      // flame -> fire emoji
      expect(result.current.data![0].icon).toContain("\uD83D\uDD25");
    });

    it("falls back to star emoji for unknown icon", async () => {
      mockOk([{ id: 1, name: "Unknown", iconName: "nonexistent" }]);
      const { result } = renderHook(() => useBadges(), { wrapper: QueryWrapper });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data![0].icon).toBe("\u2B50");
    });
  });

  // ------------------------------------------------------------------
  // useLeaderboard
  // ------------------------------------------------------------------
  describe("useLeaderboard", () => {
    it("calls /api/leaderboard", async () => {
      mockOk([]);
      const { result } = renderHook(() => useLeaderboard(), { wrapper: QueryWrapper });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("/api/leaderboard"), expect.anything());
    });
  });

  // ------------------------------------------------------------------
  // useCalorieData
  // ------------------------------------------------------------------
  describe("useCalorieData", () => {
    it("calls /api/calorie-data", async () => {
      mockOk([]);
      const { result } = renderHook(() => useCalorieData(), { wrapper: QueryWrapper });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("/api/calorie-data"), expect.anything());
    });
  });

  // ------------------------------------------------------------------
  // useCircles
  // ------------------------------------------------------------------
  describe("useCircles", () => {
    it("calls /api/circles", async () => {
      mockOk([]);
      const { result } = renderHook(() => useCircles(), { wrapper: QueryWrapper });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("/api/circles"), expect.anything());
    });
  });

  // ------------------------------------------------------------------
  // useWearable
  // ------------------------------------------------------------------
  describe("useWearable", () => {
    it("calls /api/wearable", async () => {
      mockOk({ connected: true, recovery: 78 });
      const { result } = renderHook(() => useWearable(), { wrapper: QueryWrapper });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("/api/wearable"), expect.anything());
    });
  });

  // ------------------------------------------------------------------
  // useStudioReviews
  // ------------------------------------------------------------------
  describe("useStudioReviews", () => {
    it("calls /api/studios/:id/reviews", async () => {
      mockOk([]);
      const { result } = renderHook(() => useStudioReviews(7), { wrapper: QueryWrapper });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("/api/studios/7/reviews"), expect.anything());
    });
  });

  // ------------------------------------------------------------------
  // useGoogleReviews
  // ------------------------------------------------------------------
  describe("useGoogleReviews", () => {
    it("calls /api/studios/:id/google-reviews", async () => {
      mockOk([]);
      const { result } = renderHook(() => useGoogleReviews(3), { wrapper: QueryWrapper });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/studios/3/google-reviews"),
        expect.anything(),
      );
    });
  });

  // ------------------------------------------------------------------
  // useStudioCheckins
  // ------------------------------------------------------------------
  describe("useStudioCheckins", () => {
    it("calls /api/studios/:id/checkins", async () => {
      mockOk([]);
      const { result } = renderHook(() => useStudioCheckins(5), { wrapper: QueryWrapper });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("/api/studios/5/checkins"), expect.anything());
    });
  });

  // ------------------------------------------------------------------
  // useCurrentUser
  // ------------------------------------------------------------------
  describe("useCurrentUser", () => {
    it("calls /api/auth/me", async () => {
      mockOk({ id: 1, email: "test@test.com" });
      const { result } = renderHook(() => useCurrentUser(), { wrapper: QueryWrapper });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("/api/auth/me"), expect.anything());
    });

    it("does not retry on failure", async () => {
      mockError(401, "Unauthorized");
      const { result } = renderHook(() => useCurrentUser(), { wrapper: QueryWrapper });
      await waitFor(() => expect(result.current.isError).toBe(true));
      // Only 1 call — no retries
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  // ------------------------------------------------------------------
  // Auth header
  // ------------------------------------------------------------------
  describe("Authorization header", () => {
    it("includes Bearer token when stored", async () => {
      localStorage.setItem("pilateshub-token", "my-jwt");
      mockOk([]);
      const { result } = renderHook(() => useFeed(), { wrapper: QueryWrapper });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      const headers = mockFetch.mock.calls[0][1].headers;
      expect(headers.Authorization).toBe("Bearer my-jwt");
    });

    it("omits Authorization when no token", async () => {
      mockOk([]);
      const { result } = renderHook(() => useFeed(), { wrapper: QueryWrapper });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      const headers = mockFetch.mock.calls[0][1].headers;
      expect(headers.Authorization).toBeUndefined();
    });
  });

  // ------------------------------------------------------------------
  // Error handling
  // ------------------------------------------------------------------
  describe("error handling", () => {
    it("throws with server error message", async () => {
      mockError(500, "Internal error");
      const { result } = renderHook(() => useFeed(), { wrapper: QueryWrapper });
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe("Internal error");
    });
  });
});
