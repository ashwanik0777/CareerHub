import { FieldPrediction, ConfidenceLevel, MappingSource } from '@platform/types';
import { RankedPrediction } from '../types';

/**
 * Formats a list of RankedPredictions into a canonical FieldPrediction payload,
 * separating the top prediction and listing the remaining top predictions as alternatives.
 */
export function formatPredictionResponse(ranked: RankedPrediction[]): FieldPrediction {
  if (ranked.length === 0) {
    return {
      attributeId: '',
      confidence: 0.0,
      confidenceLevel: ConfidenceLevel.LOW,
      source: MappingSource.AI_REASONING,
      reasoning: 'MiniLM classifier yielded no prediction mappings.',
      alternativeMappings: [],
    };
  }

  const top = ranked[0]!;
  const alternatives = ranked.slice(1).map((alt) => ({
    attributeId: alt.attributeId,
    confidence: alt.confidence,
    source: alt.source,
  }));

  return {
    attributeId: top.attributeId,
    confidence: top.confidence,
    confidenceLevel: top.confidenceLevel,
    source: top.source,
    reasoning: top.reasoning,
    alternativeMappings: alternatives,
  };
}
