import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildIndex } from "@/core/build-index";
import * as jiebaModule from "@/core/jieba";
import * as tfidfModule from "@/utils/tf-idf";

describe("buildIndex", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockTokenize = vi
    .spyOn(jiebaModule, "tokenize")
    .mockImplementation((text?: string) => {
      return text ? [...text] : [];
    });

  const mockTfidf = vi
    .spyOn(tfidfModule, "tfidf")
    .mockImplementation(() => new Map([["x", 1]]));

  it("should tokenize each doc.key and build frequency table", () => {
    const docItems = [
      { key: "天氣", content: "" },
      { key: "天好", content: "" },
    ];
    const result = buildIndex(docItems);
    expect(mockTokenize).toHaveBeenCalledTimes(2);
    expect(result.documentFrequency).toEqual({
      天: 2,
      氣: 1,
      好: 1,
    });
    expect(result.docItemsTokens).toEqual([
      ["天", "氣"],
      ["天", "好"],
    ]);
  });

  it("should compute tfidf vectors for each document", () => {
    const docItems = [
      { key: "ABC", content: "" },
      { key: "DEF", content: "" },
    ];
    const result = buildIndex(docItems);
    expect(mockTfidf).toHaveBeenCalledTimes(2);
    expect(result.docItemsVectors).toEqual([
      new Map([["x", 1]]),
      new Map([["x", 1]]),
    ]);
  });

  it("should correctly build index for a single document", () => {
    const docItems = [{ key: "好好好", content: "" }];
    const result = buildIndex(docItems);
    expect(mockTokenize).toHaveBeenCalledTimes(1);
    expect(result.docItemsTokens[0]).toEqual(["好", "好", "好"]);
    expect(result.documentFrequency).toEqual({ 好: 1 });
  });

  it("should handle empty tokenize result", () => {
    mockTokenize.mockReturnValueOnce([]);
    const docItems = [
      { key: "IGNORE", content: "" },
      { key: "天氣", content: "" },
    ];
    const result = buildIndex(docItems);
    expect(result.docItemsTokens[0]).toEqual([]);
    expect(result.documentFrequency).toEqual({
      天: 1,
      氣: 1,
    });
  });

  it("should return all expected fields", () => {
    const docItems = [{ key: "A", content: "" }];
    const result = buildIndex(docItems);
    expect(result).toHaveProperty("documentFrequency");
    expect(result).toHaveProperty("docItemsTokens");
    expect(result).toHaveProperty("docItemsVectors");
  });
});
