// ────────────────────────────────────────────────────────────────────────────
// SemanticFieldEngine — Main Analysis Engine
// ────────────────────────────────────────────────────────────────────────────
// Orchestrates the mapping strategy pipeline. Accepts a FieldDescriptor
// and returns a FieldAnalysisResult with ranked predictions.
// ────────────────────────────────────────────────────────────────────────────

import { FieldDescriptor, FieldAnalysisResult, EngineConfig } from './interfaces';
import { RuleEngineStrategy } from './strategies/rule-engine';
import { KeywordMatcherStrategy } from './strategies/keyword-matcher';
import { SemanticMatcherStrategy } from './strategies/semantic-matcher';
import { fuseStrategies } from './hybrid-mapper';

/**
 * Default engine configuration.
 */
function createDefaultConfig(): EngineConfig {
  return {
    strategies: [
      new RuleEngineStrategy(),
      new KeywordMatcherStrategy(),
      new SemanticMatcherStrategy(),
    ],
    highConfidenceThreshold: 0.85,
    mediumConfidenceThreshold: 0.60,
    enableTelemetry: false,
  };
}

/**
 * Semantic Field Understanding Engine.
 *
 * The core research contribution of the platform. Analyzes form field
 * descriptors and maps them to the Professional Profile Ontology using
 * a hybrid ensemble of:
 *   1. Rule Engine (regex patterns, weight 0.35)
 *   2. Keyword Matcher (Jaccard over ontology aliases, weight 0.20)
 *   3. Semantic Matcher (TF-IDF + cosine similarity, weight 0.15)
 *
 * Results are fused using weighted voting and classified into confidence
 * levels for downstream autofill decisions.
 *
 * @example
 * ```typescript
 * const engine = new SemanticFieldEngine();
 * const result = engine.analyze({
 *   label: 'First Name',
 *   placeholder: 'Enter your first name',
 *   name: 'first_name',
 *   id: 'applicant-first-name',
 *   ariaLabel: '',
 *   title: '',
 *   nearbyText: '',
 *   parentSection: 'Personal Information',
 *   formContext: 'Job Application',
 *   inputType: 'text',
 *   isRequired: true,
 * });
 * console.log(result.selectedPrediction?.attributeId);
 * // → 'personalInfo.firstName'
 * ```
 */
export class SemanticFieldEngine {
  private readonly config: EngineConfig;

  /**
   * Create a new SemanticFieldEngine.
   * @param config - Optional engine configuration. Uses default strategies if omitted.
   */
  constructor(config?: Partial<EngineConfig>) {
    const defaults = createDefaultConfig();
    this.config = {
      strategies: config?.strategies ?? defaults.strategies,
      highConfidenceThreshold: config?.highConfidenceThreshold ?? defaults.highConfidenceThreshold,
      mediumConfidenceThreshold: config?.mediumConfidenceThreshold ?? defaults.mediumConfidenceThreshold,
      enableTelemetry: config?.enableTelemetry ?? defaults.enableTelemetry,
    };
  }

  /**
   * Analyze a single field descriptor and return ranked predictions.
   *
   * @param descriptor - The field to analyze
   * @returns Complete analysis result with predictions, timing, and metadata
   */
  analyze(descriptor: FieldDescriptor): FieldAnalysisResult {
    const startTime = performance.now();

    // Run hybrid fusion across all strategies
    const { predictions, strategiesUsed } = fuseStrategies(
      descriptor,
      this.config.strategies,
      this.config,
    );

    // Select the top prediction if it exceeds the medium threshold
    const top = predictions[0];
    const selectedPrediction =
      top && top.confidence >= this.config.mediumConfidenceThreshold ? top : null;

    const analysisTimeMs = performance.now() - startTime;

    return {
      descriptor,
      predictions,
      selectedPrediction,
      analysisTimeMs,
      strategiesUsed,
    };
  }

  /**
   * Analyze multiple fields in batch.
   *
   * @param descriptors - Array of field descriptors
   * @returns Array of analysis results (same order as input)
   */
  analyzeBatch(descriptors: FieldDescriptor[]): FieldAnalysisResult[] {
    return descriptors.map(d => this.analyze(d));
  }

  /**
   * Get the current engine configuration (read-only).
   */
  getConfig(): Readonly<EngineConfig> {
    return this.config;
  }

  /**
   * Get the names of all active strategies.
   */
  getStrategyNames(): string[] {
    return this.config.strategies.map(s => s.name);
  }
}
