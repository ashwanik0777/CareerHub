// ────────────────────────────────────────────────────────────────────────────
// Semantic Engine Core Interfaces
// ────────────────────────────────────────────────────────────────────────────

import { ConfidenceLevel, MappingSource } from '@platform/types';
import type { FieldPrediction } from '@platform/types';

// Re-export for convenience within the engine
export { ConfidenceLevel, MappingSource };
export type { FieldPrediction };

/**
 * Simplified engine-internal field descriptor.
 * A lightweight projection of DetectedFieldDescriptor tailored for
 * the semantic analysis pipeline.
 */
export interface FieldDescriptor {
  /** Extracted label text from associated <label>, aria, or nearby elements */
  label: string;
  /** Placeholder attribute value */
  placeholder: string;
  /** HTML name attribute */
  name: string;
  /** HTML id attribute */
  id: string;
  /** aria-label attribute value */
  ariaLabel: string;
  /** title attribute value */
  title: string;
  /** Text from nearby headings, legends, or section titles */
  nearbyText: string;
  /** Parent section or fieldset context */
  parentSection: string;
  /** Form-level context (form id, action, heading) */
  formContext: string;
  /** Input type attribute (text, email, tel, file, etc.) */
  inputType: string;
  /** Whether the field is required */
  isRequired: boolean;
}

/**
 * Plugin interface for mapping strategies.
 * Each strategy independently analyzes a field descriptor and returns
 * a ranked list of ontology attribute predictions.
 */
export interface MappingStrategy {
  /** Unique strategy identifier */
  name: string;
  /** Weight in the hybrid fusion ensemble (0–1) */
  weight: number;
  /** Analyze a field descriptor and produce ranked predictions */
  analyze(descriptor: FieldDescriptor): FieldPrediction[];
}

/**
 * Complete analysis result for a single form field.
 * Aggregates predictions from all strategies after hybrid fusion.
 */
export interface FieldAnalysisResult {
  /** The original field descriptor that was analyzed */
  descriptor: FieldDescriptor;
  /** All candidate predictions (sorted by confidence descending) */
  predictions: FieldPrediction[];
  /** The top-ranked prediction, or null if none exceeded threshold */
  selectedPrediction: FieldPrediction | null;
  /** Total analysis time in milliseconds */
  analysisTimeMs: number;
  /** Names of strategies that contributed predictions */
  strategiesUsed: string[];
}

/**
 * Configuration for the SemanticFieldEngine.
 */
export interface EngineConfig {
  /** Ordered list of mapping strategies to execute */
  strategies: MappingStrategy[];
  /** Confidence threshold for HIGH classification (>= this value) */
  highConfidenceThreshold: number;
  /** Confidence threshold for MEDIUM classification (>= this value) */
  mediumConfidenceThreshold: number;
  /** Whether to emit telemetry events during analysis */
  enableTelemetry: boolean;
}
