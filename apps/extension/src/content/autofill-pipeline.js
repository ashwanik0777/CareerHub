import { analyzeFormFields } from './heuristics';
import { detectWebsite } from '../utils/website-rules';
import { analyzePageFields } from './semantic-analyzer';
import { querySelectorAllDeep, getAllFormElements } from './dom/shadowdom';
// ────────────────────────────────────────────────────────────────────────────
// Confidence Classification
// ────────────────────────────────────────────────────────────────────────────
const HIGH_CONFIDENCE_THRESHOLD = 0.85;
const MEDIUM_CONFIDENCE_THRESHOLD = 0.60;
function classifyConfidence(score) {
    if (score >= HIGH_CONFIDENCE_THRESHOLD)
        return 'HIGH';
    if (score >= MEDIUM_CONFIDENCE_THRESHOLD)
        return 'MEDIUM';
    return 'LOW';
}
/**
 * Dispatches native browser events to ensure React, Angular, or Vue frameworks
 * capture the value update.
 */
function dispatchEvents(element) {
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
}
/**
 * Extracts a value from a profile or resume object using a dot-notation key.
 */
function getValueByKey(obj, key) {
    return key.split('.').reduce((acc, part) => {
        if (acc === null || acc === undefined)
            return undefined;
        return acc[part];
    }, obj);
}
/**
 * Apply visual confidence indicator to a field element.
 * HIGH = green subtle border, MEDIUM = amber border, LOW = red outline
 */
function applyConfidenceIndicator(element, level) {
    const borderColors = {
        HIGH: '2px solid rgba(34, 197, 94, 0.6)', // green
        MEDIUM: '2px solid rgba(245, 158, 11, 0.6)', // amber
        LOW: '2px solid rgba(239, 68, 68, 0.6)', // red
    };
    const bgColors = {
        HIGH: 'rgba(34, 197, 94, 0.05)',
        MEDIUM: 'rgba(245, 158, 11, 0.05)',
        LOW: 'rgba(239, 68, 68, 0.05)',
    };
    element.style.outline = borderColors[level] || '';
    element.style.backgroundColor = bgColors[level] || '';
    element.style.transition = 'outline 0.3s ease, background-color 0.3s ease';
}
/**
 * Execute the enhanced autofill pipeline with confidence scoring.
 *
 * Pipeline Flow:
 * 1. Detect website and get site-specific rules
 * 2. Run enhanced semantic analysis on all page fields
 * 3. Fall back to legacy heuristics if semantic analyzer finds nothing
 * 4. Classify each field prediction by confidence level
 * 5. Fill HIGH confidence fields automatically
 * 6. Highlight MEDIUM confidence fields (amber) — filled but flagged
 * 7. Skip LOW confidence fields — highlighted red for manual entry
 * 8. Generate structured telemetry report
 */
export async function executeAutofillPipeline(profileData, resumeData) {
    const startTime = performance.now();
    const url = window.location.href;
    const siteRule = detectWebsite(url);
    if (!siteRule) {
        return { success: false, totalFields: 0, filledFieldsCount: 0, filledKeys: [], unmappedElementsCount: 0 };
    }
    // ── Phase 1: Enhanced semantic field analysis ──────────────────────────
    let semanticDescriptors = [];
    try {
        semanticDescriptors = analyzePageFields();
    }
    catch (e) {
        console.warn('Semantic analyzer failed, falling back to legacy heuristics:', e);
    }
    // ── Phase 2: Legacy heuristic analysis (fallback) ─────────────────────
    const formSelector = siteRule.selectors.form || 'form';
    const formElement = querySelectorAllDeep(formSelector)[0];
    // Build a map from legacy heuristics
    const legacyFields = formElement ? analyzeFormFields(formElement) : [];
    const mergedFields = [];
    const processedElements = new Set();
    // Apply site-specific field overrides from knowledge base (fixing the dead-code bug)
    if (siteRule.fieldOverrides) {
        for (const [selector, profileKey] of Object.entries(siteRule.fieldOverrides)) {
            const el = querySelectorAllDeep(selector)[0];
            if (el && !processedElements.has(el)) {
                processedElements.add(el);
                mergedFields.push({
                    element: el,
                    mappedKey: profileKey,
                    confidence: 0.95, // Site overrides are high confidence
                    source: 'SITE_OVERRIDE',
                });
            }
        }
    }
    // Add semantic descriptor-based detections
    // For now, use the legacy heuristic confidence scores matched to semantic descriptors
    // In the future, this will use the full SemanticFieldEngine from @platform/semantic-engine
    if (semanticDescriptors.length > 0) {
        for (const desc of semanticDescriptors) {
            if (processedElements.has(desc.element))
                continue;
            // Try to match this descriptor using legacy heuristics on the enriched label
            const combinedText = `${desc.label} ${desc.placeholder} ${desc.name} ${desc.id} ${desc.ariaLabel} ${desc.title} ${desc.nearbyText}`;
            let bestKey = '';
            let bestConfidence = 0;
            // Import field keywords inline for matching
            const { FIELD_KEYWORDS } = await import('./heuristics');
            for (const [fieldKey, regexes] of Object.entries(FIELD_KEYWORDS)) {
                if (fieldKey === 'resume_file' && desc.inputType !== 'file')
                    continue;
                for (const regex of regexes) {
                    if (regex.test(combinedText)) {
                        let confidence = 0.55;
                        if (regex.test(desc.label))
                            confidence = 0.92;
                        else if (regex.test(desc.ariaLabel))
                            confidence = 0.88;
                        else if (regex.test(desc.name))
                            confidence = 0.85;
                        else if (regex.test(desc.id))
                            confidence = 0.78;
                        else if (regex.test(desc.placeholder))
                            confidence = 0.70;
                        else if (regex.test(desc.title))
                            confidence = 0.68;
                        else if (regex.test(desc.nearbyText))
                            confidence = 0.60;
                        if (confidence > bestConfidence) {
                            bestConfidence = confidence;
                            bestKey = fieldKey;
                        }
                    }
                }
            }
            if (bestKey && bestConfidence > 0.4) {
                processedElements.add(desc.element);
                mergedFields.push({
                    element: desc.element,
                    mappedKey: bestKey,
                    confidence: bestConfidence,
                    source: 'SEMANTIC_ANALYSIS',
                });
            }
        }
    }
    // Add remaining legacy detections not already covered
    for (const field of legacyFields) {
        if (!processedElements.has(field.element)) {
            processedElements.add(field.element);
            mergedFields.push({
                element: field.element,
                mappedKey: field.mappedKey,
                confidence: field.confidence,
                source: 'RULE_ENGINE',
            });
        }
    }
    // ── Phase 4: Confidence-gated autofill ────────────────────────────────
    let filledFieldsCount = 0;
    const filledKeys = [];
    const fieldDetails = [];
    let highCount = 0, mediumCount = 0, lowCount = 0;
    let totalConfidence = 0;
    const dataContext = resumeData || profileData;
    for (const field of mergedFields) {
        const { element, mappedKey, confidence, source } = field;
        const confidenceLevel = classifyConfidence(confidence);
        totalConfidence += confidence;
        // Track confidence distribution
        if (confidenceLevel === 'HIGH')
            highCount++;
        else if (confidenceLevel === 'MEDIUM')
            mediumCount++;
        else
            lowCount++;
        // Handle file upload separately
        if (mappedKey === 'resume_file') {
            fieldDetails.push({ mappedKey, confidence, confidenceLevel, source, wasFilled: false });
            applyConfidenceIndicator(element, confidenceLevel);
            continue;
        }
        // Resolve value
        let value = '';
        if (mappedKey === 'name') {
            const first = getValueByKey(profileData, 'personalInfo.firstName') || '';
            const last = getValueByKey(profileData, 'personalInfo.lastName') || '';
            value = `${first} ${last}`.trim();
        }
        else {
            value = getValueByKey(dataContext, mappedKey);
        }
        // Fallback to main profile if resume doesn't have the value
        if (!value && dataContext !== profileData) {
            value = getValueByKey(profileData, mappedKey);
        }
        let wasFilled = false;
        // Only fill HIGH and MEDIUM confidence fields
        if (value && confidenceLevel !== 'LOW') {
            if (element.tagName === 'INPUT' && (element.type === 'checkbox' || element.type === 'radio')) {
                const input = element;
                const isChecked = String(value).toLowerCase() === 'true' || String(value) === '1';
                input.checked = isChecked;
                dispatchEvents(input);
                filledFieldsCount++;
                filledKeys.push(mappedKey);
                wasFilled = true;
            }
            else if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                const input = element;
                input.value = String(value);
                dispatchEvents(input);
                filledFieldsCount++;
                filledKeys.push(mappedKey);
                wasFilled = true;
            }
            else if (element.tagName === 'SELECT') {
                const select = element;
                const valStr = String(value).toLowerCase();
                let matchedValue = '';
                for (let i = 0; i < select.options.length; i++) {
                    const opt = select.options[i];
                    if (opt && (opt.value.toLowerCase() === valStr || opt.text.toLowerCase().includes(valStr))) {
                        matchedValue = opt.value;
                        break;
                    }
                }
                if (matchedValue) {
                    select.value = matchedValue;
                    dispatchEvents(select);
                    filledFieldsCount++;
                    filledKeys.push(mappedKey);
                    wasFilled = true;
                }
            }
        }
        // Apply visual confidence indicator
        applyConfidenceIndicator(element, confidenceLevel);
        fieldDetails.push({ mappedKey, confidence, confidenceLevel, source, wasFilled });
    }
    // ── Phase 5: Compute stats ────────────────────────────────────────────
    const allInputs = getAllFormElements();
    const totalFields = allInputs.length;
    const executionTimeMs = Math.round(performance.now() - startTime);
    return {
        success: filledFieldsCount > 0,
        totalFields,
        filledFieldsCount,
        filledKeys,
        unmappedElementsCount: Math.max(0, totalFields - mergedFields.length),
        confidenceBreakdown: {
            high: highCount,
            medium: mediumCount,
            low: lowCount,
            avgConfidence: mergedFields.length > 0 ? Math.round((totalConfidence / mergedFields.length) * 100) / 100 : 0,
        },
        fieldDetails,
        executionTimeMs,
    };
}
//# sourceMappingURL=autofill-pipeline.js.map