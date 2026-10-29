/**
 * User Feedback Engine
 * Detects user corrections on autofilled fields and sends them to the backend.
 */
export declare class FeedbackEngine {
    static recordPositive(predictedClass: string, value: string): void;
    static recordNegative(predictedClass: string, value: string): void;
    static attachListeners(element: HTMLElement, originalPredictedClass: string): void;
}
//# sourceMappingURL=feedback.d.ts.map