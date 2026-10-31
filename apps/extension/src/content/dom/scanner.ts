/**
 * DOM Scanner
 * Analyzes the DOM to extract comprehensive metadata for AI inference.
 */

import { getAllFormElements } from './shadowdom';

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

function cleanText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function extractLabel(element: HTMLElement): string {
  let labelText = '';

  const parentLabel = element.closest('label');
  if (parentLabel) {
    const clone = parentLabel.cloneNode(true) as HTMLElement;
    const inputs = clone.querySelectorAll('input, textarea, select');
    inputs.forEach(inp => inp.remove());
    labelText = cleanText(clone.textContent || '');
    if (labelText) return labelText;
  }

  if (element.id) {
    const label = document.querySelector(`label[for="${element.id}"]`);
    if (label) {
      labelText = cleanText(label.textContent || '');
      if (labelText) return labelText;
    }
  }

  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) return cleanText(ariaLabel);

  const ariaLabelledBy = element.getAttribute('aria-labelledby');
  if (ariaLabelledBy) {
    const ids = ariaLabelledBy.split(/\s+/);
    const parts = ids
      .map(id => document.getElementById(id))
      .filter(Boolean)
      .map(el => cleanText(el!.textContent || ''));
    if (parts.length > 0) return parts.join(' ');
  }

  const sibling = element.previousElementSibling;
  if (sibling && ['LABEL', 'SPAN', 'DIV', 'P'].includes(sibling.tagName.toUpperCase())) {
    const txt = cleanText(sibling.textContent || '');
    if (txt && txt.length < 100) return txt;
  }

  return '';
}

function extractNearbyText(element: HTMLElement): string {
  let parent = element.parentElement;
  for (let i = 0; i < 2 && parent; i++) {
    const directText = Array.from(parent.childNodes)
      .filter(node => node.nodeType === Node.TEXT_NODE)
      .map(node => cleanText(node.textContent || ''))
      .filter(t => t.length > 0)
      .join(' ');
    if (directText && directText.length < 100) return directText;
    parent = parent.parentElement;
  }
  return '';
}

function extractSectionHeading(element: HTMLElement): string {
  let current: HTMLElement | null = element;
  for (let i = 0; i < 6 && current; i++) {
    current = current.parentElement;
    if (!current) break;

    const heading = current.querySelector('h1, h2, h3, h4, legend');
    if (heading) return cleanText(heading.textContent || '');

    const sectionLabel = current.getAttribute('data-section') || current.getAttribute('aria-label');
    if (sectionLabel) return cleanText(sectionLabel);
  }
  return '';
}

function getCssSelector(el: Element): string {
  if (el.tagName.toLowerCase() == 'html') return 'html';
  let str = el.tagName.toLowerCase();
  str += (el.id !== '') ? '#' + el.id : '';
  if (el.className) {
    let classes = el.className.split(/\s/).filter(Boolean);
    for (let i = 0; i < classes.length; i++) {
      str += '.' + classes[i];
    }
  }
  return str;
}

function getXPath(element: Element): string {
  if (element.id !== '') return `id("${element.id}")`;
  if (element === document.body) return element.tagName.toLowerCase();

  let ix = 0;
  const parent = element.parentNode;
  const siblings = parent ? parent.childNodes : null;
  if (siblings) {
    for (let i = 0; i < siblings.length; i++) {
      const sibling = siblings[i];
      if (!sibling) continue;
      if (sibling === element) return getXPath(parent as Element) + '/' + element.tagName.toLowerCase() + '[' + (ix + 1) + ']';
      if (sibling.nodeType === 1 && (sibling as Element).tagName === element.tagName) ix++;
    }
  }
  return '';
}

export interface ScanOptions {
  /**
   * Skip the expensive per-field extras (nearby text, section heading walk,
   * xpath, css selector). The direct heuristic fill only needs label,
   * placeholder, name and aria-label.
   */
  lite?: boolean;
}

/**
 * Main scanner function: collects all form fields and their metadata.
 */
export function scanDomForFields(
  root: Document | ShadowRoot | Element = document,
  options: ScanOptions = {}
): ExtractedField[] {
  const elements = getAllFormElements(root);
  const fields: ExtractedField[] = [];
  const lite = options.lite === true;

  elements.forEach((node) => {
    const element = node as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    
    fields.push({
      element,
      metadata: {
        visibleLabel: extractLabel(element),
        placeholder: ('placeholder' in element) ? (element as any).placeholder || '' : '',
        fieldName: element.name || element.id || '',
        nearbyText: lite ? '' : extractNearbyText(element),
        sectionHeading: lite ? '' : extractSectionHeading(element),
        ariaLabel: element.getAttribute('aria-label') || '',
        fieldType: (element as HTMLInputElement).type || 'text',
        xpath: lite ? '' : getXPath(element),
        cssSelector: lite ? '' : getCssSelector(element),
      }
    });
  });

  return fields;
}
