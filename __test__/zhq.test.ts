/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable unicorn/no-useless-undefined */
import type { DocItem } from "../export";
import { describe, it, expect, vi } from "vitest";
import { createZhq } from "../src/create-zhq";
import * as jiebaModule from "../src/methods/jieba";
import { ZHQ } from "../src/zhq";

// --- Mock Jieba 與相關方法 ---
vi.mock("../src/methods/jieba", () => ({
  tokenize: (text: string) => text.split(" "), // 簡單拆字
  initJieba: vi.fn().mockResolvedValue(undefined), // mock 初始化
}));

vi.mock("../src/methods/build-index", () => ({
  buildIndex: (docItems: any[], precomputeVectors = false) => ({
    documentFrequency: { a: 1 }, // 假 DF
    docItemsTokens: docItems.map((d) => d.key.split(" ")), // 假 tokens
    docItemsVectors: precomputeVectors
      ? docItems.map(() => [1, 2, 3])
      : undefined, // 假向量
  }),
}));

vi.mock("../src/methods/query", () => ({
  query: ({ docItems }: any) => ({
    bestMatch: docItems[0],
    candidates: docItems.slice(1),
  }),
}));

// --- 假資料 ---
interface Metadata {
  id: number;
}
const docs: DocItem<Metadata>[] = [
  { key: "便利商店 咖啡", content: "答案1", metadata: { id: 1 } },
  { key: "便利商店 茶飲", content: "答案2", metadata: { id: 2 } },
];

describe("ZHQ & createZhq 完整測試", () => {
  it("不傳 docItems，應返回未初始化 ZHQ 實例", async () => {
    const zhq = await createZhq();
    expect(zhq).toBeInstanceOf(ZHQ);
    expect(zhq.docItems).toBeUndefined();
    expect(zhq.isJiebaInitialized).toBe(false);
  });

  it("傳入 docItems，應初始化 Jieba 並建立索引", async () => {
    const zhq = await createZhq(docs);
    expect(zhq.docItems).toEqual(docs);
    expect(zhq.isJiebaInitialized).toBe(true);

    const result = zhq.query("便利商店");
    expect(result.candidates.length).toBeGreaterThan(0);
    expect(result.bestMatch?.key).toBe(docs[0].key);
  });

  it("precomputeVectors 為 true，應有 docItemsVectors", async () => {
    const zhq = await createZhq(docs, { precomputeVectors: true });
    expect(zhq["docItemsVectors"]).toBeDefined();
    expect(zhq["docItemsVectors"]?.length).toBe(docs.length);
  });

  it("precomputeVectors 為 false，docItemsVectors 應 undefined", async () => {
    const zhq = await createZhq(docs, { precomputeVectors: false });
    expect(zhq["docItemsVectors"]).toBeUndefined();
  });

  it("ZHQ.initJieba 應呼叫 initJieba 並設定 isJiebaInitialized 為 true", async () => {
    const zhq = new ZHQ();
    expect(zhq.isJiebaInitialized).toBe(false);

    await zhq.initJieba("/mock.wasm");

    expect(jiebaModule.initJieba).toHaveBeenCalledWith("/mock.wasm");
    expect(zhq.isJiebaInitialized).toBe(true);
  });

  it("initJieba 已初始化時不會重複呼叫 initJieba", async () => {
    vi.clearAllMocks();

    const zhq = new ZHQ();
    const initJiebaMock = vi.spyOn(jiebaModule, "initJieba");

    // 第一次呼叫，應該會執行 initJieba
    await zhq.initJieba();
    expect(initJiebaMock).toHaveBeenCalledTimes(1);

    // 第二次呼叫，_isJiebaInitialized 已經 true，不應再呼叫 initJieba
    await zhq.initJieba();
    expect(initJiebaMock).toHaveBeenCalledTimes(1);

    initJiebaMock.mockRestore();
  });

  // --- 新增錯誤處理測試 ---
  it("buildIndex 沒有 docItems 也未在 constructor 傳入，應拋錯", () => {
    const zhq = new ZHQ();
    expect(() => zhq.buildIndex()).toThrow(
      "請提供 docItems 或在 constructor 傳入",
    );
  });

  it("buildIndex 傳入空陣列，應拋錯", () => {
    const zhq = new ZHQ();
    expect(() => zhq.buildIndex([])).toThrow(
      "buildIndex() 需要有效 docItems。",
    );
  });

  it("query 在未建立索引前，應拋錯", () => {
    const zhq = new ZHQ(docs);
    expect(() => zhq.query("任何問題")).toThrow(
      "索引尚未建立，請先呼叫 buildIndex()",
    );
  });
});
