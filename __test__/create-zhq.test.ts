/* eslint-disable unicorn/no-useless-undefined */
import type { Document } from "@/types";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { WASM_CDN_URL } from "@/constants";
import * as buildIndexCore from "@/core/build-index/build-index";
import * as jiebaCore from "@/core/jieba";
import { createZhq } from "@/create-zhq";
import { ZHQ } from "@/zhq";

// --------------------------------------------------
// mocks
// --------------------------------------------------
vi.mock("@/core/jieba", () => ({
  initJieba: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/core/build-index/build-index", () => ({
  buildIndex: vi.fn().mockReturnValue({
    documentFrequency: {},
    documentVectors: [],
    avgDocLength: 0,
  }),
}));

const mockDocuments: ReadonlyArray<Document<unknown>> = [
  { id: "A", text: "天氣", content: "天氣很好" },
  { id: "B", text: "散步", content: "散步很舒服" },
];

// --------------------------------------------------
// tests
// --------------------------------------------------
describe("createZhq", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a ZHQ instance even without documents", async () => {
    const zhq = await createZhq();
    expect(zhq).toBeInstanceOf(ZHQ);
    expect(jiebaCore.initJieba).not.toHaveBeenCalled();
    expect(buildIndexCore.buildIndex).not.toHaveBeenCalled();
  });

  it("should initialize jieba and build index when documents are provided", async () => {
    const zhq = await createZhq(mockDocuments);
    expect(zhq).toBeInstanceOf(ZHQ);
    expect(jiebaCore.initJieba).toHaveBeenCalledWith(WASM_CDN_URL);
    expect(buildIndexCore.buildIndex).toHaveBeenCalledWith(mockDocuments);
  });

  it("should pass custom wasmURL to initJieba", async () => {
    await createZhq(mockDocuments, { wasmURL: "/custom.wasm" });
    expect(jiebaCore.initJieba).toHaveBeenCalledWith("/custom.wasm");
  });
});
