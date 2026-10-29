/**
 * Learning Cache
 * Short-term memory for active form sessions to prevent double-learning on page re-renders.
 */
export declare class LearningCache {
    private static cache;
    static set(sessionId: string, data: any): void;
    static get(sessionId: string): any;
    static has(sessionId: string): boolean;
    static remove(sessionId: string): void;
    static clear(): void;
}
//# sourceMappingURL=learningCache.d.ts.map