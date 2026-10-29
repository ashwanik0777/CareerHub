import { StorageService } from './storage';
/** The API rejects batches above this size. */
const MAX_BATCH_SIZE = 50;
/**
 * Reads the session token so API calls authenticate like the rest of the
 * extension: cookie first, chrome.storage fallback.
 */
async function getSessionToken(origin) {
    return new Promise((resolve) => {
        if (typeof chrome === 'undefined' || !chrome.cookies) {
            resolve(null);
            return;
        }
        chrome.cookies.get({ url: origin, name: 'session_token' }, (cookie) => {
            if (cookie && cookie.value) {
                resolve(cookie.value);
            }
            else {
                chrome.storage.local.get(['session_token'], (result) => {
                    resolve(result.session_token || null);
                });
            }
        });
    });
}
export class ApiService {
    /**
     * Calls the AI backend to predict field types in batch.
     * Sends the session token as a Bearer header, chunks requests to the API's
     * batch limit, and adapts the server's FieldPrediction shape to the
     * extension's internal PredictResponse.
     */
    static async predictBatch(fields) {
        const settings = await StorageService.getSettings();
        const endpoint = `${settings.apiEndpoint}/predict`;
        const origin = new URL(settings.apiEndpoint).origin;
        const token = await getSessionToken(origin);
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const started = Date.now();
        const allPredictions = [];
        try {
            for (let i = 0; i < fields.length; i += MAX_BATCH_SIZE) {
                const chunk = fields.slice(i, i + MAX_BATCH_SIZE);
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ fields: chunk }),
                });
                if (!response.ok) {
                    throw new Error(`API Error: ${response.status} ${response.statusText}`);
                }
                const data = await response.json();
                allPredictions.push(...(data.predictions || []));
            }
            return {
                fields: allPredictions.map((p) => ({
                    // Empty attributeId means the model abstained — treat as miscellaneous
                    predictedClass: p.attributeId || 'miscellaneous',
                    confidence: p.confidence,
                    confidenceLevel: p.confidenceLevel,
                    topK: (p.alternativeMappings || []).map((alt) => ({
                        class: alt.attributeId,
                        probability: alt.confidence,
                    })),
                })),
                batchLatencyMs: Date.now() - started,
            };
        }
        catch (error) {
            console.error('ApiService: Failed to call prediction API', error);
            throw error;
        }
    }
    /**
     * Submit feedback for an autofilled field.
     */
    static async submitFeedback(feedbackData) {
        const settings = await StorageService.getSettings();
        const endpoint = `${settings.apiEndpoint}/feedback`;
        const origin = new URL(settings.apiEndpoint).origin;
        const token = await getSessionToken(origin);
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        try {
            await fetch(endpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify(feedbackData),
            });
        }
        catch (error) {
            console.error('ApiService: Failed to submit feedback', error);
            // Fail silently for feedback
        }
    }
}
//# sourceMappingURL=api.js.map