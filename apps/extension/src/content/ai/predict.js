/**
 * AI API Predict Wrapper
 * Sends batched field metadata to the background service worker.
 */
import { safeSendMessage, isContextValid } from '../safe-chrome';
export async function predictFields(fields) {
    if (fields.length === 0)
        return null;
    if (!isContextValid())
        return null;
    return new Promise((resolve) => {
        safeSendMessage({
            action: 'PREDICT_FIELDS',
            fields: fields.map(f => f.metadata)
        }, (response) => {
            if (!response || !response.success) {
                console.error('AI Predict Failed:', response?.error || 'No response');
                resolve(null);
            }
            else {
                resolve(response.data);
            }
        });
    });
}
//# sourceMappingURL=predict.js.map