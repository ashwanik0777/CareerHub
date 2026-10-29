/**
 * Confidence Manager
 * Evaluates AI confidence and determines the required user interaction model.
 */
export declare enum InteractionMode {
    AUTO_FILL = "AUTO_FILL",// >= 98%
    APPROVAL = "APPROVAL",// 92% - 97.9%
    MANUAL = "MANUAL"
}
export declare class ConfidenceManager {
    static evaluate(confidence: number): InteractionMode;
}
//# sourceMappingURL=confidenceManager.d.ts.map