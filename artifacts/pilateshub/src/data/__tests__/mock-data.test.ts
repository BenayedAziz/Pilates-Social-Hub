import { describe, expect, it } from "vitest";
import { BADGES, CALORIE_DATA, FORUM_POSTS, LEADERBOARD, POSTS, PRODUCTS, STUDIOS, USERS } from "../mock-data";

describe("Mock Data", () => {
  it("has 8 studios with required fields", () => {
    expect(STUDIOS).toHaveLength(8);
    STUDIOS.forEach((studio) => {
      expect(studio.id).toBeGreaterThan(0);
      expect(studio.name).toBeTruthy();
      expect(studio.rating).toBeGreaterThanOrEqual(0);
      expect(studio.rating).toBeLessThanOrEqual(5);
      expect(studio.coaches.length).toBeGreaterThan(0);
    });
  });

  it("has 10 users", () => {
    expect(USERS).toHaveLength(10);
    USERS.forEach((user) => {
      expect(user.initials).toHaveLength(2);
    });
  });

  it("has posts referencing valid users", () => {
    expect(POSTS).toHaveLength(10);
    POSTS.forEach((post) => {
      expect(USERS).toContainEqual(post.user);
    });
  });

  it("has 45 products across 6 categories", () => {
    expect(PRODUCTS).toHaveLength(45);
    const categories = new Set(PRODUCTS.map((p) => p.category));
    expect(categories.size).toBe(6);
  });

  it("has forum posts referencing valid users", () => {
    FORUM_POSTS.forEach((post) => {
      expect(USERS).toContainEqual(post.author);
    });
  });

  it("has leaderboard referencing valid users", () => {
    LEADERBOARD.forEach((entry) => {
      expect(USERS).toContainEqual(entry.user);
    });
  });

  it("has 6 badges", () => {
    expect(BADGES).toHaveLength(6);
  });

  it("has calorie data", () => {
    expect(CALORIE_DATA.length).toBeGreaterThan(0);
  });
});
