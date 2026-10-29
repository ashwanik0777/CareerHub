/**
 * DOM Scanner
 * Analyzes the DOM to extract comprehensive metadata for AI inference.
 */
export interface ExtractedField {
    element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    metadata: {
        visibleLabel: string;
        placeholder: string;
        fieldName: string;
        nearbyText: string;
        sectionHeading: string;
        ariaLabel: string;
        fieldType: string;
        xpath: string;
        cssSelector: string;
    };
}
/**
 * Main scanner function: collects all form fields and their metadata.
 */
export declare function scanDomForFields(root?: Document | ShadowRoot | Element): ExtractedField[];
//# sourceMappingURL=scanner.d.ts.map