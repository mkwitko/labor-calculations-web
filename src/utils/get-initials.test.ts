import { describe, it, expect } from "vitest";
import { getInitials } from "./get-initials";

describe("getInitials", () => {
  it("returns first two initials for a full name", () => {
    expect(getInitials("John Doe")).toBe("JD");
  });

  it("returns only available initials when fewer words than limit", () => {
    expect(getInitials("Alice")).toBe("A");
  });

  it("respects a custom limit", () => {
    expect(getInitials("John Michael Doe", 3)).toBe("JMD");
    expect(getInitials("John Michael Doe", 1)).toBe("J");
  });

  it("uppercases the result", () => {
    expect(getInitials("jane doe")).toBe("JD");
  });

  it("clamps to limit even with many words", () => {
    expect(getInitials("A B C D E")).toBe("AB");
  });

  it("handles an empty string", () => {
    expect(getInitials("")).toBe("");
  });
});
