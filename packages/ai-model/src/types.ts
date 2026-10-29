import { ConfidenceLevel, MappingSource } from '@platform/types';

/** Raw prediction output from the model's logits. */
export interface ModelPrediction {
  classLabel: string;
  probability: number;
}

/** Prediction output collapsed into the Professional Profile Ontology. */
export interface RankedPrediction {
  attributeId: string;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  source: MappingSource;
  reasoning: string;
}

/** Result of predicting a single field. */
export interface PredictResult {
  predictions: RankedPrediction[];
  executionTimeMs: number;
  /** True when served from the prediction cache instead of a fresh forward pass. */
  cached?: boolean;
}

/** Health check schema for the model inference service. */
export interface ModelHealth {
  status: 'healthy' | 'unhealthy' | 'uninitialized' | 'error';
  modelPath: string;
  warmedUp: boolean;
  memoryUsageRssMb: number;
  avgLatencyMs: number;
  error?: string;
  activeVersion?: string;
}
