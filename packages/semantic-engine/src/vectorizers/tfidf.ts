// ────────────────────────────────────────────────────────────────────────────
// TF-IDF Vectorizer — Lightweight Implementation (No External Dependencies)
// ────────────────────────────────────────────────────────────────────────────
// Implements term-frequency × inverse-document-frequency vectorization
// from scratch for use in the semantic similarity strategy.
// ────────────────────────────────────────────────────────────────────────────

/**
 * Common English stop words to exclude from tokenization.
 * Kept intentionally small (~35 words) to balance noise reduction
 * with domain-specific term preservation.
 */
export const STOP_WORDS: Set<string> = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to',
  'for', 'of', 'with', 'by', 'from', 'is', 'it', 'as', 'be', 'was',
  'are', 'been', 'has', 'have', 'had', 'do', 'does', 'did', 'not',
  'this', 'that', 'they', 'we', 'you', 'he', 'she', 'its',
]);

/**
 * Tokenize text into normalized terms.
 * - Converts to lowercase
 * - Splits on non-alphanumeric characters
 * - Removes stop words
 * - Filters tokens shorter than 2 characters
 *
 * @param text - Raw text to tokenize
 * @returns Array of cleaned, normalized tokens
 */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(token => token.length >= 2 && !STOP_WORDS.has(token));
}

/**
 * Lightweight TF-IDF vectorizer for sparse text representations.
 *
 * Usage:
 *   const vectorizer = new TfIdfVectorizer();
 *   vectorizer.fit(corpus);
 *   const vec = vectorizer.transform("query text");
 */
export class TfIdfVectorizer {
  /** IDF values for each term in the vocabulary */
  private idf: Map<string, number> = new Map();
  /** Total number of documents in the fitted corpus */
  private documentCount = 0;

  /**
   * Fit the vectorizer on a corpus of documents.
   * Computes IDF(t) = ln(N / df(t)) for every term t,
   * where N is the corpus size and df(t) is the document frequency.
   *
   * @param documents - Array of raw text documents
   */
  fit(documents: string[]): void {
    this.documentCount = documents.length;
    const documentFrequency: Map<string, number> = new Map();

    for (const doc of documents) {
      // Unique terms in this document
      const uniqueTerms = new Set(tokenize(doc));
      for (const term of uniqueTerms) {
        documentFrequency.set(term, (documentFrequency.get(term) || 0) + 1);
      }
    }

    // Compute IDF with smoothing to avoid division-by-zero
    this.idf = new Map();
    for (const [term, df] of documentFrequency.entries()) {
      this.idf.set(term, Math.log((this.documentCount + 1) / (df + 1)) + 1);
    }
  }

  /**
   * Transform a single text into a TF-IDF sparse vector.
   * Must be called after fit().
   *
   * TF(t,d) = count(t,d) / |d|
   * TF-IDF(t,d) = TF(t,d) × IDF(t)
   *
   * @param text - Raw text to vectorize
   * @returns Sparse vector as Map<term, tfidfScore>
   */
  transform(text: string): Map<string, number> {
    const tokens = tokenize(text);
    const termFreq: Map<string, number> = new Map();

    for (const token of tokens) {
      termFreq.set(token, (termFreq.get(token) || 0) + 1);
    }

    const vector: Map<string, number> = new Map();
    const docLength = tokens.length || 1; // Prevent division by zero

    for (const [term, count] of termFreq.entries()) {
      const tf = count / docLength;
      const idf = this.idf.get(term) || Math.log(this.documentCount + 1) + 1;
      vector.set(term, tf * idf);
    }

    return vector;
  }

  /**
   * Convenience method: fit on the corpus and transform all documents.
   *
   * @param documents - Array of raw text documents
   * @returns Array of sparse TF-IDF vectors, one per document
   */
  fitTransform(documents: string[]): Map<string, number>[] {
    this.fit(documents);
    return documents.map(doc => this.transform(doc));
  }
}
