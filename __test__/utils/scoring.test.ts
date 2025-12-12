import type { DocumentFrequency } from "@/types";
import { describe, it, expect } from "vitest";
import { scoring } from "@/utils/scoring";

describe("scoring (BM25)", () => {
  const documentFrequency: DocumentFrequency = {
    搜尋: 3,
    前端: 1,
    BM25: 1,
  };

  const ctx = {
    totalDocs: 3,
    documentFrequency,
    avgDocLength: 2,
  };

  it("should return a sparse vector", () => {
    const tokens = ["搜尋", "前端"];
    const vector = scoring(tokens, ctx);

    expect(vector).toBeInstanceOf(Map);
    expect(vector.size).toBeGreaterThan(0);
  });

  it("should include all unique terms in the document", () => {
    const tokens = ["搜尋", "搜尋", "前端"];
    const vector = scoring(tokens, ctx);

    expect(vector.has("搜尋")).toBe(true);
    expect(vector.has("前端")).toBe(true);
  });

  it("should produce higher score for higher term frequency", () => {
    const once = scoring(["搜尋"], ctx);
    const twice = scoring(["搜尋", "搜尋"], ctx);

    expect(twice.get("搜尋")!).toBeGreaterThan(once.get("搜尋")!);
  });

  it("should respect custom BM25 parameters", () => {
    const defaultScore = scoring(["搜尋"], ctx).get("搜尋")!;
    const customScore = scoring(["搜尋"], {
      ...ctx,
      k1: 2,
      b: 0.5,
    }).get("搜尋")!;

    expect(customScore).not.toBe(defaultScore);
  });

  it("should handle empty tokens safely", () => {
    const vector = scoring([], ctx);
    expect(vector.size).toBe(0);
  });

  it("should handle terms missing from documentFrequency", () => {
    const documentFrequency: DocumentFrequency = { 搜尋: 3 };
    const ctx = { totalDocs: 3, documentFrequency, avgDocLength: 2 };
    const tokens = ["搜尋", "新詞"];
    const vector = scoring(tokens, ctx);
    expect(vector.has("搜尋")).toBe(true);
    expect(vector.has("新詞")).toBe(true);
    expect(vector.get("新詞")!).toBeGreaterThan(0);
  });
});
