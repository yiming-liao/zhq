import type {
  DocItem,
  DocItemsTokens,
  DocItemsVectors,
  DocumentFrequency,
} from "@/types";
import { tokenize } from "@/core/jieba";
import { tfidf } from "@/utils/tf-idf";

/**
 * 建立 TF-IDF 索引
 *
 * @param docItems - 文件列表，每個文件需包含 `key` 與 `content`。
 * @returns 一個物件，包含：
 *   - `documentFrequency`：`Record<string, number>`，詞與其文檔頻率對應表。
 *   - `docItemsTokens`：`string[][]`，每個文件的斷詞結果。
 *   - `docItemsVectors`：`Map<string, number>[]`，每個文件的 TF-IDF 向量（若 `precomputeVectors=true`）。
 */
export function buildIndex<T>(docItems: ReadonlyArray<DocItem<T>>): {
  documentFrequency: DocumentFrequency;
  docItemsTokens: DocItemsTokens;
  docItemsVectors?: DocItemsVectors;
} {
  const documentFrequency: DocumentFrequency = {};

  const docItemsTokens = docItems.map(({ key }) => {
    const tokens = tokenize(key); // 斷詞
    const uniqueTokens = new Set(tokens); // 去重複
    uniqueTokens.forEach((t) => {
      documentFrequency[t] = (documentFrequency[t] || 0) + 1;
    });
    return tokens;
  });

  const docItemsVectors = docItemsTokens.map((tokens) =>
    tfidf(tokens, docItems.length, documentFrequency),
  );

  return { documentFrequency, docItemsTokens, docItemsVectors };
}
