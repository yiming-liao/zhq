import type {
  DocItem,
  DocItemsTokens,
  DocItemsVectors,
  DocumentFrequency,
} from "./types";
import { buildIndex } from "./methods/build-index";
import { initJieba } from "./methods/jieba";
import { query } from "./methods/query";

export class ZHQ<T = unknown> {
  /** 是否已初始化 Jieba */
  private _isJiebaInitialized: boolean = false;
  /** 是否已建立索引 */
  private _isIndexBuilt = false;
  /** 文檔列表 */
  private _docItems: ReadonlyArray<DocItem<T>> | undefined;
  /** 文檔頻率 (DF) */
  private documentFrequency: DocumentFrequency | undefined;
  /** 每個文檔的斷詞結果 */
  private docItemsTokens: DocItemsTokens | undefined;
  /** 每個文檔的 TF-IDF 向量 (可選預先計算) */
  private docItemsVectors: DocItemsVectors | undefined;

  constructor(docItems?: ReadonlyArray<DocItem<T>>) {
    if (docItems) this._docItems = docItems;
  }

  get isJiebaInitialized() {
    return this._isJiebaInitialized;
  }

  get isIndexBuilt() {
    return this._isIndexBuilt;
  }

  get docItems() {
    return this._docItems;
  }

  /** 初始化 Jieba */
  async initJieba(wasmPath = "/jieba_rs_wasm_bg.wasm") {
    if (!this._isJiebaInitialized) {
      await initJieba(wasmPath);
      this._isJiebaInitialized = true;
    }
  }

  /** 建立 TF-IDF 索引 */
  buildIndex(docItems = this._docItems, precomputeVectors = false) {
    if (!docItems) throw new Error("請提供 docItems 或在 constructor 傳入");
    if (docItems.length === 0)
      throw new Error("buildIndex() 需要有效 docItems。");
    const { documentFrequency, docItemsTokens, docItemsVectors } = buildIndex(
      docItems,
      precomputeVectors,
    );
    this._docItems = docItems;
    this.documentFrequency = documentFrequency;
    this.docItemsTokens = docItemsTokens;
    this.docItemsVectors = docItemsVectors;
    this._isIndexBuilt = true;
  }

  /** 查詢與輸入文字最相似的文檔 */
  query(
    input: string,
    options?: { topKCandidates?: number; threshold?: number },
  ) {
    if (!this.isIndexBuilt) {
      throw new Error("索引尚未建立，請先呼叫 buildIndex()");
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
}
