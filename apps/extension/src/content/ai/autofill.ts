/**
 * Autofill Engine
 * Simulates user inputs to trigger framework (React/Angular/Vue) state updates.
 */

export function triggerEvents(element: HTMLElement) {
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
  element.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
}

export function autofillElement(element: HTMLElement, value: string): boolean {
  if (!value) return false;

  const tag = element.tagName;
  
  if (tag === 'INPUT') {
    const input = element as HTMLInputElement;
    if (input.type === 'checkbox' || input.type === 'radio') {
      const isChecked = value.toLowerCase() === 'true' || value === '1';
      input.checked = isChecked;
      triggerEvents(input);
      return true;
    } else if (input.type !== 'file') {
      input.value = value;
      triggerEvents(input);
      return true;
    }
  } else if (tag === 'TEXTAREA') {
    const textarea = element as HTMLTextAreaElement;
    textarea.value = value;
    triggerEvents(textarea);
    return true;
  } else if (tag === 'SELECT') {
    const select = element as HTMLSelectElement;
    const valStr = value.toLowerCase();
    let matchedValue = '';
    
    for (let i = 0; i < select.options.length; i++) {
      const opt = select.options[i];
      if (opt && (opt.value.toLowerCase() === valStr || opt.text.toLowerCase().includes(valStr))) {
        matchedValue = opt.value;
        break;
      }
    }

    if (matchedValue) {
      select.value = matchedValue;
      triggerEvents(select);
      return true;
    }
  }

  return false;
}
