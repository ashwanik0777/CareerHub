/**
 * Shadow DOM Utilities
 * Provides functions to recursively query elements through Shadow boundaries.
 *
 * Finding shadow hosts requires visiting every element once. That walk is the
 * expensive part on large pages, so callers that run several queries should
 * collect the shadow roots once with `collectShadowRoots()` and pass the list
 * to `querySelectorAllDeep()` instead of re-walking the DOM per selector.
 */

/**
 * Walks `root` (and nested shadow trees) once and returns every open shadow
 * root found, in document order.
 */
export function collectShadowRoots(root: Document | ShadowRoot | Element = document): ShadowRoot[] {
  const roots: ShadowRoot[] = [];
  const stack: Array<Document | ShadowRoot | Element> = [root];

  while (stack.length > 0) {
    const current = stack.pop()!;
    const doc = current.ownerDocument ?? (current as Document);
    const walker = doc.createTreeWalker(current, NodeFilter.SHOW_ELEMENT);
    let node = walker.nextNode() as Element | null;
    while (node) {
      if (node.shadowRoot) {
        roots.push(node.shadowRoot);
        stack.push(node.shadowRoot);
      }
      node = walker.nextNode() as Element | null;
    }
  }

  return roots;
}

/**
 * Queries all elements matching a selector, including inside shadow DOMs.
 * Pass a precomputed `shadowRoots` list (from collectShadowRoots) to avoid
 * re-walking the tree for every selector.
 */
export function querySelectorAllDeep(
  selector: string,
  root: Document | ShadowRoot | Element = document,
  shadowRoots: ShadowRoot[] = collectShadowRoots(root)
): Element[] {
  const elements = Array.from(root.querySelectorAll(selector));
  for (const shadow of shadowRoots) {
    elements.push(...Array.from(shadow.querySelectorAll(selector)));
  }
  return elements;
}

export const FORM_ELEMENT_SELECTOR =
  'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select';

/**
 * Recursively scans for all form input elements across light and shadow DOMs.
 */
export function getAllFormElements(
  root: Document | ShadowRoot | Element = document,
  shadowRoots?: ShadowRoot[]
): Element[] {
  return querySelectorAllDeep(FORM_ELEMENT_SELECTOR, root, shadowRoots);
}

/**
 * Attaches a mutation observer to the document and all shadow roots.
 */
export function observeShadowRoots(
  callback: MutationCallback,
  options: MutationObserverInit,
  root: Document | ShadowRoot | Element = document
): MutationObserver[] {
  const observers: MutationObserver[] = [];
  const targets: Array<Document | ShadowRoot | Element> = [root, ...collectShadowRoots(root)];
  for (const target of targets) {
    const observer = new MutationObserver(callback);
    observer.observe(target, options);
    observers.push(observer);
  }
  return observers;
}
