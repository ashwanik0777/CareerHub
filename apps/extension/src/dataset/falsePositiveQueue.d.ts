/**
 * False Positive Queue
 * Detects fields that should NEVER be learned from (security tokens, passwords, analytics, etc.)
 */
export declare class FalsePositiveDetector {
    private static FORBIDDEN_TYPES;
    private static FORBIDDEN_NAMES;
    static isFalsePositive(element: HTMLElement, metadata: any): boolean;
}
//# sourceMappingURL=falsePositiveQueue.d.ts.map