/* eslint-disable unicorn/no-array-sort */
import type {
  DocItem,
  DocItemsTokens,
  DocItemsVectors,
  DocumentFrequency,
} from "../types";
import { cosineSimilarity } from "../utils/cosine-similarity";
import { tfidf } from "../utils/tf-idf";
import { tokenize } from "./jieba";

/**
 * 查詢結果類型
 * @template T - 每個 DocItem 的 metadata
 */
export type QueryResult<T = unknown> = {
  /** 最匹配的文件，如果沒有超過 threshold，則為 undefined */
  bestMatch?: DocItem<T>;
  /** 其他建議的候選文件（可能為空陣列） */
  candidates: ReadonlyArray<DocItem<T>>;
};

/**
 * 查詢與輸入文字最相似的文件
 *
 * @template T - 每個 DocItem 的 metadata
 *
 * @param docItems - 原始文件列表，每個文件包含 key 與 content
 * @param documentFrequency - 文檔頻率表，用於計算 IDF
 * @param docItemsTokens - 每個文檔的斷詞結果，長度需與 docItems 對應
 * @param docItemsVectors - 可選，預先計算好的每個文檔的 TF-IDF 向量
 * @param input - 使用者輸入文字
 * @param topKCandidates - 返回的候選文件數量（不包含 bestMatch），預設 3
 * @param threshold - 分數閾值，超過才算 bestMatch，否則 bestMatch 為 undefined，預設 0.3
 *
 * @returns 一個物件，包含：
 * - `bestMatch`：最匹配的文檔（可能為 undefined）
 * - `candidates`：其他建議的候選文件，長度最多為 topKCandidates
 */
export function query<T = unknown>({
  docItems,
  documentFrequency,
  docItemsTokens,
  docItemsVectors,
  input,
  topKCandidates = 3,
  threshold = 0.3,
}: {
  docItems: ReadonlyArray<DocItem<T>>;
  documentFrequency: DocumentFrequency;
  docItemsTokens: DocItemsTokens;
  docItemsVectors?: DocItemsVectors;
  input: string;
  topKCandidates?: number;
  threshold?: number;
}): QueryResult<T> {
  if (threshold < 0 || threshold > 1) {
    throw new Error(`threshold 必須介於 0~1 之間，目前值為 ${threshold}`);
  }

  const inputTokens = tokenize(input); // 斷詞處理
  const inputVector = tfidf(inputTokens, docItems.length, documentFrequency); // 計算輸入文字的 TF-IDF 向量

  // 計算每個 docItem 與輸入文字的相似度
  const scoredItems = docItemsTokens.map((tokens, index) => {
    const thisVector =
      docItemsVectors?.[index] ??
      tfidf(tokens, docItems.length, documentFrequency);
    const score = cosineSimilarity(inputVector, thisVector);
    return { index, score };
  });

  const sorted = [...scoredItems].sort((a, b) => b.score - a.score); // 依分數由高到低排序

  if (sorted.length === 0) {
    return { bestMatch: undefined, candidates: [] };
  }

  const bestScore = sorted[0].score;

  // Util
  const getCandidates = (start: number) =>
    sorted
      .slice(start, start + topKCandidates)
      .map((s) => docItems[s.index])
      .filter(Boolean);

  if (bestScore > threshold) {
    // 超過閾值，第一筆為 bestMatch，其餘 topK 作為 candidates
    const candidates = getCandidates(1);
    return { bestMatch: docItems[sorted[0].index], candidates };
  } else {
    // 未超過閾值，bestMatch 為 undefined，回傳前 topK candidates
    const candidates = getCandidates(0);
    return { bestMatch: undefined, candidates };
  }
}
