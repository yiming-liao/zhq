export interface DocItem<T = unknown> {
  key: string; // 搜尋用的主要文字、標題或索引詞
  content: string; // 真正的資料內容，可全文或摘要
  metadata?: T; // 額外資訊，如分類、來源、時間戳、標籤等
}

export type DocumentFrequency = Record<string, number>;

export type DocItemsTokens = string[][];

export type DocItemsVectors = Map<string, number>[];
