/**
 * Prediction Logger
 * Logs the full DOM context for every prediction to build datasets.
 */
import { DatasetQueues } from '../dataset/datasetQueues';
import { QualityScorer } from './qualityScorer';
import { PredictionHistory } from '../storage/predictionHistory';
export class PredictionLogger {
    static async log(metadata, prediction, action, finalValueMasked) {
        const isEdited = action.action === 'EDITED' || action.correctedValueMasked !== undefined;
        const score = QualityScorer.score(action.action, prediction.confidence, isEdited);
        const sample = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            portal: window.location.hostname,
            metadata,
            aiPrediction: prediction,
            userAction: action,
            qualityScore: score
        };
        // Store in history
        await PredictionHistory.addRecord({
            id: sample.id,
            url: window.location.href,
            timestamp: sample.timestamp,
            fieldId: metadata.cssSelector || metadata.xpath,
            predictedLabel: prediction.label,
            confidence: prediction.confidence,
            finalValue: finalValueMasked,
            action: action.action
        });
        // Route to dataset queues
        if (score === 'GOLD' || score === 'SILVER') {
            await DatasetQueues.pushToTrainingQueue(sample);
        }
        else if (score === 'BRONZE') {
            await DatasetQueues.pushToHardSamples(sample);
        }
    }
}
//# sourceMappingURL=predictionLogger.js.map