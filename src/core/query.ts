/* eslint-disable unicorn/no-array-sort */
import type {
  Document,
  QueryResult,
  ScoredDocument,
  SearchIndex,
} from "@/types";
import { tokenize } from "@/core/jieba";
import { cosineSimilarity } from "@/utils/cosine-similarity";
import { scoring } from "@/utils/scoring";

export interface QueryOptions {
  topKCandidates?: number;
  threshold?: number;
}

/**
 * Search documents and return the most relevant matches.
 */
export function query<T>(
  documents: ReadonlyArray<Document<T>>,
  index: SearchIndex,
  input: string,
  { topKCandidates = 3, threshold = 0.3 }: QueryOptions,
): QueryResult<T> {
  if (threshold < 0 || threshold > 1) {
    throw new Error(`threshold must be between 0 and 1, got ${threshold}`);
  }

  if (documents.length === 0) {
    return {
      isIndexReady: false,
      bestMatch: undefined,
      candidates: [],
    };
  }

  const { documentFrequency, documentVectors, avgDocLength } = index;

  // Build lookup table once
  const documentMap = new Map(documents.map((doc) => [doc.id, doc]));

  // 1. Tokenize query
  const queryTokens = tokenize(input);

  // 2. Build query vector
  const queryVector = scoring(queryTokens, {
    totalDocs: documents.length,
    documentFrequency,
    avgDocLength,
  });

  // 3. Score documents by id
  const scored = [...documentVectors.entries()]
    .map(([id, vector]) => {
      const document = documentMap.get(id);
      if (!document) return null;
      return {
        ...document,
        score: cosineSimilarity(queryVector, vector),
      };
    })
    .filter(Boolean) as ScoredDocument<T>[];

  // 4. Rank
  const ranked = scored.sort((a, b) => b.score - a.score);
  const bestScore = ranked[0]?.score ?? 0;

  const pick = (start: number) => ranked.slice(start, start + topKCandidates);

  if (bestScore > threshold) {
    return {
      isIndexReady: true,
      bestMatch: ranked[0],
      candidates: pick(1),
    };
  }

  return {
    isIndexReady: true,
    bestMatch: undefined,
    candidates: pick(0),
  };
}
