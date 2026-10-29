/**
 * Shadow DOM Utilities
 * Provides functions to recursively query elements through Shadow boundaries.
 */
/**
 * Queries all elements matching a selector, including inside shadow DOMs.
 */
export declare function querySelectorAllDeep(selector: string, root?: Document | ShadowRoot | Element): Element[];
/**
 * Recursively scans for all form input elements across light and shadow DOMs.
 */
export declare function getAllFormElements(root?: Document | ShadowRoot | Element): Element[];
/**
 * Attaches a mutation observer to the document and all shadow roots.
 */
export declare function observeShadowRoots(callback: MutationCallback, options: MutationObserverInit, root?: Document | ShadowRoot | Element): MutationObserver[];
//# sourceMappingURL=shadowdom.d.ts.map