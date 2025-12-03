import type { DocumentFrequency } from "../types";

/**
 * 計算 TF-IDF 向量
 *
 * - 將輸入的分詞結果轉換為稀疏向量 (Map<string, number>)。
 *
 * TF-IDF 公式：
 * - TF (Term Frequency) = 詞在文檔中出現次數 / 文檔總詞數
 * - IDF (Inverse Document Frequency) = log((總文檔數 + 1) / (包含該詞的文檔數 + 1)) + 1
 *
 * @param tokens - 文檔的分詞結果陣列
 * @param total - 文檔總數，用於計算 IDF
 * @param documentFrequency - 全域文檔頻率 (每個詞出現的文檔數)
 * @returns 每個詞對應的 TF-IDF 權重 Map<string, number>
 */
export function tfidf(
  tokens: string[],
  total: number,
  documentFrequency: DocumentFrequency,
): Map<string, number> {
  const vector = new Map<string, number>();
  const counts: Record<string, number> = {};

  // 統計每個詞的出現次數
  tokens.forEach((t) => (counts[t] = (counts[t] || 0) + 1));

  // 計算 TF-IDF
  for (const t in counts) {
    const tf = counts[t] / tokens.length; // 標準化 TF
    const idf = Math.log((total + 1) / ((documentFrequency?.[t] || 0) + 1)) + 1; // 平滑 IDF
    vector.set(t, tf * idf);
  }

  return vector;
}
