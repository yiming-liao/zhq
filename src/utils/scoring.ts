import type { DocumentFrequency } from "@/types";

/**
 * Compute scoring vector for search (BM25-based).
 *
 * - Converts tokenized text into a sparse vector (term → weight).
 * - Used for both index-time and query-time scoring.
 *
 * BM25 parameters:
 * - k1: term frequency saturation (default: 1.2)
 * - b: document length normalization (default: 0.75)
 */
export function scoring(
  tokens: string[],
  ctx: {
    totalDocs: number;
    documentFrequency: DocumentFrequency;
    avgDocLength: number;
    k1?: number;
    b?: number;
  },
): Map<string, number> {
  const {
    totalDocs,
    documentFrequency,
    avgDocLength,
    k1 = 1.2,
    b = 0.75,
  } = ctx;

  const vector = new Map<string, number>();
  const counts: Record<string, number> = {};

  // Count raw term frequency
  for (const t of tokens) {
    counts[t] = (counts[t] || 0) + 1;
  }

  const docLength = tokens.length || 1;

  for (const term in counts) {
    const tf = counts[term];
    const df = documentFrequency[term] || 0;

    // BM25 IDF (smoothed)
    const idf = Math.log((totalDocs - df + 0.5) / (df + 0.5) + 1);

    // BM25 term score
    const score =
      idf *
      ((tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (docLength / avgDocLength))));

    vector.set(term, score);
  }

  return vector;
}
