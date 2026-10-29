/**
 * Prediction Logger
 * Logs the full DOM context for every prediction to build datasets.
 */
import { DatasetSample } from '../dataset/datasetQueues';
export declare class PredictionLogger {
    static log(metadata: DatasetSample['metadata'], prediction: DatasetSample['aiPrediction'], action: DatasetSample['userAction'], finalValueMasked: string): Promise<void>;
}
//# sourceMappingURL=predictionLogger.d.ts.map