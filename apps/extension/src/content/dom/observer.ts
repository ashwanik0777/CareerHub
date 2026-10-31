/**
 * Mutation Observer
 * Watches for lazy-loaded forms and dynamic fields (React/Vue/Angular).
 *
 * The observer is bounded: it disconnects after `maxDurationMs` or
 * `maxScans` rescans, whichever comes first, so a long-lived SPA tab does not
 * pay for a full-DOM rescan on every mutation forever.
 */

import { observeShadowRoots } from './shadowdom';
import { ExtractedField, scanDomForFields } from './scanner';

export interface ObserverOptions {
  /** Debounce window for batching mutations (ms). */
  debounceMs?: number;
  /** Auto-stop after this long (ms). */
  maxDurationMs?: number;
  /** Auto-stop after this many rescans. */
  maxScans?: number;
}

export class DynamicDOMObserver {
  private observers: MutationObserver[] = [];
  private onFieldsDetected: (fields: ExtractedField[]) => void;
  private processedElements = new WeakSet<Element>();
  private debounceTimer: number | null = null;
  private stopTimer: number | null = null;
  private scans = 0;
  private readonly debounceMs: number;
  private readonly maxDurationMs: number;
  private readonly maxScans: number;

  constructor(onFieldsDetected: (fields: ExtractedField[]) => void, options: ObserverOptions = {}) {
    this.onFieldsDetected = onFieldsDetected;
    this.debounceMs = options.debounceMs ?? 800;
    this.maxDurationMs = options.maxDurationMs ?? 60_000;
    this.maxScans = options.maxScans ?? 20;
  }

  public start() {
    this.stop();
    this.scans = 0;
    this.observers = observeShadowRoots(
      (mutations) => {
        for (const mutation of mutations) {
          if (mutation.addedNodes.length > 0) {
            this.debouncedScan();
            return;
          }
        }
      },
      { childList: true, subtree: true }
    );
    this.stopTimer = window.setTimeout(() => this.stop(), this.maxDurationMs);
  }

  public stop() {
    this.observers.forEach((obs) => obs.disconnect());
    this.observers = [];
    if (this.debounceTimer) {
      window.clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    if (this.stopTimer) {
      window.clearTimeout(this.stopTimer);
      this.stopTimer = null;
    }
  }

  public get isActive(): boolean {
    return this.observers.length > 0;
  }

  private debouncedScan() {
    if (this.debounceTimer) {
      window.clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = window.setTimeout(() => {
      this.debounceTimer = null;
      if (!this.isActive) return;

      this.scans++;
      const allFields = scanDomForFields(document, { lite: true });
      const newFields = allFields.filter((f) => !this.processedElements.has(f.element));

      if (newFields.length > 0) {
        newFields.forEach((f) => this.processedElements.add(f.element));
        this.onFieldsDetected(newFields);
      }

      if (this.scans >= this.maxScans) this.stop();
    }, this.debounceMs);
  }

  public markProcessed(elements: Element[]) {
    elements.forEach((el) => this.processedElements.add(el));
  }
}
