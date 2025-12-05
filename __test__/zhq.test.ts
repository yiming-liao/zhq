/* eslint-disable unicorn/no-useless-undefined */
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as buildIndexCore from "@/core/build-index";
import * as jiebaCore from "@/core/jieba";
import * as queryCore from "@/core/query";
import { ZHQ } from "@/zhq";

const mockDocItems = [
  { key: "A", content: "天氣很好" },
  { key: "B", content: "適合散步" },
];

// ---- Mock modules ----
vi.mock("@/core/jieba", () => ({
  initJieba: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/core/build-index", () => ({
  buildIndex: vi.fn().mockReturnValue({
    documentFrequency: { 天: 1 },
    docItemsTokens: [
      ["天", "氣"],
      ["適", "合"],
    ],
    docItemsVectors: [{ foo: 1 }, { bar: 1 }],
  }),
}));

vi.mock("@/core/query", () => ({
  query: vi.fn().mockReturnValue({
    isIndexReady: true,
    bestMatch: { key: "A", content: "天氣很好" },
    candidates: [{ key: "A", score: 0.8 }],
  }),
}));

describe("ZHQ (New Event-based Version)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --------------------------------------------------------
  // Constructor
  // --------------------------------------------------------
  it("should initialize without docItems", () => {
    const zhq = new ZHQ();
    expect(zhq.docItems).toBeUndefined();
  });

  it("should store docItems if provided", () => {
    const zhq = new ZHQ(mockDocItems);
    expect(zhq.docItems).toEqual(mockDocItems);
  });

  // --------------------------------------------------------
  // initJieba()
  // --------------------------------------------------------
  it("should call initJieba and fire onJiebaReady", async () => {
    const zhq = new ZHQ();
    const onReady = vi.fn();
    zhq.onJiebaReady = onReady;

    await zhq.initJieba();

    expect(jiebaCore.initJieba).toHaveBeenCalled();
    expect(onReady).toHaveBeenCalledTimes(1);
  });

  it("should not reinitialize if already ready", async () => {
    const zhq = new ZHQ();

    await zhq.initJieba();
    await zhq.initJieba();

    expect(jiebaCore.initJieba).toHaveBeenCalledTimes(1);
  });

  it("should fire onError when initJieba throws", async () => {
    const zhq = new ZHQ();
    const onError = vi.fn();
    zhq.onError = onError;

    vi.mocked(jiebaCore.initJieba).mockRejectedValueOnce(new Error("Fail"));

    await expect(zhq.initJieba()).rejects.toThrow("Fail");
    expect(onError).toHaveBeenCalled();
  });

  // --------------------------------------------------------
  // buildIndex()
  // --------------------------------------------------------
  it("should build index synchronously and fire onIndexReady", () => {
    const zhq = new ZHQ(mockDocItems);
    const onIndex = vi.fn();
    zhq.onIndexReady = onIndex;

    zhq.buildIndex();

    expect(buildIndexCore.buildIndex).toHaveBeenCalledWith(mockDocItems);
    expect(onIndex).toHaveBeenCalled();
  });

  it("should throw if buildIndex is called without docItems", () => {
    const zhq = new ZHQ();
    expect(() => zhq.buildIndex()).toThrow("buildIndex() 需要有效 docItems");
  });

  it("should fire onError when buildIndex fails", () => {
    const zhq = new ZHQ(mockDocItems);
    const onError = vi.fn();
    zhq.onError = onError;

    vi.mocked(buildIndexCore.buildIndex).mockImplementationOnce(() => {
      throw new Error("index fail");
    });

    expect(() => zhq.buildIndex()).toThrow("index fail");
    expect(onError).toHaveBeenCalled();
  });

  // --------------------------------------------------------
  // buildIndexAsync()
  // --------------------------------------------------------
  it("should build index asynchronously and fire onIndexReady", async () => {
    const zhq = new ZHQ(mockDocItems);
    const onIndex = vi.fn();
    zhq.onIndexReady = onIndex;

    await zhq.buildIndexAsync();

    expect(buildIndexCore.buildIndex).toHaveBeenCalled();
    expect(onIndex).toHaveBeenCalled();
  });

  it("should reuse the same promise when already building", () => {
    const zhq = new ZHQ(mockDocItems);
    const p1 = zhq.buildIndexAsync();
    const p2 = zhq.buildIndexAsync();
    expect(p1).toBe(p2);
  });

  it("should throw error when buildIndexAsync called without docItems", () => {
    const zhq = new ZHQ();
    expect(() => zhq.buildIndexAsync()).toThrow(
      "buildIndexAsync() 需要有效 docItems",
    );
  });

  it("should trigger onError when async indexing fails", async () => {
    const zhq = new ZHQ(mockDocItems);
    const onError = vi.fn();
    zhq.onError = onError;

    vi.mocked(buildIndexCore.buildIndex).mockRejectedValueOnce(
      new Error("async fail"),
    );

    await expect(zhq.buildIndexAsync()).rejects.toThrow("async fail");
    expect(onError).toHaveBeenCalled();
  });

  // --------------------------------------------------------
  // query()
  // --------------------------------------------------------
  it("should return not-ready result when index not ready", () => {
    const zhq = new ZHQ(mockDocItems);
    const res = zhq.query("天氣");
    expect(res.isIndexReady).toBe(false);
    expect(res.candidates).toEqual([]);
  });

  it("should query successfully when index is ready", () => {
    const zhq = new ZHQ(mockDocItems);
    zhq.buildIndex();
    const res = zhq.query("天氣");

    expect(queryCore.query).toHaveBeenCalled();
    expect(res.bestMatch?.key).toBe("A");
  });

  // --------------------------------------------------------
  // queryAsync()
  // --------------------------------------------------------
  it("queryAsync should wait for async index to finish", async () => {
    const zhq = new ZHQ(mockDocItems);
    const p = zhq.buildIndexAsync();

    const res = await zhq.queryAsync("天氣");
    await p;

    expect(res.isIndexReady).toBe(true);
    expect(queryCore.query).toHaveBeenCalled();
  });

  it("queryAsync should directly query if no indexing in progress", async () => {
    const zhq = new ZHQ(mockDocItems);
    zhq.buildIndex();

    const res = await zhq.queryAsync("天氣");

    expect(queryCore.query).toHaveBeenCalled();
    expect(res.isIndexReady).toBe(true);
  });
});
