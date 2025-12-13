import { describe, it, expect } from "vitest";
import { createBuildState } from "@/core/build-index/utils/create-build-state";

describe("createBuildState", () => {
  it("should create an empty index build state", () => {
    const state = createBuildState();

    expect(state).toEqual({
      documentFrequency: {},
      tokenized: [],
      totalTokens: 0,
    });
  });

  it("should return a new state instance each time", () => {
    const state1 = createBuildState();
    const state2 = createBuildState();

    expect(state1).not.toBe(state2);
    expect(state1.documentFrequency).not.toBe(state2.documentFrequency);
    expect(state1.tokenized).not.toBe(state2.tokenized);
  });
});
