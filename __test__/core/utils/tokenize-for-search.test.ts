import { describe, expect, it, vi } from "vitest";
import { tokenizeForSearch } from "@/core/utils/tokenize-for-search";

vi.mock("@/core/jieba", () => ({
  tokenize: (text?: string) => {
    if (!text) return [];
    return text.split(" ");
  },
}));

describe("tokenizeForSearch", () => {
  it("expands tokens for partial input", () => {
    expect(tokenizeForSearch("搜尋引")).toEqual(
      expect.arrayContaining(["搜尋引", "搜尋", "引"]),
    );
  });

  it("does not expand when tokenizer already splits", () => {
    expect(tokenizeForSearch("搜尋 引擎")).toEqual(["搜尋", "引擎"]);
  });

  it("does not expand for single character input", () => {
    expect(tokenizeForSearch("搜")).toEqual(["搜"]);
  });

  it("returns empty array for falsy input", () => {
    expect(tokenizeForSearch()).toEqual([]);
    expect(tokenizeForSearch("")).toEqual([]);
  });
});
