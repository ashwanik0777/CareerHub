/**
 * Learning Cache
 * Short-term memory for active form sessions to prevent double-learning on page re-renders.
 */

export class LearningCache {
  private static cache = new Map<string, any>();
  
  static set(sessionId: string, data: any) {
    this.cache.set(sessionId, data);
  }

  static get(sessionId: string): any {
    return this.cache.get(sessionId);
  }

  static has(sessionId: string): boolean {
    return this.cache.has(sessionId);
  }

  static remove(sessionId: string) {
    this.cache.delete(sessionId);
  }

  static clear() {
    this.cache.clear();
  }
}
