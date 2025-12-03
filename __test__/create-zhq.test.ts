import type { DocItem } from "../export";
import { describe, it, expect, vi } from "vitest";
import { createZhq } from "../src/create-zhq";
import { ZHQ } from "../src/zhq";

vi.mock("../src/methods/jieba", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    // @ts-expect-error any
    ...actual,
    initJieba: vi.fn(async () => true), // mock initJieba
    tokenize: (text: string) => text.split(" "), // mock tokenize
  };
});

// 假資料
const docs: DocItem[] = [
  { key: "便利商店 咖啡", content: "答案1" },
  { key: "便利商店 茶飲", content: "答案2" },
];

describe("createZhq", () => {
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
    // 可以查 query 是否可用
    const result = zhq.query("便利商店");
    expect(result.candidates.length).toBeGreaterThan(0);
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
});
