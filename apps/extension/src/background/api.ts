import { StorageService } from './storage';

export interface PredictRequestField {
  visibleLabel: string;
  placeholder: string;
  fieldName: string;
  nearbyText: string;
  sectionHeading: string;
  ariaLabel: string;
  fieldType: string;
}

export interface PredictResponse {
  fields: Array<{
    predictedClass: string;
    confidence: number;
    confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    topK: Array<{ class: string; probability: number }>;
  }>;
  batchLatencyMs: number;
}

/** Server shape: FieldPrediction from POST /api/ai/predict (batch mode). */
interface ServerPrediction {
  attributeId: string;
  confidence: number;
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  source: string;
  reasoning: string;
  alternativeMappings?: Array<{ attributeId: string; confidence: number; source: string }>;
}

/** The API rejects batches above this size. */
const MAX_BATCH_SIZE = 50;

/**
 * Reads the session token so API calls authenticate like the rest of the
 * extension: cookie for the backend origin first, chrome.storage fallback.
 */
export async function getSessionToken(origin: string): Promise<string | null> {
  return new Promise((resolve) => {
    if (typeof chrome === 'undefined' || !chrome.cookies) {
      resolve(null);
      return;
    }
    chrome.cookies.get({ url: origin, name: 'session_token' }, (cookie) => {
      if (chrome.runtime.lastError) {
        // No host permission for this origin yet (user must grant it in Options).
        resolve(null);
        return;
      }
      if (cookie && cookie.value) {
        resolve(cookie.value);
      } else {
        chrome.storage.local.get(['session_token'], (result) => {
          resolve(typeof result.session_token === 'string' ? result.session_token : null);
        });
      }
    });
  });
}

async function authHeaders(origin: string): Promise<Record<string, string>> {
  const token = await getSessionToken(origin);
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export class ApiService {
  /**
   * Calls the AI backend to predict field types in batch.
   * Sends the session token as a Bearer header, chunks requests to the API's
   * batch limit, and adapts the server's FieldPrediction shape to the
   * extension's internal PredictResponse.
   */
  static async predictBatch(fields: PredictRequestField[]): Promise<PredictResponse> {
    const { backendUrl } = await StorageService.getSettings();
    const endpoint = `${backendUrl}/api/ai/predict`;
    const headers = await authHeaders(backendUrl);

    const started = Date.now();
    const allPredictions: ServerPrediction[] = [];

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
      allPredictions.push(...((data.predictions || []) as ServerPrediction[]));
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

  /**
   * Submit feedback for an autofilled field. Never throws: feedback is
   * best-effort and must not break the autofill flow.
   */
  static async submitFeedback(feedbackData: unknown): Promise<void> {
    try {
      const { backendUrl } = await StorageService.getSettings();
      const headers = await authHeaders(backendUrl);
      await fetch(`${backendUrl}/api/ai/feedback`, {
        method: 'POST',
        headers,
        body: JSON.stringify(feedbackData),
      });
    } catch (error) {
      console.error('ApiService: Failed to submit feedback', error);
    }
  }
}
