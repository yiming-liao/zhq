import type { DocItem } from "../export";
import { ZHQ } from "./zhq";

interface CreateZhqOptions {
  wasmPath?: string;
  precomputeVectors?: boolean;
}

/**
 * 創建 ZHQ 實例並初始化
 * - 若傳入 docItems，會自動初始化 Jieba 並建索引
 * - 可選預先計算每個文檔的 TF-IDF 向量
 */
export async function createZhq(
  docItems?: DocItem[],
  {
    wasmPath = "/jieba_rs_wasm_bg.wasm",
    precomputeVectors = false,
  }: CreateZhqOptions = {},
): Promise<ZHQ> {
  const zhq = new ZHQ(docItems);
  if (docItems) {
    await zhq.initJieba(wasmPath);
    zhq.buildIndex(docItems, precomputeVectors);
  }
  return zhq;
}
