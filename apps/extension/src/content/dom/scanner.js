/**
 * DOM Scanner
 * Analyzes the DOM to extract comprehensive metadata for AI inference.
 */
import { getAllFormElements } from './shadowdom';
function cleanText(text) {
    return text.replace(/\s+/g, ' ').trim();
}
function extractLabel(element) {
    let labelText = '';
    const parentLabel = element.closest('label');
    if (parentLabel) {
        const clone = parentLabel.cloneNode(true);
        const inputs = clone.querySelectorAll('input, textarea, select');
        inputs.forEach(inp => inp.remove());
        labelText = cleanText(clone.textContent || '');
        if (labelText)
            return labelText;
    }
    if (element.id) {
        const label = document.querySelector(`label[for="${element.id}"]`);
        if (label) {
            labelText = cleanText(label.textContent || '');
            if (labelText)
                return labelText;
        }
    }
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel)
        return cleanText(ariaLabel);
    const ariaLabelledBy = element.getAttribute('aria-labelledby');
    if (ariaLabelledBy) {
        const ids = ariaLabelledBy.split(/\s+/);
        const parts = ids
            .map(id => document.getElementById(id))
            .filter(Boolean)
            .map(el => cleanText(el.textContent || ''));
        if (parts.length > 0)
            return parts.join(' ');
    }
    const sibling = element.previousElementSibling;
    if (sibling && ['LABEL', 'SPAN', 'DIV', 'P'].includes(sibling.tagName.toUpperCase())) {
        const txt = cleanText(sibling.textContent || '');
        if (txt && txt.length < 100)
            return txt;
    }
    return '';
}
function extractNearbyText(element) {
    let parent = element.parentElement;
    for (let i = 0; i < 2 && parent; i++) {
        const directText = Array.from(parent.childNodes)
            .filter(node => node.nodeType === Node.TEXT_NODE)
            .map(node => cleanText(node.textContent || ''))
            .filter(t => t.length > 0)
            .join(' ');
        if (directText && directText.length < 100)
            return directText;
        parent = parent.parentElement;
    }
    return '';
}
function extractSectionHeading(element) {
    let current = element;
    for (let i = 0; i < 6 && current; i++) {
        current = current.parentElement;
        if (!current)
            break;
        const heading = current.querySelector('h1, h2, h3, h4, legend');
        if (heading)
            return cleanText(heading.textContent || '');
        const sectionLabel = current.getAttribute('data-section') || current.getAttribute('aria-label');
        if (sectionLabel)
            return cleanText(sectionLabel);
    }
    return '';
}
function getCssSelector(el) {
    if (el.tagName.toLowerCase() == 'html')
        return 'html';
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
function getXPath(element) {
    if (element.id !== '')
        return `id("${element.id}")`;
    if (element === document.body)
        return element.tagName.toLowerCase();
    let ix = 0;
    const parent = element.parentNode;
    const siblings = parent ? parent.childNodes : null;
    if (siblings) {
        for (let i = 0; i < siblings.length; i++) {
            const sibling = siblings[i];
            if (!sibling)
                continue;
            if (sibling === element)
                return getXPath(parent) + '/' + element.tagName.toLowerCase() + '[' + (ix + 1) + ']';
            if (sibling.nodeType === 1 && sibling.tagName === element.tagName)
                ix++;
        }
    }
    return '';
}
/**
 * Main scanner function: collects all form fields and their metadata.
 */
export function scanDomForFields(root = document) {
    const elements = getAllFormElements(root);
    const fields = [];
    elements.forEach((node) => {
        const element = node;
        fields.push({
            element,
            metadata: {
                visibleLabel: extractLabel(element),
                placeholder: ('placeholder' in element) ? element.placeholder || '' : '',
                fieldName: element.name || element.id || '',
                nearbyText: extractNearbyText(element),
                sectionHeading: extractSectionHeading(element),
                ariaLabel: element.getAttribute('aria-label') || '',
                fieldType: element.type || 'text',
                xpath: getXPath(element),
                cssSelector: getCssSelector(element),
            }
        });
    });
    return fields;
}
//# sourceMappingURL=scanner.js.map