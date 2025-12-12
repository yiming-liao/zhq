import type { Document, DocumentFrequency, SearchIndex } from "@/types";
import { tokenize } from "@/core/jieba";
import { scoring } from "@/utils/scoring";

/**
 * Build search index (BM25-based).
 */
export function buildIndex<T>(
  documents: ReadonlyArray<Document<T>>,
): SearchIndex {
  const documentFrequency: DocumentFrequency = {};
  let totalTokens = 0;

  // 1. Tokenize & compute document frequency
  const tokenized = documents.map((doc) => {
    const tokens = tokenize(doc.text);
    totalTokens += tokens.length;

    const uniqueTokens = new Set(tokens);
    for (const term of uniqueTokens) {
      documentFrequency[term] = (documentFrequency[term] || 0) + 1;
    }
    return { id: doc.id, tokens };
  });

  // 2. Corpus statistics
  const avgDocLength =
    documents.length > 0 ? totalTokens / documents.length : 0;

  // 3. Build vectors (id-based)
  const documentVectors = new Map<Document["id"], Map<string, number>>();

  for (const { id, tokens } of tokenized) {
    documentVectors.set(
      id,
      scoring(tokens, {
        totalDocs: documents.length,
        documentFrequency,
        avgDocLength,
      }),
    );
  }

  return { documentFrequency, documentVectors, avgDocLength };
}
