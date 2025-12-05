/* eslint-disable @typescript-eslint/no-explicit-any */
import type { DocItem } from "@/types";
import { ZHQ } from "@/zhq";

interface CreateZhqOptions {
  wasmPath?: string;
}

/**
 * 創建 ZHQ 實例並初始化
 * - 若傳入 docItems，會自動初始化 Jieba 並建索引
 * - 可選預先計算每個文檔的 TF-IDF 向量
 */
export async function createZhq<T = unknown>(
  docItems?: ReadonlyArray<DocItem<T>>,
  { wasmPath = "/jieba_rs_wasm_bg.wasm" }: CreateZhqOptions = {},
): Promise<ZHQ<T>> {
  const zhq = new ZHQ<T>(docItems);

  if (docItems) {
    await zhq.initJieba(wasmPath);
    zhq.buildIndex(docItems as any);
  }

  return zhq;
}
