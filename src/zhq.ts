import type {
  Document,
  DocumentInput,
  QueryResult,
  SearchIndex,
} from "@/types";
import { WASM_CDN_URL } from "@/constants";
import { buildIndex, buildIndexAsync } from "@/core/build-index";
import { initJieba } from "@/core/jieba";
import { query } from "@/core/query/query";
import { safeRandomId } from "@/utils/safe-random-id";

/**
 * ZHQ 是一個純前端中文全文搜尋引擎，支援預先建索引並在瀏覽器中即時查詢。
 */
export class ZHQ<T = unknown> {
  // Runtime state
  private _jiebaReady = false;
  private _buildingIndex: Promise<void> | null = null;
  // Documents & search index
  private _documents?: ReadonlyArray<Document<T>>;
  private _index?: SearchIndex;
  // Lifecycle events
  onJiebaReady?: () => void;
  onIndexReady?: () => void;
  onProgress?: (progress: number) => void;
  onError?: (err: unknown) => void;

  /** 目前使用的文件集合 */
  get documents() {
    return this._documents;
  }

  private normalizeDocuments(
    documents: ReadonlyArray<DocumentInput<T>>,
  ): ReadonlyArray<Document<T>> {
    return documents.map((doc) => ({
      ...doc,
      id: doc.id ?? safeRandomId(),
    }));
  }

  /** 初始化 Jieba */
  async initJieba(wasmURL = WASM_CDN_URL) {
    if (this._jiebaReady) return;
    try {
      await initJieba(wasmURL);
      this._jiebaReady = true;
      this.onJiebaReady?.();
    } catch (error) {
      this.onError?.(error);
      throw error;
    }
  }

  /** 存入索引結果 */
  private applyIndexResult(
    documents: ReadonlyArray<Document<T>>,
    result: SearchIndex,
  ) {
    this._documents = documents;
    this._index = result;
    this.onIndexReady?.();
  }

  /**
   * 建立搜尋索引（同步）。
   * - 需先提供有效的文件集合。
   */
  buildIndex(documents: ReadonlyArray<DocumentInput<T>>) {
    if (!documents?.length) {
      throw new Error("buildIndex() 需要有效 documents");
    }
    try {
      const normalizedDocs = this.normalizeDocuments(documents);
      const result = buildIndex<T>(normalizedDocs);
      this.applyIndexResult(normalizedDocs, result);
    } catch (error) {
      this.onError?.(error);
      throw error;
    }
  }

  /**
   * 建立搜尋索引（非同步）。
   * - 需先提供有效的文件集合。
   * - 若已在建立中，會重用同一個 Promise。
   */
  buildIndexAsync(documents: ReadonlyArray<DocumentInput<T>>): Promise<void> {
    if (!documents?.length) {
      throw new Error("buildIndexAsync() 需要有效 documents");
    }
    if (this._buildingIndex) {
      return this._buildingIndex;
    }
    this._buildingIndex = (async () => {
      try {
        const normalizedDocs = this.normalizeDocuments(documents);
        const result = await buildIndexAsync<T>(normalizedDocs, {
          onProgress: this.onProgress,
        });
        this.applyIndexResult(normalizedDocs, result);
      } catch (error) {
        this.onError?.(error);
        throw error;
      } finally {
        this._buildingIndex = null;
      }
    })();
    return this._buildingIndex;
  }

  /**
   * 查詢最相關的文件（同步）。
   * - 若索引尚未建立，會回傳 isIndexReady = false。
   */
  query(
    input: string,
    options?: { topKCandidates?: number; threshold?: number },
  ): QueryResult<T> {
    if (!this._index || !this._documents) {
      return { isIndexReady: false, bestMatch: undefined, candidates: [] };
    }
    return query<T>(this._documents, this._index, input, {
      topKCandidates: options?.topKCandidates,
      threshold: options?.threshold,
    });
  }

  /**
   * 查詢最相關的文件（非同步）。
   * - 會等待索引建立完成後再查詢。
   */
  async queryAsync(
    input: string,
    options?: { topKCandidates?: number; threshold?: number },
  ): Promise<QueryResult<T>> {
    if (this._buildingIndex) {
      await this._buildingIndex;
    }
    return this.query(input, options);
  }
}
