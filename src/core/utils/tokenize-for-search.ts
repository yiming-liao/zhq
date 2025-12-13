import { tokenize } from "@/core/jieba";

/**
 * Tokenize input for search purposes.
 * - Expands tokens only when the input cannot be meaningfully split,
 * improving recall for partial or incomplete queries.
 *
 * @example
 * // With search-oriented token expansion
 * tokenizeForSearch("搜尋引");
 * // → ["搜尋引", "搜尋", "引"]
 *
 * // Without token expansion (plain tokenizer)
 * tokenize("搜尋引");
 * // → ["搜尋引"]
 */
export function tokenizeForSearch(input?: string): string[] {
  if (!input) return [];

  let tokens = tokenize(input);

  if (tokens.length <= 1 && input.length >= 2) {
    tokens = [...new Set([tokens[0], input.slice(0, -1), input.slice(-1)])];
  }

  return tokens;
}
