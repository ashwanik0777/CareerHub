/**
 * Accuracy Tracker & Portal Analytics
 * Analyzes the ratio of Gold/Silver samples to Bronze/Noise samples to calculate accuracy.
 */
import { DatasetSample } from '../dataset/datasetQueues';
export declare class AccuracyTracker {
    private static KEY;
    static recordSample(sample: DatasetSample): Promise<void>;
    static getStats(): Promise<{
        total: number;
        correct: number;
        portals: Record<string, {
            total: number;
            correct: number;
        }>;
    }>;
}
//# sourceMappingURL=accuracyTracker.d.ts.map