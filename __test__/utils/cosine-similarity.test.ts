import { describe, it, expect } from "vitest";
import { cosineSimilarity } from "../../src/utils/cosine-similarity";

describe("cosineSimilarity", () => {
  it("should return 1 for identical vectors", () => {
    const a = new Map([
      ["apple", 1],
      ["banana", 2],
    ]);
    const b = new Map([
      ["apple", 1],
      ["banana", 2],
    ]);
    expect(cosineSimilarity(a, b)).toBeCloseTo(1);
  });

  it("should return 0 for orthogonal vectors", () => {
    const a = new Map([
      ["apple", 1],
      ["banana", 0],
    ]);
    const b = new Map([
      ["apple", 0],
      ["banana", 1],
    ]);
    expect(cosineSimilarity(a, b)).toBeCloseTo(0);
  });

  it("should handle partial overlap", () => {
    const a = new Map([
      ["apple", 1],
      ["banana", 1],
    ]);
    const b = new Map([
      ["apple", 1],
      ["orange", 1],
    ]);
    const result = cosineSimilarity(a, b);
    // 預期小於 1，但大於 0
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(1);
  });

  it("should handle two empty vectors", () => {
    const a = new Map<string, number>();
    const b = new Map<string, number>();
    expect(cosineSimilarity(a, b)).toBe(0);
  });

  it("should handle one empty vector", () => {
    const a = new Map([["apple", 1]]);
    const b = new Map<string, number>();
    expect(cosineSimilarity(a, b)).toBe(0);
  });
});
