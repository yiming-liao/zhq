import type { DocItem } from "../../src/types";
import { describe, it, expect, vi } from "vitest";
import { buildIndex } from "../../src/methods/build-index";

vi.mock("../../src/methods/jieba", () => ({
  tokenize: (text: string) => text.split(" "),
}));

describe("buildIndex", () => {
  const docs: DocItem[] = [
    { key: "便利商店 咖啡", content: "答案1" },
    { key: "便利商店 茶飲", content: "答案2" },
    { key: "咖啡 茶飲", content: "答案3" },
  ];

  it("should tokenize each document and calculate document frequency", () => {
    const { documentFrequency, docItemsTokens } = buildIndex(docs);

    // docItemsTokens 應該是二維陣列，對應每個 document
    expect(docItemsTokens.length).toBe(docs.length);
    expect(docItemsTokens[0]).toEqual(
      expect.arrayContaining(["便利商店", "咖啡"]),
    );
    expect(docItemsTokens[1]).toEqual(
      expect.arrayContaining(["便利商店", "茶飲"]),
    );

    // DF 計算
    expect(documentFrequency["便利商店"]).toBe(2);
    expect(documentFrequency["咖啡"]).toBe(2);
    expect(documentFrequency["茶飲"]).toBe(2);
  });

  it("should not precompute vectors by default", () => {
    const { docItemsVectors } = buildIndex(docs);
    expect(docItemsVectors).toBeUndefined();
  });

  it("should precompute vectors when precomputeVectors=true", () => {
    const { docItemsVectors } = buildIndex(docs, true);

    expect(docItemsVectors).toBeDefined();
    expect(docItemsVectors!.length).toBe(docs.length);

    // 檢查每個向量是 Map 並且有至少一個 key
    docItemsVectors!.forEach((vec) => {
      expect(vec).toBeInstanceOf(Map);
      expect(vec.size).toBeGreaterThan(0);
    });
  });
});
