/**
 * Autofill Engine
 * Robust value injector that handles React, Angular, Vue, and Shadow DOM boundaries.
 */

export class AutofillEngine {
  static triggerEvents(element: HTMLElement) {
    // Focus first (some frameworks need this)
    element.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
    element.dispatchEvent(new Event('focusin', { bubbles: true }));
    
    // Native events
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    
    // Keyboard events (helps Angular reactive forms)
    element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));
    element.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
    
    // Blur to finalize
    element.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
    element.dispatchEvent(new Event('focusout', { bubbles: true }));
    
    // React 15/16 hack
    const tracker = (element as any)._valueTracker;
    if (tracker) tracker.setValue('');
  }

  /**
   * Smart select option matching — tries multiple strategies to find the best match.
   */
  static findBestSelectOption(select: HTMLSelectElement, value: string): string {
    const valLower = value.toLowerCase().trim();
    const valWords = valLower.split(/[\s,]+/).filter(Boolean);

    // Strategy 1: Exact value match
    for (let i = 0; i < select.options.length; i++) {
      const opt = select.options[i];
      if (opt && opt.value.toLowerCase().trim() === valLower) return opt.value;
    }

    // Strategy 2: Exact text match
    for (let i = 0; i < select.options.length; i++) {
      const opt = select.options[i];
      if (opt && opt.text.toLowerCase().trim() === valLower) return opt.value;
    }

    // Strategy 3: Text includes value or value includes text
    for (let i = 0; i < select.options.length; i++) {
      const opt = select.options[i];
      if (!opt) continue;
      const optText = opt.text.toLowerCase().trim();
      if (optText.includes(valLower) || valLower.includes(optText)) {
        if (optText.length > 0) return opt.value;
      }
    }

    // Strategy 4: Value attribute includes match
    for (let i = 0; i < select.options.length; i++) {
      const opt = select.options[i];
      if (opt && opt.value.toLowerCase().includes(valLower)) return opt.value;
    }

    // Strategy 5: Word-level match — any word from the value appears in option text
    for (let i = 0; i < select.options.length; i++) {
      const opt = select.options[i];
      if (!opt) continue;
      const optText = opt.text.toLowerCase();
      for (const word of valWords) {
        if (word.length >= 3 && optText.includes(word)) return opt.value;
      }
    }

    // Strategy 6: First non-empty, non-placeholder option as fallback (only if select has few options)
    // This is specifically for gender/yes-no/country selects where the value might differ
    if (select.options.length <= 10 && select.options.length > 1) {
      // Try to match the first character/initial
      for (let i = 0; i < select.options.length; i++) {
        const opt = select.options[i];
        if (!opt || !opt.value) continue;
        const optText = opt.text.toLowerCase().trim();
        if (optText.startsWith(valLower.charAt(0)) && optText.length > 0) return opt.value;
      }
    }

    return '';
  }

  static injectValue(element: HTMLElement, value: string): boolean {
    if (!value) return false;

    const tag = element.tagName;
    
    if (tag === 'INPUT') {
      const input = element as HTMLInputElement;
      if (input.type === 'checkbox' || input.type === 'radio') {
        const isChecked = value.toLowerCase() === 'true' || value === '1' || value === 'yes';
        input.checked = isChecked;
        this.triggerEvents(input);
        return true;
      } else if (input.type === 'date') {
        // Handle date inputs — try to parse the value
        try {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            const formatted = date.toISOString().split('T')[0]!; // YYYY-MM-DD
            input.value = formatted;
            this.triggerEvents(input);
            return true;
          }
        } catch { /* fall through to normal text set */ }
        input.value = value;
        this.triggerEvents(input);
        return true;
      } else if (input.type === 'number') {
        // Extract numeric value
        const numericValue = value.replace(/[^0-9.-]/g, '');
        if (numericValue) {
          const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
          if (nativeSetter) nativeSetter.call(input, numericValue);
          else input.value = numericValue;
          this.triggerEvents(input);
          return true;
        }
        return false;
      } else if (input.type !== 'file') {
        // Native setter override for React 16+
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
        if (nativeSetter) {
          nativeSetter.call(input, value);
        } else {
          input.value = value;
        }
        this.triggerEvents(input);
        return true;
      }
    } else if (tag === 'TEXTAREA') {
      const textarea = element as HTMLTextAreaElement;
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
      if (nativeSetter) {
        nativeSetter.call(textarea, value);
      } else {
        textarea.value = value;
      }
      this.triggerEvents(textarea);
      return true;
    } else if (tag === 'SELECT') {
      const select = element as HTMLSelectElement;
      const matchedValue = this.findBestSelectOption(select, value);
      if (matchedValue) {
        select.value = matchedValue;
        this.triggerEvents(select);
        return true;
      }
    } else if (element.getAttribute('contenteditable') === 'true') {
      // Handle contenteditable divs (used by some modern editors)
      element.textContent = value;
      this.triggerEvents(element);
      return true;
    }

    return false;
  }
}
