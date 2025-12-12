import type { Document } from "@/types";
import { describe, it, expect, vi } from "vitest";
import { buildIndex } from "@/core/build-index";

vi.mock("@/core/jieba", () => ({
  tokenize: (text: string) => text.split(" "),
}));

describe("buildIndex (id-based SearchIndex)", () => {
  const docs: Document[] = [
    {
      id: "1",
      text: "搜尋 引擎",
      content: "doc 1",
    },
    {
      id: "2",
      text: "搜尋 前端",
      content: "doc 2",
    },
    {
      id: "3",
      text: "BM25 搜尋",
      content: "doc 3",
    },
  ];

  it("should build document frequency correctly", () => {
    const { documentFrequency } = buildIndex(docs);
    expect(documentFrequency["搜尋"]).toBe(3);
    expect(documentFrequency["引擎"]).toBe(1);
    expect(documentFrequency["前端"]).toBe(1);
    expect(documentFrequency["BM25"]).toBe(1);
  });

  it("should compute avgDocLength", () => {
    const { avgDocLength } = buildIndex(docs);
    expect(avgDocLength).toBeGreaterThan(0);
  });

  it("should build vectors mapped by document id", () => {
    const { documentVectors } = buildIndex(docs);
    expect(documentVectors.size).toBe(docs.length);
    for (const doc of docs) {
      const vector = documentVectors.get(doc.id);
      expect(vector).toBeDefined();
      expect(vector).toBeInstanceOf(Map);
      expect(vector!.size).toBeGreaterThan(0);
    }
  });

  it("should return empty index for empty input", () => {
    const { documentFrequency, documentVectors, avgDocLength } = buildIndex([]);
    expect(documentFrequency).toEqual({});
    expect(documentVectors.size).toBe(0);
    expect(avgDocLength).toBe(0);
  });
});
