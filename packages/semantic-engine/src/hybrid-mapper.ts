// ────────────────────────────────────────────────────────────────────────────
// Hybrid Mapper — Weighted Fusion of Strategy Predictions
// ────────────────────────────────────────────────────────────────────────────
// Combines predictions from all active strategies using a weighted voting
// scheme. Deduplicates, re-ranks, and classifies confidence levels.
// ────────────────────────────────────────────────────────────────────────────

import { FieldPrediction, ConfidenceLevel, MappingSource } from '@platform/types';
import { FieldDescriptor, MappingStrategy, EngineConfig } from './interfaces';

/**
 * Fuse predictions from multiple strategies using weighted combination.
 *
 * For each unique attributeId across all strategy outputs:
 *   best   = max(prediction.confidence)                       (the floor)
 *   support = Σ (strategy.weight × confidence) over the OTHER agreeing strategies
 *   fused  = best + (1 − best) × support / Σ(all active strategy weights)
 *
 * The strongest single strategy sets a floor so a strong exact match can never
 * be dragged below the selection threshold by weak agreement, while every
 * additional agreeing strategy raises the score in proportion to its weight.
 * (A plain weighted mean would always be ≤ the max and therefore never change
 * the ranking; a plain max would make the weights meaningless.)
 *
 * The result is a deduplicated list of predictions sorted by fused confidence.
 *
 * @param descriptor - The field being analyzed
 * @param strategies - Active mapping strategies
 * @param config - Engine configuration for thresholds
 * @returns Fused, ranked predictions with classified confidence levels
 */
export function fuseStrategies(
  descriptor: FieldDescriptor,
  strategies: MappingStrategy[],
  config: EngineConfig,
): { predictions: FieldPrediction[]; strategiesUsed: string[] } {
  // Collect predictions from all strategies
  const allPredictions: Array<{
    prediction: FieldPrediction;
    strategyWeight: number;
    strategyName: string;
  }> = [];

  const strategiesUsed: string[] = [];

  for (const strategy of strategies) {
    const predictions = strategy.analyze(descriptor);
    if (predictions.length > 0) {
      strategiesUsed.push(strategy.name);
      for (const pred of predictions) {
        allPredictions.push({
          prediction: pred,
          strategyWeight: strategy.weight,
          strategyName: strategy.name,
        });
      }
    }
  }

  // Group by attributeId and compute weighted fusion
  const fusedMap: Map<
    string,
    {
      weightedSum: number;
      totalWeight: number;
      maxConfidence: number;
      bestWeightedScore: number;
      bestSource: MappingSource;
      bestReasoning: string;
      sources: Array<{ attributeId: string; confidence: number; source: MappingSource }>;
    }
  > = new Map();

  const totalStrategyWeight = strategies.reduce((sum, st) => sum + st.weight, 0);

  for (const { prediction, strategyWeight } of allPredictions) {
    const existing = fusedMap.get(prediction.attributeId);
    if (existing) {
      existing.weightedSum += strategyWeight * prediction.confidence;
      existing.totalWeight += strategyWeight;
      // Keep the highest individual confidence source
      if (prediction.confidence > existing.maxConfidence) {
        existing.maxConfidence = prediction.confidence;
        existing.bestWeightedScore = strategyWeight * prediction.confidence;
        existing.bestSource = prediction.source;
        existing.bestReasoning = prediction.reasoning;
      }
      existing.sources.push({
        attributeId: prediction.attributeId,
        confidence: prediction.confidence,
        source: prediction.source,
      });
    } else {
      fusedMap.set(prediction.attributeId, {
        weightedSum: strategyWeight * prediction.confidence,
        totalWeight: strategyWeight,
        maxConfidence: prediction.confidence,
        bestWeightedScore: strategyWeight * prediction.confidence,
        bestSource: prediction.source,
        bestReasoning: prediction.reasoning,
        sources: [
          {
            attributeId: prediction.attributeId,
            confidence: prediction.confidence,
            source: prediction.source,
          },
        ],
      });
    }
  }

  // Convert fused map to sorted predictions
  const fusedPredictions: FieldPrediction[] = [];

  for (const [attributeId, fused] of fusedMap.entries()) {
    // Floor = strongest single strategy; agreement from the other strategies
    // closes part of the remaining gap to 1.0 in proportion to their weights.
    const support = Math.max(0, fused.weightedSum - fused.bestWeightedScore);
    const agreement = totalStrategyWeight > 0 ? Math.min(1, support / totalStrategyWeight) : 0;
    const fusedConfidence = fused.maxConfidence + (1 - fused.maxConfidence) * agreement;
    const clampedConfidence = Math.min(Math.max(fusedConfidence, 0), 1.0);

    fusedPredictions.push({
      attributeId,
      confidence: clampedConfidence,
      confidenceLevel: classifyConfidence(clampedConfidence, config),
      source: fused.bestSource,
      reasoning: `Hybrid fusion (${strategiesUsed.join(', ')}): ${fused.bestReasoning}`,
      alternativeMappings: undefined, // filled below once all candidates are known
    });
  }

  // Sort by confidence descending
  fusedPredictions.sort((a, b) => b.confidence - a.confidence);

  // Alternatives are the *other* candidate attributes (next best up to 3),
  // not the same attribute as seen by other strategies.
  for (let i = 0; i < fusedPredictions.length; i++) {
    const alternatives = fusedPredictions
      .filter((_, j) => j !== i)
      .slice(0, 3)
      .map((p) => ({ attributeId: p.attributeId, confidence: p.confidence, source: p.source }));
    fusedPredictions[i]!.alternativeMappings = alternatives.length > 0 ? alternatives : undefined;
  }

  return { predictions: fusedPredictions, strategiesUsed };
}

/**
 * Classify a confidence score into HIGH, MEDIUM, or LOW based on
 * the engine configuration thresholds.
 */
function classifyConfidence(confidence: number, config: EngineConfig): ConfidenceLevel {
  if (confidence >= config.highConfidenceThreshold) return ConfidenceLevel.HIGH;
  if (confidence >= config.mediumConfidenceThreshold) return ConfidenceLevel.MEDIUM;
  return ConfidenceLevel.LOW;
}
