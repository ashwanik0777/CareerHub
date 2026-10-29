import { predictField, predictFieldBatch, formatPredictionResponse, sanitizeText } from '@platform/ai-model';
import { SemanticFieldEngine } from '@platform/semantic-engine';
import { FieldPrediction, ConfidenceLevel, MappingSource } from '@platform/types';
import { AiFieldDescriptor } from '@platform/validation';

/**
 * Coordination and orchestration service for field predictions.
 * Integrates local MiniLM classifier model predictions and falls back dynamically to the
 * heuristic/semantic SemanticFieldEngine on low confidence predictions or model exceptions.
 */
export class FieldPredictionService {
  private semanticEngine: SemanticFieldEngine;

  constructor() {
    this.semanticEngine = new SemanticFieldEngine();
  }

  /**
   * Adapts the 9-field input schema to the 11-field descriptor expected by the semantic fallback engine.
   * All values are sanitized here so neither the fallback engine's reasoning strings nor
   * any downstream consumer can echo raw HTML/script content from the page.
   */
  private adaptDescriptor(field: AiFieldDescriptor) {
    return {
      label: sanitizeText(field.visibleLabel),
      placeholder: sanitizeText(field.placeholder),
      name: sanitizeText(field.fieldName),
      id: '',
      ariaLabel: sanitizeText(field.ariaLabel),
      title: '',
      nearbyText: sanitizeText(field.nearbyText),
      parentSection: sanitizeText(field.sectionHeading),
      formContext: sanitizeText(`${field.pageTitle || ''} (${field.portalDomain || ''})`.trim()),
      inputType: sanitizeText(field.fieldType) || 'text',
      isRequired: false,
    };
  }

  /**
   * Predicts a canonical attribute mapping for a form field.
   * If the local MiniLM classifier model fails or returns a low-confidence mapping,
   * falls back gracefully to the synchronous rule/keyword/TF-IDF SemanticFieldEngine.
   */
  async predictField(field: AiFieldDescriptor): Promise<FieldPrediction> {
    try {
      // 1. Invoke MiniLM classifier inference
      const result = await predictField(field);
      
      if (result.predictions && result.predictions.length > 0) {
        const topPrediction = result.predictions[0]!;
        
        // Return model prediction if confidence level is HIGH or MEDIUM
        if (topPrediction.confidenceLevel !== ConfidenceLevel.LOW) {
          return formatPredictionResponse(result.predictions);
        }
      }
    } catch (error) {
      console.warn('[FieldPredictionService] MiniLM predict failed; falling back to Semantic Engine:', error);
    }

    // 2. Heuristic fallback engine execution
    const descriptor = this.adaptDescriptor(field);
    const analysis = this.semanticEngine.analyze(descriptor);
    
    if (analysis.selectedPrediction) {
      return analysis.selectedPrediction;
    }

    return {
      attributeId: '',
      confidence: 0.0,
      confidenceLevel: ConfidenceLevel.LOW,
      source: MappingSource.AI_REASONING,
      reasoning: 'Model execution and semantic fallback both failed to identify a mapping.',
      alternativeMappings: [],
    };
  }

  /**
   * Predicts attribute mappings for a batch of fields.
   * Runs batched MiniLM classifier inference, falling back individually per-field
   * to the SemanticFieldEngine on low confidence.
   */
  async predictFieldBatch(fields: AiFieldDescriptor[]): Promise<FieldPrediction[]> {
    if (fields.length === 0) {
      return [];
    }

    try {
      const batchResults = await predictFieldBatch(fields);
      const predictions: FieldPrediction[] = [];

      for (let i = 0; i < fields.length; i++) {
        const field = fields[i]!;
        const result = batchResults[i];

        if (result && result.predictions && result.predictions.length > 0) {
          const topPrediction = result.predictions[0]!;
          if (topPrediction.confidenceLevel !== ConfidenceLevel.LOW) {
            predictions.push(formatPredictionResponse(result.predictions));
            continue;
          }
        }

        // Low confidence fallback for this specific field
        const descriptor = this.adaptDescriptor(field);
        const analysis = this.semanticEngine.analyze(descriptor);
        predictions.push(
          analysis.selectedPrediction || {
            attributeId: '',
            confidence: 0.0,
            confidenceLevel: ConfidenceLevel.LOW,
            source: MappingSource.AI_REASONING,
            reasoning: 'Low confidence in model; semantic fallback yielded no mapping.',
            alternativeMappings: [],
          }
        );
      }

      return predictions;
    } catch (error) {
      console.warn('[FieldPredictionService] Batch MiniLM predict failed; falling back to Semantic Engine for all fields:', error);
      
      return fields.map((field) => {
        const descriptor = this.adaptDescriptor(field);
        const analysis = this.semanticEngine.analyze(descriptor);
        return (
          analysis.selectedPrediction || {
            attributeId: '',
            confidence: 0.0,
            confidenceLevel: ConfidenceLevel.LOW,
            source: MappingSource.AI_REASONING,
            reasoning: 'MiniLM batch prediction failed; semantic fallback yielded no mapping.',
            alternativeMappings: [],
          }
        );
      });
    }
  }
}

export const fieldPredictionService = new FieldPredictionService();
export default fieldPredictionService;
