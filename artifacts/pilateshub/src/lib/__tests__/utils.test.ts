import { describe, expect, it } from "vitest";
import { cn } from "../utils";

describe("cn (classname utility)", () => {
  it("merges simple class names", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "extra")).toBe("base extra");
  });

  it("resolves Tailwind conflicts (last wins)", () => {
    const result = cn("px-2", "px-4");
    expect(result).toBe("px-4");
  });

  it("handles undefined and null inputs", () => {
    expect(cn("a", undefined, null, "b")).toBe("a b");
  });

  it("handles empty string inputs", () => {
    expect(cn("a", "", "b")).toBe("a b");
  });

  it("handles array inputs", () => {
    expect(cn(["a", "b"])).toBe("a b");
  });

  it("returns empty string for no inputs", () => {
    expect(cn()).toBe("");
  });
});
