import type { IndexBuildState } from "@/core/build-index/types";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { finalizeIndex } from "@/core/build-index/utils/finalize-index";

// --- mock scoring to keep test deterministic
const scoringMock = vi.fn();

vi.mock("@/utils/scoring", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  scoring: (...args: any[]) => scoringMock(...args),
}));

describe("finalizeIndex", () => {
  let state: IndexBuildState;

  beforeEach(() => {
    scoringMock.mockReset();

    state = {
      documentFrequency: {
        hello: 2,
        world: 1,
      },
      tokenized: [
        { id: "1", tokens: ["hello", "world"] },
        { id: "2", tokens: ["hello"] },
      ],
      totalTokens: 3,
    };

    // default mock behavior
    scoringMock.mockImplementation((tokens: string[]) => {
      return new Map(tokens.map((t) => [t, 1]));
    });
  });

  it("should calculate avgDocLength correctly", () => {
    const index = finalizeIndex(state, 2);

    // totalTokens = 3, totalDocs = 2
    expect(index.avgDocLength).toBe(1.5);
  });

  it("should build document vectors using scoring", () => {
    const index = finalizeIndex(state, 2);

    expect(index.documentVectors.size).toBe(2);

    expect(index.documentVectors.get("1")).toEqual(
      new Map([
        ["hello", 1],
        ["world", 1],
      ]),
    );

    expect(index.documentVectors.get("2")).toEqual(new Map([["hello", 1]]));
  });

  it("should pass correct parameters to scoring", () => {
    finalizeIndex(state, 2);

    expect(scoringMock).toHaveBeenCalledTimes(2);

    expect(scoringMock).toHaveBeenCalledWith(
      ["hello", "world"],
      expect.objectContaining({
        totalDocs: 2,
        documentFrequency: state.documentFrequency,
        avgDocLength: 1.5,
      }),
    );
  });

  it("should return original documentFrequency reference", () => {
    const index = finalizeIndex(state, 2);

    // same reference, not a clone
    expect(index.documentFrequency).toBe(state.documentFrequency);
  });

  it("should handle empty documents safely", () => {
    const emptyState: IndexBuildState = {
      documentFrequency: {},
      tokenized: [],
      totalTokens: 0,
    };

    const index = finalizeIndex(emptyState, 0);

    expect(index.avgDocLength).toBe(0);
    expect(index.documentVectors.size).toBe(0);
    expect(index.documentFrequency).toEqual({});
  });
});
