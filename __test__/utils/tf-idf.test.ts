import { describe, it, expect } from "vitest";
import { tfidf } from "@/utils/tf-idf";

describe("tfidf", () => {
  it("應該正確計算 TF-IDF 值", () => {
    const tokens = ["咖啡", "便利商店", "咖啡"];
    const totalDocs = 5;
    const df = { 咖啡: 2, 便利商店: 3 };

    const vector = tfidf(tokens, totalDocs, df);

    // 確認每個詞都有對應值
    expect(vector.has("咖啡")).toBe(true);
    expect(vector.has("便利商店")).toBe(true);

    // 計算手動 TF-IDF
    // TF: "咖啡" 2/3, "便利商店" 1/3
    // IDF: "咖啡" = log((5+1)/(2+1))+1 = log(2)+1 ≈ 1.6931
    const tfCoffee = 2 / 3;
    const idfCoffee = Math.log((5 + 1) / (2 + 1)) + 1;
    expect(vector.get("咖啡")).toBeCloseTo(tfCoffee * idfCoffee, 5);

    const tfStore = 1 / 3;
    const idfStore = Math.log((5 + 1) / (3 + 1)) + 1;
    expect(vector.get("便利商店")).toBeCloseTo(tfStore * idfStore, 5);
  });

  it("應處理 documentFrequency 未提供的詞", () => {
    const tokens = ["新詞"];
    const totalDocs = 5;
    const df = {};

    const vector = tfidf(tokens, totalDocs, df);
    // TF = 1, IDF = log((5+1)/1)+1 = log(6)+1
    expect(vector.get("新詞")).toBeCloseTo(Math.log(6) + 1, 5);
  });

  it("應返回空 Map 當 tokens 為空", () => {
    const vector = tfidf([], 5, {});
    expect(vector.size).toBe(0);
  });
});
