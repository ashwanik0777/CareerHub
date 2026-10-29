// ────────────────────────────────────────────────────────────────────────────
// Semantic Field Analyzer — Enhanced DOM Field Analysis
// ────────────────────────────────────────────────────────────────────────────
// Upgrades the extension's field detection from basic regex-only heuristics
// to a multi-source DOM analysis pipeline that produces rich FieldDescriptors
// suitable for semantic engine processing.
//
// Research contribution: Multi-signal field understanding combining
// label extraction, ARIA semantics, DOM hierarchy, and contextual signals.
// ────────────────────────────────────────────────────────────────────────────

import { querySelectorAllDeep, getAllFormElements } from './dom/shadowdom';

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
 * Clean whitespace from text content.
 */
function cleanText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Extract label text for a form element using multiple DOM sources.
 * Probes 8 sources in priority order for maximum coverage.
 */
function extractLabel(element: HTMLElement): string {
  let labelText = '';

  // 1. Check if element is nested inside a <label>
  const parentLabel = element.closest('label');
  if (parentLabel) {
    // Get label text excluding the input element's own text
    const clone = parentLabel.cloneNode(true) as HTMLElement;
    const inputs = clone.querySelectorAll('input, textarea, select');
    inputs.forEach(inp => inp.remove());
    labelText = cleanText(clone.textContent || '');
    if (labelText) return labelText;
  }

  // 2. Check for <label for="id"> matching element's id
  if (element.id) {
    const label = document.querySelector(`label[for="${element.id}"]`);
    if (label) {
      labelText = cleanText(label.textContent || '');
      if (labelText) return labelText;
    }
  }

  // 3. Check aria-label
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) {
    labelText = cleanText(ariaLabel);
    if (labelText) return labelText;
  }

  // 4. Check aria-labelledby (resolve referenced element)
  const ariaLabelledBy = element.getAttribute('aria-labelledby');
  if (ariaLabelledBy) {
    const ids = ariaLabelledBy.split(/\s+/);
    const parts = ids
      .map(id => document.getElementById(id))
      .filter(Boolean)
      .map(el => cleanText(el!.textContent || ''));
    labelText = parts.join(' ');
    if (labelText) return labelText;
  }

  // 5. Check title attribute
  const title = element.getAttribute('title');
  if (title) {
    labelText = cleanText(title);
    if (labelText) return labelText;
  }

  // 6. Check preceding sibling (label, span, div, p, strong)
  const sibling = element.previousElementSibling;
  if (sibling) {
    const tag = sibling.tagName.toUpperCase();
    if (['LABEL', 'SPAN', 'DIV', 'P', 'STRONG', 'EM', 'B'].includes(tag)) {
      labelText = cleanText(sibling.textContent || '');
      if (labelText && labelText.length < 100) return labelText;
    }
  }

  // 7. Check parent container for text (up to 2 levels)
  let parent = element.parentElement;
  for (let i = 0; i < 2 && parent; i++) {
    const directText = Array.from(parent.childNodes)
      .filter(node => node.nodeType === Node.TEXT_NODE)
      .map(node => cleanText(node.textContent || ''))
      .filter(t => t.length > 0)
      .join(' ');
    if (directText && directText.length < 80) {
      return directText;
    }
    parent = parent.parentElement;
  }

  // 8. Check closest <legend> in a <fieldset>
  const fieldset = element.closest('fieldset');
  if (fieldset) {
    const legend = fieldset.querySelector('legend');
    if (legend) {
      return cleanText(legend.textContent || '');
    }
  }

  return '';
}

/**
 * Extract nearby heading text (h1-h4) that provides section context.
 */
function extractNearbyHeading(element: HTMLElement): string {
  // Walk up the DOM looking for a section with a heading
  let current: HTMLElement | null = element;
  for (let i = 0; i < 5 && current; i++) {
    current = current.parentElement;
    if (!current) break;

    // Check for headings within this container
    const heading = current.querySelector('h1, h2, h3, h4');
    if (heading) {
      return cleanText(heading.textContent || '');
    }

    // Check for legend
    const legend = current.querySelector('legend');
    if (legend) {
      return cleanText(legend.textContent || '');
    }

    // Check data-section or data-label attributes
    const sectionLabel = current.getAttribute('data-section') ||
                          current.getAttribute('data-label') ||
                          current.getAttribute('aria-label');
    if (sectionLabel) {
      return cleanText(sectionLabel);
    }
  }
  return '';
}

/**
 * Extract parent section context (fieldset name, form section, etc.)
 */
function extractParentSection(element: HTMLElement): string {
  const fieldset = element.closest('fieldset');
  if (fieldset) {
    const legend = fieldset.querySelector('legend');
    if (legend) return cleanText(legend.textContent || '');
    const ariaLabel = fieldset.getAttribute('aria-label');
    if (ariaLabel) return cleanText(ariaLabel);
  }

  // Check for section/div with role or class hints
  let parent = element.parentElement;
  for (let i = 0; i < 4 && parent; i++) {
    const role = parent.getAttribute('role');
    if (role === 'group' || role === 'region') {
      const label = parent.getAttribute('aria-label') ||
                    parent.getAttribute('data-section');
      if (label) return cleanText(label);
    }

    // Class-based hints
    const className = parent.className || '';
    if (typeof className === 'string') {
      const sectionMatch = className.match(/section[-_]?([\w]+)/i);
      if (sectionMatch && sectionMatch[1]) return sectionMatch[1].replace(/[-_]/g, ' ');
    }

    parent = parent.parentElement;
  }
  return '';
}

/**
 * Build a simplified DOM path for the element.
 */
function buildDomPath(element: HTMLElement): string {
  const parts: string[] = [];
  let current: HTMLElement | null = element;

  for (let i = 0; i < 4 && current; i++) {
    let selector = current.tagName.toLowerCase();
    if (current.id) selector += `#${current.id}`;
    else if (current.className && typeof current.className === 'string') {
      const firstClass = current.className.split(/\s+/)[0];
      if (firstClass) selector += `.${firstClass}`;
    }
    parts.unshift(selector);
    current = current.parentElement;
  }

  return parts.join(' > ');
}

/**
 * Extract form-level context from the containing form element.
 */
function extractFormContext(element: HTMLElement): string {
  const form = element.closest('form');
  if (!form) return '';

  const parts: string[] = [];

  if (form.id) parts.push(`form#${form.id}`);
  if (form.getAttribute('data-testid')) parts.push(form.getAttribute('data-testid')!);

  // Form heading
  const heading = form.querySelector('h1, h2, h3');
  if (heading) parts.push(cleanText(heading.textContent || ''));

  // Form action
  const action = form.getAttribute('action');
  if (action && action !== '#') parts.push(action);

  return parts.join(' | ');
}

/**
 * Analyze all form fields on the page and produce rich FieldDescriptors.
 * Unlike the legacy heuristics which only scan the first matching form,
 * this analyzer scans ALL forms and also finds formless inputs.
 */
export function analyzePageFields(): FieldDescriptor[] {
  const descriptors: FieldDescriptor[] = [];
  const processedElements = new Set<HTMLElement>();

  // 1. Scan all forms on the page
  const forms = querySelectorAllDeep('form');
  forms.forEach(form => {
    const inputs = querySelectorAllDeep('input, textarea, select', form);
    inputs.forEach(node => {
      const element = node as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      if (element.type === 'hidden' || element.type === 'submit' || element.type === 'button') return;
      if (processedElements.has(element)) return;
      processedElements.add(element);
      descriptors.push(buildFieldDescriptor(element));
    });
  });

  // 2. Scan formless inputs (inputs not inside any <form>)
  const allInputs = getAllFormElements();
  allInputs.forEach(node => {
    const element = node as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    if (element.type === 'hidden' || element.type === 'submit' || element.type === 'button') return;
    if (processedElements.has(element)) return;
    if (!element.closest('form')) {
      processedElements.add(element);
      descriptors.push(buildFieldDescriptor(element));
    }
  });

  return descriptors;
}

/**
 * Build a FieldDescriptor from a DOM element by extracting all contextual signals.
 */
function buildFieldDescriptor(
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
): FieldDescriptor {
  const label = extractLabel(element);
  const placeholder = ('placeholder' in element) ? (element as any).placeholder || '' : '';
  const nameAttr = element.name || '';
  const idAttr = element.id || '';
  const ariaLabel = element.getAttribute('aria-label') || '';
  const title = element.getAttribute('title') || '';
  const nearbyText = extractNearbyHeading(element);
  const parentSection = extractParentSection(element);
  const domPath = buildDomPath(element);
  const formContext = extractFormContext(element);
  const isRequired = element.hasAttribute('required') || element.getAttribute('aria-required') === 'true';
  const validationPattern = element.getAttribute('pattern') || '';

  return {
    tagName: element.tagName,
    inputType: (element as HTMLInputElement).type || 'text',
    label: cleanText(label),
    placeholder: cleanText(placeholder),
    name: nameAttr,
    id: idAttr,
    ariaLabel: cleanText(ariaLabel),
    title: cleanText(title),
    nearbyText: cleanText(nearbyText),
    parentSection: cleanText(parentSection),
    domPath,
    formContext: cleanText(formContext),
    isRequired,
    validationPattern,
    element,
  };
}

/**
 * Create a MutationObserver that watches for dynamically added form fields.
 * Calls the callback with newly detected FieldDescriptors when new inputs appear.
 */
export function observeDynamicFields(
  callback: (newFields: FieldDescriptor[]) => void
): MutationObserver {
  const processedElements = new Set<HTMLElement>();

  // Mark existing elements as processed
  document.querySelectorAll('input, textarea, select').forEach(el => {
    processedElements.add(el as HTMLElement);
  });

  const observer = new MutationObserver((mutations) => {
    const newDescriptors: FieldDescriptor[] = [];

    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        const el = node as HTMLElement;

        // Check if the added node itself is an input
        if (el.matches && el.matches('input, textarea, select')) {
          if (!processedElements.has(el)) {
            const inputEl = el as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
            if (inputEl.type !== 'hidden' && inputEl.type !== 'submit' && inputEl.type !== 'button') {
              processedElements.add(el);
              newDescriptors.push(buildFieldDescriptor(inputEl));
            }
          }
        }

        // Check children of the added node
        const childInputs = el.querySelectorAll ? el.querySelectorAll('input, textarea, select') : [];
        childInputs.forEach(childNode => {
          const child = childNode as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
          if (!processedElements.has(child)) {
            if (child.type !== 'hidden' && child.type !== 'submit' && child.type !== 'button') {
              processedElements.add(child);
              newDescriptors.push(buildFieldDescriptor(child));
            }
          }
        });
      });
    });

    if (newDescriptors.length > 0) {
      callback(newDescriptors);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  return observer;
}
