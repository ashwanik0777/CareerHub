export interface DetectedField {
    element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    mappedKey: string;
    confidence: number;
}
export declare const FIELD_KEYWORDS: Record<string, RegExp[]>;
/**
 * Extract the label text for a form element using multiple DOM sources.
 * Exported for reuse by the semantic engine's rule strategy.
 */
export declare function getLabelForElement(element: HTMLElement): string;
export declare function analyzeFormFields(formElement: HTMLFormElement): DetectedField[];
//# sourceMappingURL=heuristics.d.ts.map