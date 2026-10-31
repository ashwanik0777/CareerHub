// ────────────────────────────────────────────────────────────────────────────
// Keyword Matcher Strategy — Ontology Alias-Based Matching
// ────────────────────────────────────────────────────────────────────────────
// Uses Jaccard similarity between tokenized field text and tokenized
// ontology aliases for flexible, vocabulary-driven matching.
// ────────────────────────────────────────────────────────────────────────────

import { FieldPrediction, ConfidenceLevel, MappingSource } from '@platform/types';
import { FieldDescriptor, MappingStrategy } from '../interfaces';
import { getAllAttributes } from '../ontology-registry';
import { tokenize } from '../vectorizers/tfidf';

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Jaccard similarity: |A ∩ B| / |A ∪ B|
 */
function jaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 && setB.size === 0) return 0;

  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }

  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Build a combined text blob from all descriptor properties.
 */
function getFieldText(descriptor: FieldDescriptor): string {
  return [
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
}

// ── Strategy Implementation ─────────────────────────────────────────────────

/**
 * Keyword Matcher Strategy.
 *
 * For each ontology attribute, computes the Jaccard similarity between
 * the tokenized field text and the tokenized alias set. Returns the
 * top-5 matches above a minimum threshold.
 */
interface AliasIndexEntry {
  attributeId: string;
  tokens: Set<string>;
}

/**
 * Alias token sets are a pure function of the (static) ontology, so they are
 * tokenized exactly once per process instead of on every analyze() call.
 */
let aliasIndex: AliasIndexEntry[] | null = null;

function getAliasIndex(): AliasIndexEntry[] {
  if (!aliasIndex) {
    aliasIndex = getAllAttributes().map((attr) => ({
      attributeId: attr.id,
      tokens: new Set(tokenize([attr.label, ...attr.aliases].join(' '))),
    }));
  }
  return aliasIndex;
}

export class KeywordMatcherStrategy implements MappingStrategy {
  readonly name = 'keyword_matcher';
  readonly weight = 0.20;

  /** Minimum Jaccard similarity to be included in results */
  private readonly minThreshold = 0.05;

  analyze(descriptor: FieldDescriptor): FieldPrediction[] {
    const fieldText = getFieldText(descriptor);
    const fieldTokens = new Set(tokenize(fieldText));

    if (fieldTokens.size === 0) return [];

    const candidates: Array<{ attributeId: string; similarity: number }> = [];

    for (const attr of getAliasIndex()) {
      const similarity = jaccardSimilarity(fieldTokens, attr.tokens);

      if (similarity > this.minThreshold) {
        candidates.push({ attributeId: attr.attributeId, similarity });
      }
    }

    // Sort by similarity descending and take top 5
    candidates.sort((a, b) => b.similarity - a.similarity);
    const top5 = candidates.slice(0, 5);

    return top5.map(candidate => ({
      attributeId: candidate.attributeId,
      confidence: Math.min(candidate.similarity * 1.2, 0.95), // Scale up slightly, cap at 0.95
      confidenceLevel: this.classifyConfidence(candidate.similarity),
      source: MappingSource.KEYWORD_MATCH,
      reasoning: `Keyword matcher found Jaccard similarity of ${candidate.similarity.toFixed(3)} between field tokens and ontology aliases for '${candidate.attributeId}'`,
    }));
  }

  private classifyConfidence(similarity: number): ConfidenceLevel {
    if (similarity >= 0.50) return ConfidenceLevel.HIGH;
    if (similarity >= 0.20) return ConfidenceLevel.MEDIUM;
    return ConfidenceLevel.LOW;
  }
}
