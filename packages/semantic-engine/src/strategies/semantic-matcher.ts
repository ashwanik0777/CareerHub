// ────────────────────────────────────────────────────────────────────────────
// Semantic Matcher Strategy — TF-IDF + Cosine Similarity
// ────────────────────────────────────────────────────────────────────────────
// Pre-computes TF-IDF vectors for all ontology attributes and uses
// cosine similarity to rank matches against field descriptors.
// ────────────────────────────────────────────────────────────────────────────

import { FieldPrediction, ConfidenceLevel, MappingSource } from '@platform/types';
import { FieldDescriptor, MappingStrategy } from '../interfaces';
import { getAllAttributes, getSearchableText } from '../ontology-registry';
import { TfIdfVectorizer } from '../vectorizers/tfidf';
import { cosineSimilarity } from '../similarity';

// ── Strategy Implementation ─────────────────────────────────────────────────

/**
 * Semantic Matcher Strategy.
 *
 * On instantiation, fits a TF-IDF vectorizer on the full ontology corpus
 * and pre-computes vectors for every attribute. At analysis time, transforms
 * the field descriptor into TF-IDF space and ranks by cosine similarity.
 */
export class SemanticMatcherStrategy implements MappingStrategy {
  readonly name = 'semantic_matcher';
  readonly weight = 0.15;

  /** Pre-computed TF-IDF vectors for each ontology attribute */
  private readonly attributeVectors: Map<string, Map<string, number>> = new Map();
  /** Fitted vectorizer instance */
  private readonly vectorizer: TfIdfVectorizer;

  /** Minimum cosine similarity to include in results */
  private readonly minThreshold = 0.05;

  constructor() {
    const attributes = getAllAttributes();

    // Build the corpus from searchable text of all attributes
    const corpus = attributes.map(attr => getSearchableText(attr));

    // Fit the vectorizer on the ontology corpus
    this.vectorizer = new TfIdfVectorizer();
    const vectors = this.vectorizer.fitTransform(corpus);

    // Store pre-computed vectors keyed by attribute ID
    for (let i = 0; i < attributes.length; i++) {
      this.attributeVectors.set(attributes[i].id, vectors[i]);
    }
  }

  analyze(descriptor: FieldDescriptor): FieldPrediction[] {
    // Build query text from all field properties
    const queryText = [
      descriptor.label,
      descriptor.placeholder,
      descriptor.name,
      descriptor.id,
      descriptor.ariaLabel,
      descriptor.title,
      descriptor.nearbyText,
      descriptor.parentSection,
      descriptor.formContext,
    ]
      .filter(Boolean)
      .join(' ');

    if (!queryText.trim()) return [];

    // Transform query into TF-IDF space
    const queryVector = this.vectorizer.transform(queryText);

    // Compute cosine similarity against all ontology vectors
    const candidates: Array<{ attributeId: string; similarity: number }> = [];

    for (const [attrId, attrVector] of this.attributeVectors.entries()) {
      const similarity = cosineSimilarity(queryVector, attrVector);
      if (similarity > this.minThreshold) {
        candidates.push({ attributeId: attrId, similarity });
      }
    }

    // Sort descending and take top 5
    candidates.sort((a, b) => b.similarity - a.similarity);
    const top5 = candidates.slice(0, 5);

    return top5.map(candidate => ({
      attributeId: candidate.attributeId,
      confidence: Math.min(candidate.similarity, 0.95), // Cap at 0.95
      confidenceLevel: this.classifyConfidence(candidate.similarity),
      source: MappingSource.SEMANTIC_SIMILARITY,
      reasoning: `Semantic matcher computed cosine similarity of ${candidate.similarity.toFixed(3)} between field TF-IDF vector and ontology attribute '${candidate.attributeId}'`,
    }));
  }

  private classifyConfidence(similarity: number): ConfidenceLevel {
    if (similarity >= 0.60) return ConfidenceLevel.HIGH;
    if (similarity >= 0.30) return ConfidenceLevel.MEDIUM;
    return ConfidenceLevel.LOW;
  }
}
