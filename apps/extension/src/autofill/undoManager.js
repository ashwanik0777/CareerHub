/**
 * Undo Manager
 * Allows users to revert an autofill action.
 */
import { AutofillEngine } from './autofillEngine';
import { HighlightEngine } from './highlightEngine';
export class UndoManager {
    static history = new Map();
    static saveState(element) {
        if (element.tagName === 'INPUT') {
            const input = element;
            if (input.type === 'checkbox' || input.type === 'radio') {
                this.history.set(element, input.checked ? 'true' : 'false');
            }
            else {
                this.history.set(element, input.value);
            }
        }
        else if (element.tagName === 'TEXTAREA') {
            this.history.set(element, element.value);
        }
        else if (element.tagName === 'SELECT') {
            this.history.set(element, element.value);
        }
    }
    static undo(element) {
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
//# sourceMappingURL=undoManager.js.map