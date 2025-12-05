import type {
  DocItem,
  DocItemsTokens,
  DocItemsVectors,
  DocumentFrequency,
} from "@/types";
import { buildIndex } from "@/core/build-index";
import { initJieba } from "@/core/jieba";
import { query, type QueryResult } from "@/core/query";

export class ZHQ<T = unknown> {
  // Internal state
  private _jiebaReady = false;
  private _indexReady = false;
  private _indexPromise: Promise<void> | null = null;
  // DocItem related
  private _docItems?: ReadonlyArray<DocItem<T>>;
  private documentFrequency?: DocumentFrequency;
  private docItemsTokens?: DocItemsTokens;
  private docItemsVectors?: DocItemsVectors;
  // Events
  onJiebaReady?: () => void;
  onIndexReady?: () => void;
  onError?: (err: unknown) => void;

  constructor(docItems?: ReadonlyArray<DocItem<T>>) {
    if (docItems) this._docItems = docItems;
  }

  // Getters
  get docItems() {
    return this._docItems;
  }

  /** 初始化 Jieba */
  async initJieba(wasmPath = "/jieba_rs_wasm_bg.wasm") {
    if (this._jiebaReady) return;
    try {
      await initJieba(wasmPath);
      this._jiebaReady = true;
      this.onJiebaReady?.();
    } catch (error) {
      this.onError?.(error);
      throw error;
    }
  }

  /** 存入索引結果 */
  private applyIndexResult(
    docItems: ReadonlyArray<DocItem<T>>,
    result: {
      documentFrequency: DocumentFrequency;
      docItemsTokens: DocItemsTokens;
      docItemsVectors?: DocItemsVectors;
    },
  ) {
    this._docItems = docItems;
    this.documentFrequency = result.documentFrequency;
    this.docItemsTokens = result.docItemsTokens;
    this.docItemsVectors = result.docItemsVectors;
    this._indexReady = true;
    this.onIndexReady?.();
  }

  /** 建立索引（同步） */
  buildIndex(docItems = this._docItems) {
    if (!docItems?.length) {
      throw new Error("buildIndex() 需要有效 docItems");
    }
    try {
      const result = buildIndex<T>(docItems);
      this.applyIndexResult(docItems, result);
    } catch (error) {
      this.onError?.(error);
      throw error;
    }
  }

  /** 建立索引（非同步） */
  buildIndexAsync(docItems = this._docItems): Promise<void> {
    if (!docItems?.length) {
      throw new Error("buildIndexAsync() 需要有效 docItems");
    }
    if (this._indexPromise) {
      return this._indexPromise;
    }
    this._indexPromise = (async () => {
      try {
        const result = await buildIndex<T>(docItems);
        this.applyIndexResult(docItems, result);
      } catch (error) {
        this.onError?.(error);
        throw error;
      } finally {
        this._indexPromise = null;
      }
    })();
    return this._indexPromise;
  }

  /** 查詢（同步，不等待索引） */
  query(
    input: string,
    options?: { topKCandidates?: number; threshold?: number },
  ): QueryResult<T> {
    if (!this._indexReady || !this.docItemsVectors) {
      return { isIndexReady: false, bestMatch: undefined, candidates: [] };
    }
    return query<T>({
      docItems: this._docItems!,
      documentFrequency: this.documentFrequency!,
      docItemsTokens: this.docItemsTokens!,
      docItemsVectors: this.docItemsVectors,
      input,
      topKCandidates: options?.topKCandidates,
      threshold: options?.threshold,
    });
  }

  /** 查詢（非同步，等待索引建立） */
  async queryAsync(
    input: string,
    options?: { topKCandidates?: number; threshold?: number },
  ): Promise<QueryResult<T>> {
    if (this._indexPromise) {
      await this._indexPromise;
    }
    return this.query(input, options);
  }
}
