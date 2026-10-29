/**
 * Latency Tracker
 * Ensures predictions remain <300ms and autofill <100ms.
 */
export declare class LatencyTracker {
    private static timers;
    static start(id: string): void;
    static end(id: string, tag: string): void;
}
//# sourceMappingURL=latencyTracker.d.ts.map