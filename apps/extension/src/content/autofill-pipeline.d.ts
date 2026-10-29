export interface AutofillReport {
    success: boolean;
    totalFields: number;
    filledFieldsCount: number;
    filledKeys: string[];
    unmappedElementsCount: number;
    /** Enhanced confidence breakdown */
    confidenceBreakdown?: {
        high: number;
        medium: number;
        low: number;
        avgConfidence: number;
    };
    /** Per-field details for telemetry */
    fieldDetails?: Array<{
        mappedKey: string;
        confidence: number;
        confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
        source: string;
        wasFilled: boolean;
    }>;
    /** Execution time in ms */
    executionTimeMs?: number;
}
/**
 * Execute the enhanced autofill pipeline with confidence scoring.
 *
 * Pipeline Flow:
 * 1. Detect website and get site-specific rules
 * 2. Run enhanced semantic analysis on all page fields
 * 3. Fall back to legacy heuristics if semantic analyzer finds nothing
 * 4. Classify each field prediction by confidence level
 * 5. Fill HIGH confidence fields automatically
 * 6. Highlight MEDIUM confidence fields (amber) — filled but flagged
 * 7. Skip LOW confidence fields — highlighted red for manual entry
 * 8. Generate structured telemetry report
 */
export declare function executeAutofillPipeline(profileData: any, resumeData?: any): Promise<AutofillReport>;
//# sourceMappingURL=autofill-pipeline.d.ts.map