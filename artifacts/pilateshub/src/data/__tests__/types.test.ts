/**
 * Verify that types.ts exports all expected interfaces.
 *
 * These are compile-time checks: if a type is removed or renamed the
 * import will fail and the test file won't build, which Vitest surfaces
 * as a test failure. The runtime assertions confirm the imports resolve.
 */
import { describe, expect, it } from "vitest";
import type {
  AppUser,
  BadgeItem,
  BingoCell,
  Brand,
  CalorieDataPoint,
  Challenge,
  CoachProfile,
  ForumPost,
  LeaderboardEntry,
  PilatesCircle,
  Post,
  Product,
  Studio,
  StudioCheckin,
  StudioReview,
  WearableData,
  WorkoutMetrics,
} from "../types";

describe("types.ts exports", () => {
  it("exports Studio interface", () => {
    const studio: Studio = {
      id: 1,
      name: "Test",
      neighborhood: "N",
      rating: 4.5,
      reviews: 10,
      price: 40,
      distance: 1,
      coords: { x: 0, y: 0 },
      lat: 48,
      lng: 2,
      description: "",
      coaches: [],
      imageUrl: "",
    };
    expect(studio.id).toBe(1);
  });

  it("exports AppUser interface", () => {
    const user: AppUser = { id: 1, name: "Test", initials: "T", color: "bg-blue" };
    expect(user.name).toBe("Test");
  });

  it("exports Post interface", () => {
    const post: Post = {
      id: 1,
      user: { id: 1, name: "U", initials: "U", color: "" },
      type: "Reformer",
      studio: "S",
      duration: 55,
      calories: 300,
      likes: 0,
      comments: 0,
      timeAgo: "1h",
      hasPhoto: false,
    };
    expect(post.type).toBe("Reformer");
  });

  it("exports CalorieDataPoint interface", () => {
    const dp: CalorieDataPoint = { week: "W1", calories: 2000 };
    expect(dp.week).toBe("W1");
  });

  it("exports BadgeItem interface", () => {
    const badge: BadgeItem = { id: 1, name: "B", icon: null, earned: true, description: "" };
    expect(badge.earned).toBe(true);
  });

  it("exports ForumPost interface", () => {
    const fp: ForumPost = {
      id: 1,
      title: "Title",
      category: "General",
      author: { id: 1, name: "A", initials: "A", color: "" },
      flair: "",
      upvotes: 0,
      comments: 0,
      timeAgo: "5m",
    };
    expect(fp.title).toBe("Title");
  });

  it("exports Product interface", () => {
    const p: Product = {
      id: 1,
      name: "P",
      brand: "B",
      price: 10,
      rating: 5,
      category: "C",
      image: "",
      imageUrl: "",
    };
    expect(p.price).toBe(10);
  });

  it("exports LeaderboardEntry interface", () => {
    const e: LeaderboardEntry = {
      rank: 1,
      user: { id: 1, name: "E", initials: "E", color: "" },
      sessions: 10,
      calories: 3000,
    };
    expect(e.rank).toBe(1);
  });

  it("exports Brand interface", () => {
    const b: Brand = {
      id: 1,
      name: "B",
      slug: "b",
      description: "",
      logoEmoji: "",
      coverImageUrl: "",
      category: "",
      rating: 4,
      productCount: 5,
      founded: "2020",
      origin: "FR",
      highlight: "",
      verified: true,
    };
    expect(b.verified).toBe(true);
  });

  it("exports Challenge interface", () => {
    const c: Challenge = {
      id: 1,
      title: "C",
      description: "",
      type: "monthly",
      startDate: "2024-01-01",
      endDate: "2024-01-31",
      target: 10,
      progress: 3,
      participants: 50,
      reward: "",
      icon: "",
    };
    expect(c.type).toBe("monthly");
  });

  it("exports BingoCell interface", () => {
    const cell: BingoCell = { id: 1, text: "Cell", completed: false };
    expect(cell.completed).toBe(false);
  });

  it("exports PilatesCircle interface", () => {
    const circle: PilatesCircle = {
      id: 1,
      name: "Circle",
      description: "",
      emoji: "",
      members: [],
      totalSessions: 0,
      totalCalories: 0,
      isJoined: false,
    };
    expect(circle.isJoined).toBe(false);
  });

  it("exports StudioCheckin interface", () => {
    const ci: StudioCheckin = {
      studioId: 1,
      userId: 1,
      userName: "U",
      userInitials: "U",
      userColor: "",
      checkins: 5,
      lastVisit: "2024-01-01",
    };
    expect(ci.checkins).toBe(5);
  });

  it("exports StudioReview interface", () => {
    const r: StudioReview = {
      id: 1,
      studioId: 1,
      userId: 1,
      userName: "U",
      userInitials: "U",
      userColor: "",
      rating: 5,
      text: "",
      date: "",
      helpful: 0,
    };
    expect(r.rating).toBe(5);
  });

  it("exports CoachProfile interface", () => {
    const cp: CoachProfile = {
      id: 1,
      name: "Coach",
      slug: "coach",
      bio: "",
      specialties: [],
      studioIds: [],
      rating: 5,
      reviewCount: 0,
      yearsExperience: 3,
      certifications: [],
      avatarColor: "",
      initials: "C",
      imageUrl: "",
      sessionsCount: 100,
      quote: "",
    };
    expect(cp.name).toBe("Coach");
  });

  it("exports WearableData interface", () => {
    const wd: WearableData = {
      connected: true,
      provider: "whoop",
      lastSync: "",
      recovery: 78,
      strain: 10,
      hrv: 55,
      restingHr: 52,
      sleepScore: 85,
      sleepDuration: 7.5,
      caloriesBurned: 2000,
      activeCalories: 800,
    };
    expect(wd.provider).toBe("whoop");
  });

  it("exports WorkoutMetrics interface", () => {
    const wm: WorkoutMetrics = {
      avgHeartRate: 130,
      maxHeartRate: 170,
      strain: 12,
      calories: 350,
      duration: 55,
      zones: [{ zone: "Z1", minutes: 10, color: "green" }],
    };
    expect(wm.avgHeartRate).toBe(130);
  });
});
