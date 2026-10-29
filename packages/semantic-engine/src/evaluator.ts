export interface EvaluationSample {
  groundTruth: string;
  predictions: Array<{ label: string; confidence: number }>;
  latencyMs: number;
  portal?: string;
}

export interface ClassMetrics {
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
  precision: number;
  recall: number;
  f1Score: number;
}

export interface EvaluationReport {
  totalSamples: number;
  overallAccuracy: number;
  top3Accuracy: number;
  top5Accuracy: number;
  macroF1: number;
  weightedF1: number;
  avgLatencyMs: number;
  avgConfidence: number;
  perClassMetrics: Record<string, ClassMetrics>;
  confusionMatrix: Record<string, Record<string, number>>;
  portalAccuracy: Record<string, number>;
  confidenceHistogram: Record<string, number>; // e.g. "0.9-1.0": 50
}

export class Evaluator {
  static evaluate(samples: EvaluationSample[]): EvaluationReport {
    const report: EvaluationReport = {
      totalSamples: samples.length,
      overallAccuracy: 0,
      top3Accuracy: 0,
      top5Accuracy: 0,
      macroF1: 0,
      weightedF1: 0,
      avgLatencyMs: 0,
      avgConfidence: 0,
      perClassMetrics: {},
      confusionMatrix: {},
      portalAccuracy: {},
      confidenceHistogram: {
        '0.0-0.5': 0, '0.5-0.7': 0, '0.7-0.9': 0, '0.9-0.95': 0, '0.95-1.0': 0
      }
    };

    if (samples.length === 0) return report;

    let correctTop1 = 0;
    let correctTop3 = 0;
    let correctTop5 = 0;
    let totalLatency = 0;
    let totalConfidence = 0;
    
    const portalCounts: Record<string, { total: number; correct: number }> = {};
    const classCounts: Record<string, number> = {};

    samples.forEach(sample => {
      const truth = sample.groundTruth;
      classCounts[truth] = (classCounts[truth] || 0) + 1;
      totalLatency += sample.latencyMs;

      // Initialize class metrics if not present
      if (!report.perClassMetrics[truth]) {
        report.perClassMetrics[truth] = { truePositives: 0, falsePositives: 0, falseNegatives: 0, precision: 0, recall: 0, f1Score: 0 };
      }
      if (!report.confusionMatrix[truth]) {
        report.confusionMatrix[truth] = {};
      }

      if (sample.predictions.length > 0) {
        const topPred = sample.predictions[0];
        totalConfidence += topPred.confidence;
        
        // Confidence Histogram
        if (topPred.confidence < 0.5) report.confidenceHistogram['0.0-0.5']++;
        else if (topPred.confidence < 0.7) report.confidenceHistogram['0.5-0.7']++;
        else if (topPred.confidence < 0.9) report.confidenceHistogram['0.7-0.9']++;
        else if (topPred.confidence < 0.95) report.confidenceHistogram['0.9-0.95']++;
        else report.confidenceHistogram['0.95-1.0']++;

        const predictedLabel = topPred.label;
        report.confusionMatrix[truth][predictedLabel] = (report.confusionMatrix[truth][predictedLabel] || 0) + 1;

        if (!report.perClassMetrics[predictedLabel]) {
          report.perClassMetrics[predictedLabel] = { truePositives: 0, falsePositives: 0, falseNegatives: 0, precision: 0, recall: 0, f1Score: 0 };
        }

        if (predictedLabel === truth) {
          correctTop1++;
          report.perClassMetrics[truth].truePositives++;
        } else {
          report.perClassMetrics[predictedLabel].falsePositives++;
          report.perClassMetrics[truth].falseNegatives++;
        }
      }

      // Top-K Logic
      const labelsTop3 = sample.predictions.slice(0, 3).map(p => p.label);
      const labelsTop5 = sample.predictions.slice(0, 5).map(p => p.label);
      if (labelsTop3.includes(truth)) correctTop3++;
      if (labelsTop5.includes(truth)) correctTop5++;

      // Portal Accuracy
      if (sample.portal) {
        if (!portalCounts[sample.portal]) portalCounts[sample.portal] = { total: 0, correct: 0 };
        portalCounts[sample.portal].total++;
        if (sample.predictions[0]?.label === truth) portalCounts[sample.portal].correct++;
      }
    });

    // Calculate Precision, Recall, F1
    let macroF1Sum = 0;
    let weightedF1Sum = 0;
    let validClasses = 0;

    for (const [cls, metrics] of Object.entries(report.perClassMetrics)) {
      const tp = metrics.truePositives;
      const fp = metrics.falsePositives;
      const fn = metrics.falseNegatives;

      metrics.precision = (tp + fp) > 0 ? tp / (tp + fp) : 0;
      metrics.recall = (tp + fn) > 0 ? tp / (tp + fn) : 0;
      metrics.f1Score = (metrics.precision + metrics.recall) > 0 
        ? 2 * ((metrics.precision * metrics.recall) / (metrics.precision + metrics.recall)) 
        : 0;

      if ((tp + fp + fn) > 0) {
        macroF1Sum += metrics.f1Score;
        weightedF1Sum += metrics.f1Score * (classCounts[cls] || 0);
        validClasses++;
      }
    }

    report.overallAccuracy = correctTop1 / report.totalSamples;
    report.top3Accuracy = correctTop3 / report.totalSamples;
    report.top5Accuracy = correctTop5 / report.totalSamples;
    report.avgLatencyMs = totalLatency / report.totalSamples;
    report.avgConfidence = totalConfidence / report.totalSamples;
    report.macroF1 = validClasses > 0 ? macroF1Sum / validClasses : 0;
    report.weightedF1 = weightedF1Sum / report.totalSamples;

    for (const [portal, counts] of Object.entries(portalCounts)) {
      report.portalAccuracy[portal] = counts.correct / counts.total;
    }

    return report;
  }
}
