import type { IndexBuildState } from "@/core/build-index/types";

/** Create an empty index build state. */
export function createBuildState(): IndexBuildState {
  return {
    documentFrequency: {},
    tokenized: [],
    totalTokens: 0,
  };
}
