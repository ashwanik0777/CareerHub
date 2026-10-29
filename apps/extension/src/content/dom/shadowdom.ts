/**
 * Shadow DOM Utilities
 * Provides functions to recursively query elements through Shadow boundaries.
 */

/**
 * Queries all elements matching a selector, including inside shadow DOMs.
 */
export function querySelectorAllDeep(
  selector: string,
  root: Document | ShadowRoot | Element = document
): Element[] {
  const elements = Array.from(root.querySelectorAll(selector));

  // Find all shadow roots within the current root
  const shadowHosts = Array.from(root.querySelectorAll('*')).filter((el) => el.shadowRoot);
  
  for (const host of shadowHosts) {
    if (host.shadowRoot) {
      elements.push(...querySelectorAllDeep(selector, host.shadowRoot));
    }
  }

  return elements;
}

/**
 * Recursively scans for all form input elements across light and shadow DOMs.
 */
export function getAllFormElements(root: Document | ShadowRoot | Element = document): Element[] {
  return querySelectorAllDeep('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select', root);
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

  const attachObserver = (node: Node) => {
    const observer = new MutationObserver(callback);
    observer.observe(node, options);
    observers.push(observer);
  };

  attachObserver(root);

  const shadowHosts = Array.from(root.querySelectorAll('*')).filter((el) => el.shadowRoot);
  for (const host of shadowHosts) {
    if (host.shadowRoot) {
      observers.push(...observeShadowRoots(callback, options, host.shadowRoot));
    }
  }

  return observers;
}
