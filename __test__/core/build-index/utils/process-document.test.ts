import type { IndexBuildState } from "@/core/build-index/types";
import type { Document } from "@/types";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { processDocument } from "@/core/build-index/utils/process-document";

// --- mock tokenize to keep test deterministic
vi.mock("@/core/jieba", () => ({
  tokenize: (text: string) => text.split(" "),
}));

describe("processDocument", () => {
  let state: IndexBuildState;
  let doc: Document;

  beforeEach(() => {
    state = {
      documentFrequency: {},
      tokenized: [],
      totalTokens: 0,
    };

    doc = {
      id: "1",
      text: "hello hello world",
      content: "test",
    };
  });

  it("should tokenize document and update totalTokens", () => {
    processDocument(state, doc);

    // hello hello world -> 3 tokens
    expect(state.totalTokens).toBe(3);
  });

  it("should update document frequency using unique tokens", () => {
    processDocument(state, doc);

    expect(state.documentFrequency).toEqual({
      hello: 1,
      world: 1,
    });
  });

  it("should collect tokenized document with id", () => {
    processDocument(state, doc);

    expect(state.tokenized).toEqual([
      {
        id: "1",
        tokens: ["hello", "hello", "world"],
      },
    ]);
  });

  it("should accumulate state when called multiple times", () => {
    processDocument(state, doc);
    processDocument(state, doc);

    // totalTokens accumulates
    expect(state.totalTokens).toBe(6);

    // DF accumulates per document
    expect(state.documentFrequency).toEqual({
      hello: 2,
      world: 2,
    });

    // tokenized collects all docs
    expect(state.tokenized).toHaveLength(2);
  });
});
