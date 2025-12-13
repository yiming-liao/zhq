/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Document, SearchIndex } from "@/types";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildIndexAsync } from "@/core/build-index/build-index-async";

// --- mocks
const createBuildStateMock = vi.fn();
const processDocumentMock = vi.fn();
const finalizeIndexMock = vi.fn();

vi.mock("@/core/build-index/utils/create-build-state", () => ({
  createBuildState: () => createBuildStateMock(),
}));

vi.mock("@/core/build-index/utils/process-document", () => ({
  processDocument: (...args: any[]) => processDocumentMock(...args),
}));

vi.mock("@/core/build-index/utils/finalize-index", () => ({
  finalizeIndex: (...args: any[]) => finalizeIndexMock(...args),
}));

describe("buildIndexAsync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // mock browser APIs so await never blocks
    (globalThis as any).requestIdleCallback = undefined;
    (globalThis as any).requestAnimationFrame = (cb: () => void) => cb();
  });

  it("should build index asynchronously with chunked processing", async () => {
    const state = { mocked: true };
    const index: SearchIndex = {
      documentFrequency: {},
      documentVectors: new Map(),
      avgDocLength: 0,
    };
    createBuildStateMock.mockReturnValue(state);
    finalizeIndexMock.mockReturnValue(index);
    const docs: Document[] = [
      { id: "1", text: "a", content: "a" },
      { id: "2", text: "b", content: "b" },
      { id: "3", text: "c", content: "c" },
    ];
    const onProgress = vi.fn();
    const result = await buildIndexAsync(docs, {
      chunkSize: 2,
      onProgress,
    });
    // create state
    expect(createBuildStateMock).toHaveBeenCalledTimes(1);
    // process all documents
    expect(processDocumentMock).toHaveBeenCalledTimes(3);
    expect(processDocumentMock).toHaveBeenNthCalledWith(1, state, docs[0]);
    expect(processDocumentMock).toHaveBeenNthCalledWith(2, state, docs[1]);
    expect(processDocumentMock).toHaveBeenNthCalledWith(3, state, docs[2]);
    // finalize index
    expect(finalizeIndexMock).toHaveBeenCalledWith(state, docs.length);
    // progress updates
    expect(onProgress).toHaveBeenCalledWith(0); // i = 0
    expect(onProgress).toHaveBeenCalledWith(2 / 3); // i = 2
    expect(onProgress).toHaveBeenCalledWith(1); // completed
    // return result
    expect(result).toBe(index);
  });

  it("should handle empty documents with early return", async () => {
    const state = { mocked: true };
    const index: SearchIndex = {
      documentFrequency: {},
      documentVectors: new Map(),
      avgDocLength: 0,
    };
    createBuildStateMock.mockReturnValue(state);
    finalizeIndexMock.mockReturnValue(index);
    const onProgress = vi.fn();
    const result = await buildIndexAsync([], { onProgress });
    expect(processDocumentMock).not.toHaveBeenCalled();
    expect(finalizeIndexMock).toHaveBeenCalledWith(state, 0);
    expect(onProgress).toHaveBeenCalledWith(1);
    expect(result).toBe(index);
  });

  it("should resolve immediately when no scheduling APIs are available", async () => {
    const state = { mocked: true };
    const index: SearchIndex = {
      documentFrequency: {},
      documentVectors: new Map(),
      avgDocLength: 0,
    };
    createBuildStateMock.mockReturnValue(state);
    finalizeIndexMock.mockReturnValue(index);
    // Remove both APIs
    delete (globalThis as any).requestIdleCallback;
    delete (globalThis as any).requestAnimationFrame;
    const docs: Document[] = [{ id: "1", text: "a", content: "a" }];
    const onProgress = vi.fn();
    const result = await buildIndexAsync(docs, { onProgress });
    expect(processDocumentMock).toHaveBeenCalledTimes(1);
    expect(finalizeIndexMock).toHaveBeenCalledWith(state, 1);
    expect(onProgress).toHaveBeenCalledWith(1);
    expect(result).toBe(index);
  });

  it("should use requestIdleCallback when available", async () => {
    const ric = vi.fn((cb: () => void) => cb());
    (globalThis as any).requestIdleCallback = ric;
    delete (globalThis as any).requestAnimationFrame;
    const state = { mocked: true };
    const index: SearchIndex = {
      documentFrequency: {},
      documentVectors: new Map(),
      avgDocLength: 0,
    };
    createBuildStateMock.mockReturnValue(state);
    finalizeIndexMock.mockReturnValue(index);
    await buildIndexAsync([{ id: "1", text: "a", content: "a" }], {
      chunkSize: 1,
    });
    expect(ric).toHaveBeenCalledTimes(1);
  });
});
