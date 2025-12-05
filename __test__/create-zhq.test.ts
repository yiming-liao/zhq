/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable unicorn/no-useless-undefined */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createZhq } from "@/create-zhq";
import { ZHQ } from "@/zhq";

const mockDocItems = [
  { key: "A", content: "天氣很好" },
  { key: "B", content: "散步很舒服" },
];

// ---- Mock modules ----
vi.mock("@/core/jieba", () => ({
  initJieba: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/core/build-index", () => ({
  buildIndex: vi.fn().mockReturnValue({
    documentFrequency: {},
    docItemsTokens: [],
    docItemsVectors: [],
  }),
}));

vi.mock("@/zhq", () => {
  return {
    ZHQ: vi.fn().mockImplementation(function (this: any) {
      this.initJieba = vi.fn().mockResolvedValue(undefined);
      this.buildIndex = vi.fn();
    }),
  };
});

describe("createZhq", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a ZHQ instance even without docItems", async () => {
    const zhq = await createZhq();
    expect(zhq).toBeInstanceOf(ZHQ);
    expect(zhq.initJieba).not.toHaveBeenCalled();
    expect(zhq.buildIndex).not.toHaveBeenCalled();
  });

  it("should initialize jieba and build index if docItems are provided", async () => {
    const zhq = await createZhq(mockDocItems);
    expect(zhq.initJieba).toHaveBeenCalledWith("/jieba_rs_wasm_bg.wasm");
    expect(zhq.buildIndex).toHaveBeenCalled();
    expect(zhq.buildIndex).toHaveBeenCalledWith(mockDocItems);
  });

  it("should pass custom wasmPath to initJieba", async () => {
    const zhq = await createZhq(mockDocItems, { wasmPath: "/custom.wasm" });
    expect(zhq.initJieba).toHaveBeenCalledWith("/custom.wasm");
  });
});
