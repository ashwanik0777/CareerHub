/**
 * Mutation Observer
 * Watches for lazy-loaded forms and dynamic fields (React/Vue/Angular).
 */
import { ExtractedField } from './scanner';
export declare class DynamicDOMObserver {
    private observers;
    private onFieldsDetected;
    private processedElements;
    private debounceTimer;
    constructor(onFieldsDetected: (fields: ExtractedField[]) => void);
    start(): void;
    stop(): void;
    private debouncedScan;
    markProcessed(elements: Element[]): void;
}
//# sourceMappingURL=observer.d.ts.map