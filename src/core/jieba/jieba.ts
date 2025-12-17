import { normalizeText } from "@/core/jieba/utils/normalize-text";
import init, { cut_for_search } from "@/jieba-wasm/jieba_rs_wasm";

export async function initJieba(wasmURL: string): Promise<void> {
  await init(wasmURL);
}

export function tokenize(text?: string): string[] {
  if (!text) return [];
  const normalized = normalizeText(text);
  return cut_for_search(normalized);
}
