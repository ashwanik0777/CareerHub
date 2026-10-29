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
 *   fusedScore = Σ (strategy.weight × prediction.confidence) / Σ weights
 *
 * The result is a normalized, deduplicated list of predictions sorted
 * by fused confidence.
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
      bestSource: MappingSource;
      bestReasoning: string;
      sources: Array<{ attributeId: string; confidence: number; source: MappingSource }>;
    }
  > = new Map();

  for (const { prediction, strategyWeight } of allPredictions) {
    const existing = fusedMap.get(prediction.attributeId);
    if (existing) {
      existing.weightedSum += strategyWeight * prediction.confidence;
      existing.totalWeight += strategyWeight;
      // Keep the highest individual confidence source
      if (prediction.confidence > existing.maxConfidence) {
        existing.maxConfidence = prediction.confidence;
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
    // Agreement between strategies may only raise a score, never lower it:
    // a strong exact match (e.g. rule engine at 0.92) must not be dragged
    // below the selection threshold by weakly-agreeing noisy strategies,
    // so the strongest single-strategy confidence acts as a floor.
    const weightedAverage = fused.totalWeight > 0 ? fused.weightedSum / fused.totalWeight : 0;
    const fusedConfidence = Math.max(weightedAverage, fused.maxConfidence);
    const clampedConfidence = Math.min(fusedConfidence, 1.0);

    fusedPredictions.push({
      attributeId,
      confidence: clampedConfidence,
      confidenceLevel: classifyConfidence(clampedConfidence, config),
      source: fused.bestSource,
      reasoning: `Hybrid fusion (${strategiesUsed.join(', ')}): ${fused.bestReasoning}`,
      alternativeMappings: fused.sources.length > 1 ? fused.sources.slice(1) : undefined,
    });
  }

  // Sort by confidence descending
  fusedPredictions.sort((a, b) => b.confidence - a.confidence);

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
