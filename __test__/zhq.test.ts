/* eslint-disable unicorn/no-useless-undefined */
import type { Document } from "@/types";
import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import * as buildIndexCore from "@/core/build-index";
import * as jiebaCore from "@/core/jieba";
import * as queryCore from "@/core/query";
import { ZHQ } from "@/zhq";

const mockDocuments = [
  { id: "A", text: "天氣", content: "天氣很好" },
  { id: "B", text: "散步", content: "適合散步" },
] satisfies ReadonlyArray<Document<unknown>>;

// --------------------------------------------------
// mocks
// --------------------------------------------------
vi.mock("@/core/jieba", () => ({
  initJieba: vi.fn().mockResolvedValue(undefined),
}));

const mockIndex = vi.hoisted(() => ({
  documentFrequency: { 天氣: 1, 散步: 1 },
  documentVectors: new Map([
    ["A", new Map([["天氣", 1]])],
    ["B", new Map([["散步", 1]])],
  ]),
  avgDocLength: 1,
}));

vi.mock("@/core/build-index", () => ({
  buildIndex: vi.fn().mockReturnValue(mockIndex),
}));

vi.mock("@/core/query", () => ({
  query: vi.fn().mockReturnValue({
    isIndexReady: true,
    bestMatch: { id: "A", text: "天氣", content: "天氣很好" },
    candidates: [{ id: "B", text: "散步", content: "適合散步" }],
  }),
}));

// --------------------------------------------------
// tests
// --------------------------------------------------
describe("ZHQ", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("crypto", {
      randomUUID: vi.fn(() => "mock-uuid"),
    });
  });
  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it("documents should be undefined before index is built", () => {
    const zhq = new ZHQ();
    expect(zhq.documents).toBeUndefined();
  });

  // --------------------------------------------------
  // initJieba()
  // --------------------------------------------------
  it("should init jieba and fire onJiebaReady", async () => {
    const zhq = new ZHQ();
    const onReady = vi.fn();
    zhq.onJiebaReady = onReady;

    await zhq.initJieba();

    expect(jiebaCore.initJieba).toHaveBeenCalledTimes(1);
    expect(onReady).toHaveBeenCalledTimes(1);
  });

  it("should not init jieba twice", async () => {
    const zhq = new ZHQ();

    await zhq.initJieba();
    await zhq.initJieba();

    expect(jiebaCore.initJieba).toHaveBeenCalledTimes(1);
  });

  it("should call onError when initJieba fails", async () => {
    const zhq = new ZHQ();
    const onError = vi.fn();
    zhq.onError = onError;

    vi.mocked(jiebaCore.initJieba).mockRejectedValueOnce(new Error("fail"));

    await expect(zhq.initJieba()).rejects.toThrow("fail");
    expect(onError).toHaveBeenCalledTimes(1);
  });

  // --------------------------------------------------
  // buildIndex()
  // --------------------------------------------------
  it("should build index synchronously and fire onIndexReady", () => {
    const zhq = new ZHQ();
    const onIndexReady = vi.fn();
    zhq.onIndexReady = onIndexReady;

    zhq.buildIndex(mockDocuments);

    expect(buildIndexCore.buildIndex).toHaveBeenCalledWith(mockDocuments);
    expect(onIndexReady).toHaveBeenCalledTimes(1);
    expect(zhq.documents).toEqual(mockDocuments);
  });

  it("should throw if buildIndex called without documents", () => {
    const zhq = new ZHQ();
    // @ts-expect-error expected
    expect(() => zhq.buildIndex()).toThrow("buildIndex() 需要有效 documents");
  });

  it("should call onError when buildIndex throws", () => {
    const zhq = new ZHQ();
    const onError = vi.fn();
    zhq.onError = onError;

    vi.mocked(buildIndexCore.buildIndex).mockImplementationOnce(() => {
      throw new Error("index fail");
    });

    expect(() => zhq.buildIndex(mockDocuments)).toThrow("index fail");
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it("should generate id using crypto.randomUUID when document id is missing", () => {
    const zhq = new ZHQ();
    const docsWithoutId = [
      { text: "天氣", content: "天氣很好" },
      { text: "散步", content: "適合散步" },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ] as any;
    zhq.buildIndex(docsWithoutId);
    const docs = zhq.documents!;
    expect(docs).toHaveLength(2);
    for (const doc of docs) {
      expect(doc.id).toBe("mock-uuid");
    }
    expect(crypto.randomUUID).toHaveBeenCalledTimes(2);
  });

  // --------------------------------------------------
  // buildIndexAsync()
  // --------------------------------------------------
  it("should build index async and fire onIndexReady", async () => {
    const zhq = new ZHQ();
    const onIndexReady = vi.fn();
    zhq.onIndexReady = onIndexReady;

    await zhq.buildIndexAsync(mockDocuments);

    expect(buildIndexCore.buildIndex).toHaveBeenCalled();
    expect(onIndexReady).toHaveBeenCalledTimes(1);
    expect(zhq.documents).toEqual(mockDocuments);
  });

  it("should reuse same promise when building index", () => {
    const zhq = new ZHQ();

    const p1 = zhq.buildIndexAsync(mockDocuments);
    const p2 = zhq.buildIndexAsync(mockDocuments);

    expect(p1).toBe(p2);
  });

  it("should throw if buildIndexAsync called without documents", () => {
    const zhq = new ZHQ();
    // @ts-expect-error expected
    expect(() => zhq.buildIndexAsync()).toThrow(
      "buildIndexAsync() 需要有效 documents",
    );
  });

  it("should call onError when async buildIndex fails", async () => {
    const zhq = new ZHQ();
    const onError = vi.fn();
    zhq.onError = onError;

    vi.mocked(buildIndexCore.buildIndex).mockRejectedValueOnce(
      new Error("async fail"),
    );

    await expect(zhq.buildIndexAsync(mockDocuments)).rejects.toThrow(
      "async fail",
    );
    expect(onError).toHaveBeenCalledTimes(1);
  });

  // --------------------------------------------------
  // query()
  // --------------------------------------------------
  it("should return not-ready result when index not built", () => {
    const zhq = new ZHQ();
    const res = zhq.query("天氣");

    expect(res.isIndexReady).toBe(false);
    expect(res.candidates).toEqual([]);
  });

  it("should query when index is ready", () => {
    const zhq = new ZHQ();
    zhq.buildIndex(mockDocuments);

    const res = zhq.query("天氣");

    expect(queryCore.query).toHaveBeenCalled();
    expect(res.bestMatch?.id).toBe("A");
  });

  // --------------------------------------------------
  // queryAsync()
  // --------------------------------------------------
  it("queryAsync should wait for index building", async () => {
    const zhq = new ZHQ();
    const p = zhq.buildIndexAsync(mockDocuments);

    const res = await zhq.queryAsync("天氣");
    await p;

    expect(res.isIndexReady).toBe(true);
    expect(queryCore.query).toHaveBeenCalled();
  });

  it("queryAsync should query directly if index ready", async () => {
    const zhq = new ZHQ();
    zhq.buildIndex(mockDocuments);

    const res = await zhq.queryAsync("天氣");

    expect(queryCore.query).toHaveBeenCalled();
    expect(res.isIndexReady).toBe(true);
  });
});
