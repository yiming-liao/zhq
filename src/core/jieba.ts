import init, { cut_for_search } from "@/jieba-wasm/jieba_rs_wasm";

/**
 * 初始化 Jieba WASM
 * @param wasmPath - 載入 WASM 檔案的路徑
 */
export async function initJieba(
  wasmPath = "/jieba_rs_wasm_bg.wasm",
): Promise<void> {
  await init(wasmPath);
}

/**
 * 對文字進行斷詞
 * @param text - 要斷詞的文字
 * @returns 斷詞後的字串陣列
 */
export function tokenize(text?: string): string[] {
  if (!text) return [];
  return cut_for_search(text);
}
