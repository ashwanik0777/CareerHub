/**
 * AI API Predict Wrapper
 * Sends batched field metadata to the background service worker.
 */

import { ExtractedField } from '../dom/scanner';
import { PredictResponse } from '../../background/api';
import { safeSendMessage, isContextValid } from '../safe-chrome';

export async function predictFields(fields: ExtractedField[]): Promise<PredictResponse | null> {
  if (fields.length === 0) return null;
  if (!isContextValid()) return null;

  return new Promise((resolve) => {
    safeSendMessage(
      { 
        action: 'PREDICT_FIELDS', 
        fields: fields.map(f => f.metadata) 
      }, 
      (response: any) => {
        if (!response || !response.success) {
          console.error('AI Predict Failed:', response?.error || 'No response');
          resolve(null);
        } else {
          resolve(response.data);
        }
      }
    );
  });
}
