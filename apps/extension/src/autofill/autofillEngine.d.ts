/**
 * Autofill Engine
 * Robust value injector that handles React, Angular, Vue, and Shadow DOM boundaries.
 */
export declare class AutofillEngine {
    static triggerEvents(element: HTMLElement): void;
    /**
     * Smart select option matching — tries multiple strategies to find the best match.
     */
    static findBestSelectOption(select: HTMLSelectElement, value: string): string;
    static injectValue(element: HTMLElement, value: string): boolean;
}
//# sourceMappingURL=autofillEngine.d.ts.map