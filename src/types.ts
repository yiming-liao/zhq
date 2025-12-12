/** 單一可搜尋文件 */
export interface Document<T = unknown> {
  /** 文件唯一識別 */
  id: string;
  /** 用於搜尋與計分的文字 */
  text: string;
  /** 顯示用的原始內容 */
  content: string;
  /** 附加資料 */
  metadata?: T;
}

/** 可被加入索引的原始文件輸入 */
export type DocumentInput<T = unknown> = Omit<Document<T>, "id"> & {
  /** 若未提供則自動生成 */
  id?: string;
};

/** 已包含相似度分數的文件 */
export type ScoredDocument<T = unknown> = Document<T> & {
  /** 查詢所計算出的分數 */
  score: number;
};

/** 詞的文件頻率表 */
export type DocumentFrequency = Record<string, number>;

/** 每個文件的搜尋向量 */
export type DocumentVectors = Map<Document["id"], Map<string, number>>;

/** 搜尋索引 */
export type SearchIndex = Readonly<{
  /** 詞的文件頻率表 */
  documentFrequency: DocumentFrequency;
  /** 每個文件的搜尋向量 */
  documentVectors: DocumentVectors;
  /** 文件平均長度 */
  avgDocLength: number;
}>;

/** 單一查詢的搜尋結果 */
export type QueryResult<T = unknown> = {
  /** 索引是否已建立完成 */
  isIndexReady: boolean;
  /** 最佳匹配的文件 */
  bestMatch: ScoredDocument<T> | undefined;
  /** 其他候選文件 */
  candidates: ScoredDocument<T>[];
};
