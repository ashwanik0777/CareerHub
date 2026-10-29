/**
 * Analytics Service
 * Tracks usage metrics in local storage.
 */
export interface AnalyticsData {
    formsFilled: number;
    fieldsFilled: number;
    totalLatencyMs: number;
    totalConfidence: number;
    acceptedFields: number;
    correctedFields: number;
}
export declare class AnalyticsService {
    private static readonly KEY;
    private static getDefaultData;
    static getAnalytics(): Promise<AnalyticsData>;
    static recordFormFill(fieldsFilledCount: number, averageConfidence: number, latencyMs: number): Promise<void>;
    static recordCorrection(): Promise<void>;
}
//# sourceMappingURL=analytics.d.ts.map