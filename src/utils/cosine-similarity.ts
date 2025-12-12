/**
 * Compute cosine similarity between two sparse vectors.
 *
 * - Measures the angular similarity of two weighted term vectors.
 * - Commonly used to compare document and query vectors.
 *
 * Formula:
 *   cos(θ) = (A · B) / (||A|| * ||B||)
 */
export function cosineSimilarity(
  a: Map<string, number>,
  b: Map<string, number>,
) {
  let dot = 0,
    normA = 0,
    normB = 0;

  // 計算 A · B 與 ||A||^2
  for (const [term, val] of a) {
    dot += val * (b.get(term) || 0);
    normA += val * val;
  }

  // 計算 ||B||^2
  for (const val of b.values()) {
    normB += val * val;
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dot / denominator;
}
