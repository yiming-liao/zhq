import { describe, it, expect, vi, beforeEach } from "vitest";
import { query } from "@/core/query";
import * as cosineModule from "@/utils/cosine-similarity";
import { tfidf } from "@/utils/tf-idf";

// mock tokenize
vi.mock("@/core/jieba", () => ({
  tokenize: (text: string) => [...text],
}));

describe("query()", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const docItems = [
    { key: "A", content: "aaa" },
    { key: "B", content: "bbb" },
    { key: "C", content: "ccc" },
  ];

  const docItemsTokens = [["a"], ["b"], ["c"]];
  const documentFrequency = { a: 1, b: 1, c: 1 };
  const docItemsVectors = [
    tfidf(["a"], 3, documentFrequency),
    tfidf(["b"], 3, documentFrequency),
    tfidf(["c"], 3, documentFrequency),
  ];

  it("should return bestMatch when score > threshold", () => {
    const result = query({
      docItems,
      docItemsTokens,
      docItemsVectors,
      documentFrequency,
      input: "a",
      threshold: 0.1,
      topKCandidates: 2,
    });

    expect(result.bestMatch?.key).toBe("A");
    expect(result.candidates.map((x) => x.key)).toEqual(["B", "C"]);
  });

  it("should return undefined bestMatch when score ≤ threshold", () => {
    const result = query({
      docItems,
      docItemsTokens,
      docItemsVectors,
      documentFrequency,
      input: "zzz", // 完全不匹配，score ≈ 0
      threshold: 0.5,
      topKCandidates: 2,
    });

    expect(result.bestMatch).toBeUndefined();
    expect(result.candidates).toHaveLength(2);
  });

  it("should return candidates sorted by score", () => {
    vi.spyOn(cosineModule, "cosineSimilarity")
      .mockImplementationOnce(() => 0.1) // A
      .mockImplementationOnce(() => 0.5) // B
      .mockImplementationOnce(() => 0.9); // C

    const result = query({
      docItems,
      docItemsTokens,
      docItemsVectors,
      documentFrequency,
      input: "x",
      threshold: 0,
    });

    expect(result.bestMatch?.key).toBe("C");
  });

  it("should limit candidates based on topKCandidates", () => {
    const result = query({
      docItems,
      docItemsTokens,
      docItemsVectors,
      documentFrequency,
      input: "a",
      topKCandidates: 1,
    });

    expect(result.candidates).toHaveLength(1);
  });

  it("should throw when threshold is out of range", () => {
    expect(() =>
      query({
        docItems,
        docItemsTokens,
        docItemsVectors,
        documentFrequency,
        input: "a",
        threshold: -1,
      }),
    ).toThrow();

    expect(() =>
      query({
        docItems,
        docItemsTokens,
        docItemsVectors,
        documentFrequency,
        input: "a",
        threshold: 2,
      }),
    ).toThrow();
  });
});
