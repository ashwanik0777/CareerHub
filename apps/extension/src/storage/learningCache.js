/**
 * Learning Cache
 * Short-term memory for active form sessions to prevent double-learning on page re-renders.
 */
export class LearningCache {
    static cache = new Map();
    static set(sessionId, data) {
        this.cache.set(sessionId, data);
    }
    static get(sessionId) {
        return this.cache.get(sessionId);
    }
    static has(sessionId) {
        return this.cache.has(sessionId);
    }
    static remove(sessionId) {
        this.cache.delete(sessionId);
    }
    static clear() {
        this.cache.clear();
    }
}
//# sourceMappingURL=learningCache.js.map