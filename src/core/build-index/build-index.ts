import type { Document, SearchIndex } from "@/types";
import { createBuildState } from "@/core/build-index/utils/create-build-state";
import { processDocument } from "@/core/build-index/utils/process-document";
import { finalizeIndex } from "./utils/finalize-index";

/** Build a search index synchronously from documents. */
export function buildIndex<T>(
  documents: ReadonlyArray<Document<T>>,
): SearchIndex {
  const state = createBuildState();

  for (const doc of documents) {
    processDocument(state, doc);
  }

  return finalizeIndex(state, documents.length);
}
