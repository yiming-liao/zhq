/**
 * 計算兩個稀疏向量的餘弦相似度 (Cosine Similarity)
 *
 * 公式：cosθ = (A · B) / (||A|| * ||B||)
 * 其中：
 *  - A · B 是兩向量的內積 (dot product)
 *  - ||A||、||B|| 是向量的 L2 範數 (Euclidean norm)
 *
 * @param a 向量 A (稀疏向量)
 * @param b 向量 B (稀疏向量)
 * @returns 相似度值，範圍 0~1，越接近 1 表示越相似
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
