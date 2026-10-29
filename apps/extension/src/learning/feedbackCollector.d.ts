/**
 * Feedback Collector
 * Observes fields after autofill to detect if the user corrects the value.
 */
import { DatasetSample } from '../dataset/datasetQueues';
export declare class FeedbackCollector {
    private static observedFields;
    static observe(element: HTMLElement, metadata: DatasetSample['metadata'], prediction: DatasetSample['aiPrediction'], injectedValue: string): void;
}
//# sourceMappingURL=feedbackCollector.d.ts.map