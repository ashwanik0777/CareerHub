/**
 * AI API Predict Wrapper
 * Sends batched field metadata to the background service worker.
 */
import { ExtractedField } from '../dom/scanner';
import { PredictResponse } from '../../background/api';
export declare function predictFields(fields: ExtractedField[]): Promise<PredictResponse | null>;
//# sourceMappingURL=predict.d.ts.map