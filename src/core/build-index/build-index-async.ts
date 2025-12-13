import type { Document, SearchIndex } from "@/types";
import { createBuildState } from "@/core/build-index/utils/create-build-state";
import { processDocument } from "@/core/build-index/utils/process-document";
import { finalizeIndex } from "./utils/finalize-index";

export interface BuildIndexOptions {
  chunkSize?: number;
  onProgress?: (progress: number) => void;
}

/** Build a search index asynchronously with chunked processing. */
export async function buildIndexAsync<T>(
  documents: ReadonlyArray<Document<T>>,
  { chunkSize = 10, onProgress }: BuildIndexOptions = {},
): Promise<SearchIndex> {
  const state = createBuildState();

  if (documents.length === 0) {
    onProgress?.(1);
    return finalizeIndex(state, 0);
  }

  // --- Phase 1: tokenize + DF
  for (let i = 0; i < documents.length; i += chunkSize) {
    const chunk = documents.slice(i, i + chunkSize);

    for (const doc of chunk) {
      processDocument(state, doc);
    }

    onProgress?.(i / documents.length);

    await new Promise<void>((resolve) => {
      if (typeof requestIdleCallback === "function") {
        requestIdleCallback(() => resolve());
      } else if (typeof requestAnimationFrame === "function") {
        requestAnimationFrame(() => resolve());
      } else {
        resolve();
      }
    });
  }

  // --- Phase 2: scoring (still chunkable if needed)
  const index = finalizeIndex(state, documents.length);

  onProgress?.(1);
  return index;
}
