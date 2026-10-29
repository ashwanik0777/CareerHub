export interface FieldDescriptor {
    /** HTML element tag name */
    tagName: string;
    /** Input type attribute */
    inputType: string;
    /** Extracted label text */
    label: string;
    /** Placeholder attribute */
    placeholder: string;
    /** HTML name attribute */
    name: string;
    /** HTML id attribute */
    id: string;
    /** aria-label value */
    ariaLabel: string;
    /** title attribute value */
    title: string;
    /** Text from nearby headings, legends, section titles */
    nearbyText: string;
    /** Parent section or fieldset context */
    parentSection: string;
    /** Simplified DOM path */
    domPath: string;
    /** Form-level context */
    formContext: string;
    /** Whether field is required */
    isRequired: boolean;
    /** Validation pattern if present */
    validationPattern: string;
    /** Reference to the actual DOM element */
    element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
}
/**
 * Analyze all form fields on the page and produce rich FieldDescriptors.
 * Unlike the legacy heuristics which only scan the first matching form,
 * this analyzer scans ALL forms and also finds formless inputs.
 */
export declare function analyzePageFields(): FieldDescriptor[];
/**
 * Create a MutationObserver that watches for dynamically added form fields.
 * Calls the callback with newly detected FieldDescriptors when new inputs appear.
 */
export declare function observeDynamicFields(callback: (newFields: FieldDescriptor[]) => void): MutationObserver;
//# sourceMappingURL=semantic-analyzer.d.ts.map