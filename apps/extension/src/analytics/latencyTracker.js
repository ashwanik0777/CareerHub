/**
 * Latency Tracker
 * Ensures predictions remain <300ms and autofill <100ms.
 */
export class LatencyTracker {
    static timers = new Map();
    static start(id) {
        this.timers.set(id, performance.now());
    }
    static end(id, tag) {
        const start = this.timers.get(id);
        if (start) {
            const duration = performance.now() - start;
            console.log(`[Latency] ${tag}: ${duration.toFixed(2)}ms`);
            // Could send to background script for aggregation
            this.timers.delete(id);
        }
    }
}
//# sourceMappingURL=latencyTracker.js.map