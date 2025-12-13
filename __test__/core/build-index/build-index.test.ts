/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Document, SearchIndex } from "@/types";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildIndex } from "@/core/build-index/build-index";

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

describe("buildIndex", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should build index by orchestrating build steps", () => {
    const state = { mocked: true };
    const index: SearchIndex = {
      documentFrequency: {},
      documentVectors: new Map(),
      avgDocLength: 0,
    };

    createBuildStateMock.mockReturnValue(state);
    finalizeIndexMock.mockReturnValue(index);

    const docs: Document[] = [
      { id: "1", text: "hello", content: "a" },
      { id: "2", text: "world", content: "b" },
    ];

    const result = buildIndex(docs);

    expect(createBuildStateMock).toHaveBeenCalledTimes(1);

    expect(processDocumentMock).toHaveBeenCalledTimes(2);
    expect(processDocumentMock).toHaveBeenNthCalledWith(1, state, docs[0]);
    expect(processDocumentMock).toHaveBeenNthCalledWith(2, state, docs[1]);

    expect(finalizeIndexMock).toHaveBeenCalledTimes(1);
    expect(finalizeIndexMock).toHaveBeenCalledWith(state, docs.length);

    expect(result).toBe(index);
  });

  it("should handle empty documents", () => {
    const state = { mocked: true };
    const index: SearchIndex = {
      documentFrequency: {},
      documentVectors: new Map(),
      avgDocLength: 0,
    };

    createBuildStateMock.mockReturnValue(state);
    finalizeIndexMock.mockReturnValue(index);

    const result = buildIndex([]);

    expect(processDocumentMock).not.toHaveBeenCalled();
    expect(finalizeIndexMock).toHaveBeenCalledWith(state, 0);
    expect(result).toBe(index);
  });
});
