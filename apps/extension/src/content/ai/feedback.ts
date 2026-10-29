/**
 * User Feedback Engine
 * Detects user corrections on autofilled fields and sends them to the backend.
 */

import { safeSendMessage } from '../safe-chrome';

export class FeedbackEngine {
  static recordPositive(predictedClass: string, value: string) {
    safeSendMessage({ action: 'RECORD_ANALYTICS_UPDATE', type: 'positive', predictedClass, value });
  }

  static recordNegative(predictedClass: string, value: string) {
    safeSendMessage({ action: 'RECORD_ANALYTICS_UPDATE', type: 'negative', predictedClass, value });
  }

  static attachListeners(element: HTMLElement, originalPredictedClass: string) {
    const tagName = element.tagName;
    
    // We only care about user inputs (typing, selecting) that happen AFTER autofill
    const listener = () => {
      // The user edited the field. We record a correction.
      const confidenceLevel = element.getAttribute('data-careerhub-confidence');
      
      if (confidenceLevel === 'HIGH' || confidenceLevel === 'MEDIUM') {
        // Send feedback to background script
        safeSendMessage({
          action: 'SUBMIT_FEEDBACK',
          feedback: {
            url: window.location.href,
            predictedClass: originalPredictedClass,
            elementName: (element as HTMLInputElement).name || element.id,
            wasCorrected: true,
            timestamp: Date.now()
          }
        });

        // Update analytics (decrease accepted, increase corrected)
        safeSendMessage({ action: 'RECORD_CORRECTION' });

        // Remove the listener so we don't spam the API for every keystroke
        element.removeEventListener('input', listener);
        element.removeEventListener('change', listener);
      }
    };

    if (tagName === 'INPUT' || tagName === 'TEXTAREA') {
      // For typing, 'input' event is best, but we'll attach on 'change' (blur) to avoid spam
      element.addEventListener('change', listener);
    } else if (tagName === 'SELECT') {
      element.addEventListener('change', listener);
    }
  }
}
