import type { Document, SearchIndex } from "@/types";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { query } from "@/core/query/query";

// --------------------------------------------------
// mocks
// --------------------------------------------------
vi.mock("@/core/query/utils/tokenize-for-search", () => ({
  tokenizeForSearch: (text?: string) => {
    if (!text) return [];
    return text.split(" ");
  },
}));

vi.mock("@/utils/scoring", () => ({
  scoring: (tokens: string[]) => new Map(tokens.map((t) => [t, 1])),
}));

vi.mock("@/utils/cosine-similarity", () => ({
  cosineSimilarity: (a: Map<string, number>, b: Map<string, number>) => {
    let score = 0;
    for (const key of a.keys()) {
      if (b.has(key)) score += 1;
    }
    return score;
  },
}));

// --------------------------------------------------
// tests
// --------------------------------------------------
describe("query (id-based search with score)", () => {
  let documents: Document[];
  let index: SearchIndex;

  beforeEach(() => {
    documents = [
      { id: "1", text: "搜尋 引擎", content: "doc 1" },
      { id: "2", text: "前端 搜尋", content: "doc 2" },
      { id: "3", text: "BM25 文件", content: "doc 3" },
    ];

    index = {
      documentFrequency: { 搜尋: 2, 引擎: 1, 前端: 1, BM25: 1, 文件: 1 },
      documentVectors: new Map([
        [
          "1",
          new Map([
            ["搜尋", 1],
            ["引擎", 1],
          ]),
        ],
        [
          "2",
          new Map([
            ["前端", 1],
            ["搜尋", 1],
          ]),
        ],
        [
          "3",
          new Map([
            ["BM25", 1],
            ["文件", 1],
          ]),
        ],
      ]),
      avgDocLength: 2,
    };
  });

  it("should return not-ready result when documents is empty", () => {
    const res = query([], index, "搜尋", {});
    expect(res.isIndexReady).toBe(false);
    expect(res.bestMatch).toBeUndefined();
    expect(res.candidates).toEqual([]);
  });

  it("should throw when threshold is out of range", () => {
    expect(() => query(documents, index, "搜尋", { threshold: 1.5 })).toThrow();
  });

  it("should return bestMatch with score when score exceeds threshold", () => {
    const res = query(documents, index, "搜尋", { threshold: 0.1 });
    expect(res.isIndexReady).toBe(true);
    expect(res.bestMatch).toBeDefined();
    expect(res.bestMatch!.id).toBe("1");
    expect(res.bestMatch!.score).toBeGreaterThan(0);
  });

  it("should return candidates excluding bestMatch", () => {
    const res = query(documents, index, "搜尋", {
      topKCandidates: 2,
      threshold: 0.1,
    });
    expect(res.bestMatch!.id).toBe("1");
    expect(res.candidates.length).toBeLessThanOrEqual(2);
    expect(res.candidates.some((d) => d.id === "1")).toBe(false);
    res.candidates.forEach((d) => {
      expect(d.score).toBeGreaterThanOrEqual(0);
    });
  });

  it("should return only candidates when bestScore is below threshold", () => {
    const res = query(documents, index, "不存在", { threshold: 0.9 });
    expect(res.isIndexReady).toBe(true);
    expect(res.bestMatch).toBeUndefined();
    expect(res.candidates.length).toBeGreaterThan(0);
    res.candidates.forEach((d) => {
      expect(d.score).toBeGreaterThanOrEqual(0);
    });
  });

  it("should resolve documents strictly by id from index", () => {
    const res = query(documents, index, "BM25", { threshold: 0.1 });
    expect(res.bestMatch).toBeDefined();
    expect(res.bestMatch!.id).toBe("3");
    expect(res.bestMatch!.content).toBe("doc 3");
    expect(res.bestMatch!.score).toBeGreaterThan(0);
  });

  it("should ignore index entries with missing document id", () => {
    const brokenIndex: SearchIndex = {
      ...index,
      documentVectors: new Map([
        ...index.documentVectors,
        ["missing", new Map([["搜尋", 1]])],
      ]),
    };
    const res = query(documents, brokenIndex, "搜尋", { threshold: 0.1 });
    expect(res.bestMatch).toBeDefined();
    expect(res.bestMatch!.id).not.toBe("missing");
  });

  it("should handle empty ranked result and fallback bestScore to 0", () => {
    const emptyIndex: SearchIndex = {
      documentFrequency: {},
      documentVectors: new Map(),
      avgDocLength: 0,
    };
    const documents: Document[] = [{ id: "1", text: "搜尋", content: "doc" }];
    const res = query(documents, emptyIndex, "搜尋", { threshold: 0.1 });
    expect(res.isIndexReady).toBe(true);
    expect(res.bestMatch).toBeUndefined();
    expect(res.candidates.length).toBe(0);
  });
});
