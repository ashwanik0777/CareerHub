/**
 * Dataset Queues
 * Manages the routing of samples into training, hard examples, and review queues.
 */
export interface DatasetSample {
    id: string;
    timestamp: number;
    portal: string;
    metadata: {
        tagName: string;
        inputType: string;
        visibleLabel: string;
        placeholder: string;
        fieldName: string;
        nearbyText: string;
        sectionHeading: string;
        ariaLabel: string;
        xpath: string;
        cssSelector: string;
    };
    aiPrediction: {
        label: string;
        confidence: number;
    };
    userAction: {
        action: 'ACCEPTED' | 'REJECTED' | 'EDITED' | 'SKIPPED';
        correctedLabel?: string;
        correctedValueMasked?: string;
    };
    qualityScore: 'GOLD' | 'SILVER' | 'BRONZE' | 'NOISE';
}
export declare class DatasetQueues {
    static pushToTrainingQueue(sample: DatasetSample): Promise<void>;
    static pushToHardSamples(sample: DatasetSample): Promise<void>;
}
//# sourceMappingURL=datasetQueues.d.ts.map