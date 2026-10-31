// ────────────────────────────────────────────────────────────────────────────
// BenchmarkRunner — Evaluation Harness for the Semantic Engine
// ────────────────────────────────────────────────────────────────────────────
// Runs the engine against the curated test dataset and computes standard
// IR metrics (accuracy, precision, recall, F1).
// ────────────────────────────────────────────────────────────────────────────

import { ExperimentResult } from '@platform/types';
import { SemanticFieldEngine } from '../engine';
import { EngineConfig } from '../interfaces';
import { TestCase, TEST_DATASET } from './test-dataset';
import { accuracy, precision, recall, f1Score } from './metrics';

/**
 * Result of a single test case evaluation.
 */
export interface TestCaseResult {
  testCase: TestCase;
  predictedAttributeId: string;
  confidence: number;
  correct: boolean;
  inferenceTimeMs: number;
}

/**
 * BenchmarkRunner evaluates the Semantic Field Engine against the curated
 * test dataset and produces structured ExperimentResult reports.
 */
export class BenchmarkRunner {
  private readonly engine: SemanticFieldEngine;

  /**
   * Create a new BenchmarkRunner.
   * @param config - Optional engine configuration override
   */
  constructor(config?: Partial<EngineConfig>) {
    this.engine = new SemanticFieldEngine(config);
  }

  /**
   * Run the full benchmark suite.
   * @param dataset - Test cases to evaluate (defaults to the built-in dataset)
   * @returns Structured ExperimentResult with per-field details
   */
  run(dataset: TestCase[] = TEST_DATASET): ExperimentResult {
    const results: TestCaseResult[] = [];
    let truePositives = 0;
    let falsePositives = 0;
    let falseNegatives = 0;
    let totalInferenceTime = 0;

    for (const testCase of dataset) {
      const startTime = performance.now();
      const analysisResult = this.engine.analyze(testCase.descriptor);
      const inferenceTime = performance.now() - startTime;
      totalInferenceTime += inferenceTime;

      const predicted = analysisResult.selectedPrediction;
      const predictedId = predicted?.attributeId ?? '__none__';
      const confidence = predicted?.confidence ?? 0;
      const correct = predictedId === testCase.expectedAttributeId;

      // Micro-averaged single-label classification:
      //   correct prediction            → TP
      //   wrong prediction              → FP (for the predicted class) + FN (for the expected class)
      //   abstained (no prediction)     → FN
      if (correct && predicted) {
        truePositives++;
      } else if (predicted) {
        falsePositives++;
        falseNegatives++;
      } else {
        falseNegatives++;
      }

      results.push({
        testCase,
        predictedAttributeId: predictedId,
        confidence,
        correct,
        inferenceTimeMs: inferenceTime,
      });
    }

    const total = dataset.length;
    const correctCount = results.filter(r => r.correct).length;

    const precisionVal = precision(truePositives, falsePositives);
    const recallVal = recall(truePositives, falseNegatives);
    const f1Val = f1Score(precisionVal, recallVal);

    return {
      name: 'Semantic Field Engine Benchmark',
      strategy: `hybrid (${this.engine.getStrategyNames().join(', ')})`,
      datasetSize: total,
      accuracy: accuracy(correctCount, total),
      precision: precisionVal,
      recall: recallVal,
      f1Score: f1Val,
      avgInferenceTimeMs: total > 0 ? totalInferenceTime / total : 0,
      configuration: {
        strategies: this.engine.getStrategyNames(),
        highConfidenceThreshold: this.engine.getConfig().highConfidenceThreshold,
        mediumConfidenceThreshold: this.engine.getConfig().mediumConfidenceThreshold,
      },
      detailedResults: results.map(r => ({
        fieldId: r.testCase.id,
        expectedAttributeId: r.testCase.expectedAttributeId,
        predictedAttributeId: r.predictedAttributeId,
        confidence: r.confidence,
        correct: r.correct,
        inferenceTimeMs: r.inferenceTimeMs,
      })),
    };
  }

  /**
   * Run benchmarks grouped by platform.
   * @returns Map of platform → ExperimentResult
   */
  runByPlatform(): Map<string, ExperimentResult> {
    const grouped = new Map<string, TestCase[]>();

    for (const tc of TEST_DATASET) {
      const list = grouped.get(tc.platform) || [];
      list.push(tc);
      grouped.set(tc.platform, list);
    }

    const results = new Map<string, ExperimentResult>();
    for (const [platform, cases] of grouped.entries()) {
      const result = this.run(cases);
      result.name = `${platform} Platform Benchmark`;
      results.set(platform, result);
    }

    return results;
  }
}
