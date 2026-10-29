/**
 * Prediction History Storage
 * Tracks local histories of what was predicted vs. accepted.
 */
export interface PredictionRecord {
    id: string;
    url: string;
    timestamp: number;
    fieldId: string;
    predictedLabel: string;
    confidence: number;
    finalValue: string;
    action: 'ACCEPTED' | 'REJECTED' | 'EDITED' | 'SKIPPED';
}
export declare class PredictionHistory {
    private static KEY;
    static getHistory(): Promise<PredictionRecord[]>;
    static addRecord(record: PredictionRecord): Promise<void>;
    static clear(): Promise<void>;
}
//# sourceMappingURL=predictionHistory.d.ts.map