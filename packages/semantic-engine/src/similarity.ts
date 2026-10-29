// ────────────────────────────────────────────────────────────────────────────
// Cosine Similarity for Sparse Vectors
// ────────────────────────────────────────────────────────────────────────────

/**
 * Compute the cosine similarity between two sparse vectors.
 *
 * cosine(A, B) = (A · B) / (‖A‖ × ‖B‖)
 *
 * Both vectors are represented as Map<string, number> where keys are
 * terms and values are weights (e.g., TF-IDF scores).
 *
 * @param vecA - First sparse vector
 * @param vecB - Second sparse vector
 * @returns Similarity score in [0, 1]. Returns 0 if either vector is empty.
 */
export function cosineSimilarity(
  vecA: Map<string, number>,
  vecB: Map<string, number>,
): number {
  if (vecA.size === 0 || vecB.size === 0) {
    return 0;
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  // Iterate over the smaller vector for efficiency
  const [smaller, larger] = vecA.size <= vecB.size ? [vecA, vecB] : [vecB, vecA];

  for (const [term, weightA] of smaller.entries()) {
    const weightB = larger.get(term);
    if (weightB !== undefined) {
      dotProduct += weightA * weightB;
    }
  }

  for (const weight of vecA.values()) {
    magnitudeA += weight * weight;
  }

  for (const weight of vecB.values()) {
    magnitudeB += weight * weight;
  }

  const magnitude = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);

  if (magnitude === 0) {
    return 0;
  }

  return dotProduct / magnitude;
}
