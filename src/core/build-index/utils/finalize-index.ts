import type { IndexBuildState } from "@/core/build-index/types";
import type { Document, SearchIndex } from "@/types";
import { scoring } from "@/utils/scoring";

/** Finalize index vectors (BM25 scoring) */
export function finalizeIndex(
  state: IndexBuildState,
  totalDocs: number,
): SearchIndex {
  const avgDocLength = totalDocs > 0 ? state.totalTokens / totalDocs : 0;

  const documentVectors = new Map<Document["id"], Map<string, number>>();

  for (const { id, tokens } of state.tokenized) {
    documentVectors.set(
      id,
      scoring(tokens, {
        totalDocs,
        documentFrequency: state.documentFrequency,
        avgDocLength,
      }),
    );
  }

  return {
    documentFrequency: state.documentFrequency,
    documentVectors,
    avgDocLength,
  };
}
