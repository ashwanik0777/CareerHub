import { createHash } from 'crypto';
import { CACHE_TTL_MS, CACHE_MAX_ENTRIES } from '../config';
import { PredictResult } from '../types';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * In-memory cache with TTL expiration, in-flight promise deduplication and an
 * LRU size bound: a hit re-inserts the key so the least recently *used* entry
 * is evicted first, not merely the oldest insertion.
 */
export class PredictionCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private inFlight = new Map<string, Promise<T>>();
  private hits = 0;
  private misses = 0;

  private hashKey(text: string): string {
    return createHash('sha256').update(text).digest('hex');
  }

  /**
   * Retrieves a cached result or returns null if expired/not found.
   */
  get(text: string): T | null {
    const key = this.hashKey(text);
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    // LRU touch: Map preserves insertion order, so re-inserting moves the
    // entry to the back and the front is always the least recently used.
    this.cache.delete(key);
    this.cache.set(key, entry);
    this.hits++;
    return entry.value;
  }

  /**
   * Stores a result in the cache with the configured TTL.
   * Evicts the least recently used entry if size exceeds cache capacity.
   */
  set(text: string, value: T): void {
    const key = this.hashKey(text);

    this.cache.delete(key);
    if (this.cache.size >= CACHE_MAX_ENTRIES) {
      // Evict least recently used entry (the first key in the map iterator)
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
  }

  /**
   * Deduplicates concurrent in-flight requests. If a request for the same
   * input text is already running, returns the existing promise.
   * The optional onHit transform lets callers annotate cache-served values.
   */
  async getOrExecute(text: string, computeFn: () => Promise<T>, onHit?: (value: T) => T): Promise<T> {
    const cached = this.get(text);
    if (cached !== null) {
      return onHit ? onHit(cached) : cached;
    }

    const key = this.hashKey(text);
    let promise = this.inFlight.get(key);

    if (!promise) {
      promise = computeFn()
        .then((result) => {
          this.set(text, result);
          this.inFlight.delete(key);
          return result;
        })
        .catch((error) => {
          this.inFlight.delete(key);
          throw error;
        });

      this.inFlight.set(key, promise);
    }

    return promise;
  }

  /**
   * Cache effectiveness statistics for the metrics endpoint.
   */
  getStats(): { hits: number; misses: number; hitRate: number; size: number } {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? parseFloat((this.hits / total).toFixed(4)) : 0,
      size: this.cache.size,
    };
  }

  clear(): void {
    this.cache.clear();
    this.inFlight.clear();
  }
}
export const predictionCache = new PredictionCache<PredictResult>();
