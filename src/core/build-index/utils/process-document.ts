import type { IndexBuildState } from "@/core/build-index/types";
import type { Document } from "@/types";
import { tokenize } from "@/core/jieba";

/**
 * Process one document:
 * - tokenize
 * - update document frequency
 * - collect tokens
 */
export function processDocument<T>(state: IndexBuildState, doc: Document<T>) {
  const tokens = tokenize(doc.text);
  state.totalTokens += tokens.length;

  const uniqueTokens = new Set(tokens);
  for (const term of uniqueTokens) {
    state.documentFrequency[term] = (state.documentFrequency[term] || 0) + 1;
  }

  state.tokenized.push({ id: doc.id, tokens });
}
