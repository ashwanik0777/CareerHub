/**
 * Mutation Observer
 * Watches for lazy-loaded forms and dynamic fields (React/Vue/Angular).
 */

import { observeShadowRoots } from './shadowdom';
import { ExtractedField, scanDomForFields } from './scanner';

export class DynamicDOMObserver {
  private observers: MutationObserver[] = [];
  private onFieldsDetected: (fields: ExtractedField[]) => void;
  private processedElements = new WeakSet<Element>();
  private debounceTimer: number | null = null;

  constructor(onFieldsDetected: (fields: ExtractedField[]) => void) {
    this.onFieldsDetected = onFieldsDetected;
  }

  public start() {
    this.observers = observeShadowRoots((mutations) => {
      let hasAddedNodes = false;
      
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          hasAddedNodes = true;
          break;
        }
      }

      if (hasAddedNodes) {
        this.debouncedScan();
      }
    }, {
      childList: true,
      subtree: true,
    });
  }

  public stop() {
    this.observers.forEach(obs => obs.disconnect());
    this.observers = [];
    if (this.debounceTimer) {
      window.clearTimeout(this.debounceTimer);
    }
  }

  private debouncedScan() {
    if (this.debounceTimer) {
      window.clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = window.setTimeout(() => {
      const allFields = scanDomForFields();
      const newFields = allFields.filter(f => !this.processedElements.has(f.element));
      
      if (newFields.length > 0) {
        newFields.forEach(f => this.processedElements.add(f.element));
        this.onFieldsDetected(newFields);
      }
    }, 800); // 800ms debounce to batch heavy React updates
  }

  public markProcessed(elements: Element[]) {
    elements.forEach(el => this.processedElements.add(el));
  }
}
