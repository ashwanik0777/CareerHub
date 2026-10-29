/**
 * Mutation Observer
 * Watches for lazy-loaded forms and dynamic fields (React/Vue/Angular).
 */
import { observeShadowRoots } from './shadowdom';
import { scanDomForFields } from './scanner';
export class DynamicDOMObserver {
    observers = [];
    onFieldsDetected;
    processedElements = new WeakSet();
    debounceTimer = null;
    constructor(onFieldsDetected) {
        this.onFieldsDetected = onFieldsDetected;
    }
    start() {
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
    stop() {
        this.observers.forEach(obs => obs.disconnect());
        this.observers = [];
        if (this.debounceTimer) {
            window.clearTimeout(this.debounceTimer);
        }
    }
    debouncedScan() {
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
    markProcessed(elements) {
        elements.forEach(el => this.processedElements.add(el));
    }
}
//# sourceMappingURL=observer.js.map