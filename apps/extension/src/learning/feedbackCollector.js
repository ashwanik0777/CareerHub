/**
 * Feedback Collector
 * Observes fields after autofill to detect if the user corrects the value.
 */
import { PredictionLogger } from './predictionLogger';
export class FeedbackCollector {
    static observedFields = new Map();
    static observe(element, metadata, prediction, injectedValue) {
        this.observedFields.set(element, { metadata, prediction, originalValue: injectedValue });
        const handleBlur = async (e) => {
            const target = e.target;
            if (!this.observedFields.has(target))
                return;
            const data = this.observedFields.get(target);
            let currentValue = '';
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                currentValue = target.value;
            }
            else if (target.tagName === 'SELECT') {
                currentValue = target.value;
            }
            if (currentValue !== data.originalValue) {
                // User edited the field
                await PredictionLogger.log(data.metadata, data.prediction, {
                    action: 'EDITED',
                    correctedValueMasked: '***' // Never store actual user typed value
                }, '***');
            }
            else {
                // User accepted it implicitly
                await PredictionLogger.log(data.metadata, data.prediction, { action: 'ACCEPTED' }, '***');
            }
            // Stop observing after first blur to avoid spam
            target.removeEventListener('blur', handleBlur);
            this.observedFields.delete(target);
        };
        element.addEventListener('blur', handleBlur);
    }
}
//# sourceMappingURL=feedbackCollector.js.map