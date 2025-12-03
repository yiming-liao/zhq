import type {
  DocItem,
  DocItemsTokens,
  DocItemsVectors,
  DocumentFrequency,
} from "../../src/types";
import { describe, it, expect, vi } from "vitest";
import { query } from "../../src/methods/query";

vi.mock("../../src/methods/jieba", () => ({
  tokenize: (text: string) => text.split(" "),
}));

// 假文檔
const docItems: DocItem<string>[] = [
  { key: "便利商店 咖啡", content: "答案1" },
  { key: "便利商店 茶飲", content: "答案2" },
  { key: "書店 文具", content: "答案3" },
];

// 對應斷詞結果
const docItemsTokens: DocItemsTokens = [
  ["便利商店", "咖啡"],
  ["便利商店", "茶飲"],
  ["書店", "文具"],
];

// 文檔頻率 DF
const documentFrequency: DocumentFrequency = {
  便利商店: 2,
  咖啡: 1,
  茶飲: 1,
  書店: 1,
  文具: 1,
};

describe("query()", () => {
  it("應該找到最佳匹配和候選文件", () => {
    const result = query({
      docItems,
      docItemsTokens,
      documentFrequency,
      input: "便利商店 咖啡",
    });

    expect(result.bestMatch).toEqual(docItems[0]);
    expect(result.candidates).toContain(docItems[1]);
    expect(result.candidates.length).toBeLessThanOrEqual(3);
  });

  it("相似度不足時，bestMatch 應為 undefined", () => {
    const result = query({
      docItems,
      docItemsTokens,
      documentFrequency,
      input: "飛機 航空",
      threshold: 0.5,
    });

    expect(result.bestMatch).toBeUndefined();
    expect(result.candidates.length).toBeGreaterThan(0);
  });

  it("可以控制 topKCandidates 數量", () => {
    const result = query({
      docItems,
      docItemsTokens,
      documentFrequency,
      input: "便利商店",
      topKCandidates: 1,
    });

    if (result.bestMatch) {
      expect(result.candidates.length).toBe(1);
    } else {
      expect(result.candidates.length).toBe(1);
    }
  });

  it("使用預先計算向量 docItemsVectors", () => {
    const docItemsVectors: DocItemsVectors = docItemsTokens.map(
      (tokens) =>
        new Map(Object.entries(Object.fromEntries(tokens.map((t) => [t, 1])))),
    );

    const result = query({
      docItems,
      docItemsTokens,
      documentFrequency,
      docItemsVectors,
      input: "便利商店 咖啡",
    });

    expect(result.bestMatch).toEqual(docItems[0]);
  });

  it("threshold 不合法時應丟錯誤", () => {
    expect(() =>
      query({
        docItems,
        docItemsTokens,
        documentFrequency,
        input: "test",
        threshold: -0.1,
      }),
    ).toThrow();

    expect(() =>
      query({
        docItems,
        docItemsTokens,
        documentFrequency,
        input: "test",
        threshold: 1.1,
      }),
    ).toThrow();
  });

  it("docItemsTokens 為空時，返回空結果", () => {
    const emptyDocItems: DocItem<string>[] = [];
    const emptyTokens: DocItemsTokens = [];
    const emptyDF: DocumentFrequency = {};

    const result = query({
      docItems: emptyDocItems,
      docItemsTokens: emptyTokens,
      documentFrequency: emptyDF,
      input: "任何文字",
    });

    expect(result.bestMatch).toBeUndefined();
    expect(result.candidates).toEqual([]);
  });
});
