import type { DocumentInput } from "@/types";
import { WASM_CDN_URL } from "@/constants";
import { ZHQ } from "@/zhq";

interface CreateZhqOptions {
  /**
   * URL to the Jieba WASM file.
   * - Can be a local path or a remote CDN URL.
   */
  wasmURL?: string;
}

/**
 * 創建 ZHQ 實例並初始化
 *
 * - 若提供 documents，會自動初始化 Jieba 並建立搜尋索引。
 * - 若未提供 documents，則回傳尚未初始化的 ZHQ，引擎可於之後手動初始化。
 */
export async function createZhq<T = unknown>(
  documents?: ReadonlyArray<DocumentInput<T>>,
  { wasmURL = WASM_CDN_URL }: CreateZhqOptions = {},
): Promise<ZHQ<T>> {
  const zhq = new ZHQ<T>();

  if (documents) {
    await zhq.initJieba(wasmURL);
    zhq.buildIndex(documents);
  }

  return zhq;
}
