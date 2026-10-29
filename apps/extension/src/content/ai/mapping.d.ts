/**
 * AI Prediction to Profile Mapper
 * Resolves a predicted ontology attribute ID (from /api/ai/predict) to the
 * matching value in the /api/profile response shape.
 */
export interface FieldHints {
    visibleLabel?: string;
    placeholder?: string;
    fieldName?: string;
    ariaLabel?: string;
}
export declare function mapPredictionToValue(predictedClass: string, profileData: any, resumeData?: any, hints?: FieldHints): string | null;
//# sourceMappingURL=mapping.d.ts.map