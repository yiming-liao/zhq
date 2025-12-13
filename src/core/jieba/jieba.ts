import { normalizeText } from "@/core/jieba/utils/normalize-text";
import init, { cut_for_search } from "@/jieba-wasm/jieba_rs_wasm";

export async function initJieba(
  wasmPath = "/jieba_rs_wasm_bg.wasm",
): Promise<void> {
  await init(wasmPath);
}

export function tokenize(text?: string): string[] {
  if (!text) return [];
  const normalized = normalizeText(text);
  return cut_for_search(normalized);
}
