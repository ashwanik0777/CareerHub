/**
 * Feedback Collector
 * Observes fields after autofill to detect if the user corrects the value.
 */

import { DatasetSample } from '../dataset/datasetQueues';
import { PredictionLogger } from './predictionLogger';

export class FeedbackCollector {
  private static observedFields = new Map<HTMLElement, {
    metadata: DatasetSample['metadata'];
    prediction: DatasetSample['aiPrediction'];
    originalValue: string;
  }>();

  static observe(
    element: HTMLElement, 
    metadata: DatasetSample['metadata'], 
    prediction: DatasetSample['aiPrediction'],
    injectedValue: string
  ) {
    this.observedFields.set(element, { metadata, prediction, originalValue: injectedValue });

    const handleBlur = async (e: Event) => {
      const target = e.target as HTMLElement;
      if (!this.observedFields.has(target)) return;

      const data = this.observedFields.get(target)!;
      
      let currentValue = '';
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        currentValue = (target as HTMLInputElement | HTMLTextAreaElement).value;
      } else if (target.tagName === 'SELECT') {
        currentValue = (target as HTMLSelectElement).value;
      }

      if (currentValue !== data.originalValue) {
        // User edited the field
        await PredictionLogger.log(
          data.metadata,
          data.prediction,
          {
            action: 'EDITED',
            correctedValueMasked: '***' // Never store actual user typed value
          },
          '***'
        );
      } else {
        // User accepted it implicitly
        await PredictionLogger.log(
          data.metadata,
          data.prediction,
          { action: 'ACCEPTED' },
          '***'
        );
      }

      // Stop observing after first blur to avoid spam
      target.removeEventListener('blur', handleBlur);
      this.observedFields.delete(target);
    };

    element.addEventListener('blur', handleBlur);
  }
}
