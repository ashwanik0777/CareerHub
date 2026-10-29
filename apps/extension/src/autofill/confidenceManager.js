/**
 * Confidence Manager
 * Evaluates AI confidence and determines the required user interaction model.
 */
export var InteractionMode;
(function (InteractionMode) {
    InteractionMode["AUTO_FILL"] = "AUTO_FILL";
    InteractionMode["APPROVAL"] = "APPROVAL";
    InteractionMode["MANUAL"] = "MANUAL"; // < 92%
})(InteractionMode || (InteractionMode = {}));
export class ConfidenceManager {
    static evaluate(confidence) {
        if (confidence >= 0.98)
            return InteractionMode.AUTO_FILL;
        if (confidence >= 0.92)
            return InteractionMode.APPROVAL;
        return InteractionMode.MANUAL;
    }
}
//# sourceMappingURL=confidenceManager.js.map