import { MappingSource } from '@platform/types';
import { CLASS_TO_ATTRIBUTE } from '../labels';
import { getConfidenceLevel, isReviewRequired } from './confidence';
import { RankedPrediction, ModelPrediction } from '../types';

/**
 * Collapses raw class predictions into canonical professional ontology attributes,
 * summing probabilities for collapsed classes (e.g. contact.address_* into personalInfo.location).
 * Drops null (abstained) predictions, re-sorts descending, and returns the top 5.
 */
export function rankPredictions(rawPredictions: ModelPrediction[]): RankedPrediction[] {
  const attributeSums = new Map<string, number>();

  for (const pred of rawPredictions) {
    if (!pred || typeof pred.probability !== 'number') continue;
    const attributeId = CLASS_TO_ATTRIBUTE[pred.classLabel];
    if (attributeId === null || attributeId === undefined) {
      continue; // Skip miscellaneous and abstained mappings
    }

    const currentSum = attributeSums.get(attributeId) || 0;
    attributeSums.set(attributeId, currentSum + pred.probability);
  }

  // Map aggregated attributes to RankedPrediction array
  const ranked: RankedPrediction[] = Array.from(attributeSums.entries()).map(
    ([attributeId, probability]) => {
      // Bound probability to [0, 1] just in case of numerical floating point errors
      const boundedProbability = Math.min(1.0, Math.max(0.0, probability));

      return {
        attributeId,
        confidence: boundedProbability,
        confidenceLevel: getConfidenceLevel(boundedProbability),
        source: MappingSource.AI_REASONING,
        reasoning: '',
      };
    }
  );

  // Sort by confidence score descending
  ranked.sort((a, b) => b.confidence - a.confidence);

  // Calculate review requirement based on the top predictions
  const top2Score = ranked[1]?.confidence ?? 0;

  for (let i = 0; i < ranked.length; i++) {
    const item = ranked[i]!;
    const currentScore = item.confidence;
    const siblingScore = i === 0 ? top2Score : 0;

    const reviewNeeded = isReviewRequired(currentScore, siblingScore, item.attributeId);

    item.reasoning = `AI Classification maps to '${item.attributeId}' with ${(currentScore * 100).toFixed(1)}% confidence. Review required: ${reviewNeeded ? 'Yes' : 'No'}.`;
  }

  return ranked.slice(0, 5);
}
