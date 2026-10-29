/**
 * Undo Manager
 * Allows users to revert an autofill action.
 */

import { AutofillEngine } from './autofillEngine';
import { HighlightEngine } from './highlightEngine';

export class UndoManager {
  private static history = new Map<HTMLElement, string>();

  static saveState(element: HTMLElement) {
    if (element.tagName === 'INPUT') {
      const input = element as HTMLInputElement;
      if (input.type === 'checkbox' || input.type === 'radio') {
        this.history.set(element, input.checked ? 'true' : 'false');
      } else {
        this.history.set(element, input.value);
      }
    } else if (element.tagName === 'TEXTAREA') {
      this.history.set(element, (element as HTMLTextAreaElement).value);
    } else if (element.tagName === 'SELECT') {
      this.history.set(element, (element as HTMLSelectElement).value);
    }
  }

  static undo(element: HTMLElement) {
    if (this.history.has(element)) {
      const originalValue = this.history.get(element);
      if (originalValue !== undefined) {
        AutofillEngine.injectValue(element, originalValue);
        HighlightEngine.clear(element);
        this.history.delete(element);
      }
    }
  }
}
