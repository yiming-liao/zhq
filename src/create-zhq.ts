import type { DocumentInput } from "@/types";
import { ZHQ } from "@/zhq";

interface CreateZhqOptions {
  wasmPath?: string;
}

/**
 * 創建 ZHQ 實例並初始化
 *
 * - 若提供 documents，會自動初始化 Jieba 並建立搜尋索引。
 * - 若未提供 documents，則回傳尚未初始化的 ZHQ，引擎可於之後手動初始化。
 */
export async function createZhq<T = unknown>(
  documents?: ReadonlyArray<DocumentInput<T>>,
  { wasmPath = "/jieba_rs_wasm_bg.wasm" }: CreateZhqOptions = {},
): Promise<ZHQ<T>> {
  const zhq = new ZHQ<T>();

  if (documents) {
    await zhq.initJieba(wasmPath);
    zhq.buildIndex(documents);
  }

  return zhq;
}
