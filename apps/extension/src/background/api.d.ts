export interface PredictRequestField {
    visibleLabel: string;
    placeholder: string;
    fieldName: string;
    nearbyText: string;
    sectionHeading: string;
    ariaLabel: string;
    fieldType: string;
}
export interface PredictResponse {
    fields: Array<{
        predictedClass: string;
        confidence: number;
        confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
        topK: Array<{
            class: string;
            probability: number;
        }>;
    }>;
    batchLatencyMs: number;
}
export declare class ApiService {
    /**
     * Calls the AI backend to predict field types in batch.
     * Sends the session token as a Bearer header, chunks requests to the API's
     * batch limit, and adapts the server's FieldPrediction shape to the
     * extension's internal PredictResponse.
     */
    static predictBatch(fields: PredictRequestField[]): Promise<PredictResponse>;
    /**
     * Submit feedback for an autofilled field.
     */
    static submitFeedback(feedbackData: any): Promise<void>;
}
//# sourceMappingURL=api.d.ts.map