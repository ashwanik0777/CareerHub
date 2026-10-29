import { DynamicDOMObserver } from './dom/observer';
import { scanDomForFields } from './dom/scanner';
import { mapPredictionToValue } from './ai/mapping';
import { AutofillEngine } from '../autofill/autofillEngine';
import { HighlightEngine } from '../autofill/highlightEngine';
import { safeAddMessageListener, isContextValid } from './safe-chrome';
import { FIELD_KEYWORDS, getLabelForElement } from './heuristics';
import { querySelectorAllDeep, getAllFormElements } from './dom/shadowdom';

console.log('Autofill Engine: Content script listener online (v5 — Direct Heuristic Fill).');

let activeProfileData: any = null;
let activeResumeData: any = null;
let domObserver: DynamicDOMObserver | null = null;

/**
 * Inline site-specific field overrides.
 * Duplicated here to avoid importing from ../utils/website-rules which
 * would create a shared Vite chunk that content scripts can't load.
 */
function getSiteOverrides(url: string): Record<string, string> | null {
  const rules: Array<{ pattern: RegExp; overrides: Record<string, string> }> = [
    {
      pattern: /boards\.greenhouse\.io/i,
      overrides: {
        '#first_name': 'personalInfo.firstName',
        '#last_name': 'personalInfo.lastName',
        '#email': 'email',
        '#phone': 'personalInfo.phone',
      },
    },
    {
      pattern: /jobs\.lever\.co/i,
      overrides: {
        'input[name="name"]': 'name',
        'input[name="email"]': 'email',
        'input[name="phone"]': 'personalInfo.phone',
        'input[name="org"]': 'experience.company',
        'input[name="urls[LinkedIn]"]': 'linkedinUrl',
        'input[name="urls[GitHub]"]': 'githubUrl',
      },
    },
    {
      pattern: /linkedin\.com\/jobs/i,
      overrides: {
        'input[id*="first-name"]': 'personalInfo.firstName',
        'input[id*="last-name"]': 'personalInfo.lastName',
        'input[id*="email"]': 'email',
        'input[id*="phone"]': 'personalInfo.phone',
        'input[id*="city"]': 'personalInfo.location',
      },
    },
    {
      pattern: /indeed\.com/i,
      overrides: {
        'input[id="input-firstName"]': 'personalInfo.firstName',
        'input[id="input-lastName"]': 'personalInfo.lastName',
        'input[id="input-email"]': 'email',
        'input[id="input-phoneNumber"]': 'personalInfo.phone',
        'input[id="input-location"]': 'personalInfo.location',
      },
    },
    {
      pattern: /internshala\.com/i,
      overrides: {
        'input[name="first_name"]': 'personalInfo.firstName',
        'input[name="last_name"]': 'personalInfo.lastName',
        'input[name="email"]': 'email',
        'input[name="phone"]': 'personalInfo.phone',
        'input[name="location"]': 'personalInfo.location',
      },
    },
  ];

  for (const rule of rules) {
    if (rule.pattern.test(url)) return rule.overrides;
  }
  return null;
}

/**
 * Direct heuristic-based field matching.
 * Combines label text, name, id, placeholder, and aria-label to determine the field type.
 * Returns the mapped profile key and a confidence score.
 */
function identifyField(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): { mappedKey: string; confidence: number } | null {
  const label = getLabelForElement(element);
  const placeholder = 'placeholder' in element ? (element as any).placeholder || '' : '';
  const nameAttr = element.name || '';
  const idAttr = element.id || '';
  const ariaLabel = element.getAttribute('aria-label') || '';
  const title = element.getAttribute('title') || '';

  const searchText = `${label} ${placeholder} ${nameAttr} ${idAttr} ${ariaLabel} ${title}`;

  // Skip file inputs
  if (element.type === 'file') return null;
  if (element.type === 'hidden' || element.type === 'submit' || element.type === 'button') return null;

  let bestKey = '';
  let bestConfidence = 0;

  for (const [fieldKey, regexes] of Object.entries(FIELD_KEYWORDS)) {
    if (fieldKey === 'resume_file') continue;
    for (const regex of regexes) {
      if (regex.test(searchText)) {
        let confidence = 0.50;
        if (regex.test(label))       confidence = 0.92;
        else if (regex.test(ariaLabel))  confidence = 0.88;
        else if (regex.test(nameAttr))   confidence = 0.85;
        else if (regex.test(idAttr))     confidence = 0.80;
        else if (regex.test(placeholder)) confidence = 0.72;
        else if (regex.test(title))       confidence = 0.68;

        if (confidence > bestConfidence) {
          bestConfidence = confidence;
          bestKey = fieldKey;
        }
      }
    }
  }

  if (bestKey && bestConfidence > 0.4) {
    return { mappedKey: bestKey, confidence: bestConfidence };
  }

  return null;
}

/**
 * Execute the autofill pipeline — 100% client-side, no AI backend needed.
 * 
 * Flow:
 * 1. Find all visible form elements on the page (including shadow DOM)
 * 2. For each element, identify what profile field it corresponds to via heuristics
 * 3. Resolve the value from the user's profile data
 * 4. Fill the field and apply visual confidence indicator
 */
async function executeDirectAutofill(profile: any, resume?: any) {
  const startTime = performance.now();
  activeProfileData = profile;
  activeResumeData = resume;

  // Step 1: Collect all form fields on the page
  const allElements = getAllFormElements();
  const totalFields = allElements.length;
  let filledFieldsCount = 0;
  const filledKeys: string[] = [];
  const processedElements = new Set<HTMLElement>();

  // Step 2: Try site-specific overrides first (CSS selector → profile key)
  const siteOverrides = getSiteOverrides(window.location.href);
  
  if (siteOverrides) {
    for (const [selector, profileKey] of Object.entries(siteOverrides)) {
      try {
        const el = querySelectorAllDeep(selector)[0] as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
        if (el && !processedElements.has(el)) {
          const value = mapPredictionToValue(profileKey, profile, resume, {
            visibleLabel: getLabelForElement(el),
            placeholder: 'placeholder' in el ? (el as any).placeholder || '' : '',
            fieldName: el.name || el.id || '',
            ariaLabel: el.getAttribute('aria-label') || '',
          });
          if (value) {
            const success = AutofillEngine.injectValue(el, value);
            if (success) {
              HighlightEngine.apply(el, 'AUTO_FILL');
              processedElements.add(el);
              filledFieldsCount++;
              filledKeys.push(profileKey);
            }
          }
        }
      } catch {
        // Selector might be invalid, skip
      }
    }
  }

  // Step 3: Heuristic matching for remaining fields
  for (const node of allElements) {
    const element = node as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    if (processedElements.has(element)) continue;
    if (element.type === 'hidden' || element.type === 'submit' || element.type === 'button' || element.type === 'file') continue;

    // Skip fields that are invisible
    try {
      const style = window.getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue;
    } catch { continue; }

    // Security: skip password, CSRF, etc.
    const nameId = `${element.name || ''} ${element.id || ''}`.toLowerCase();
    if (/password|csrf|token|captcha|otp|cvv|credit|card|payment/i.test(nameId)) continue;

    const identification = identifyField(element);
    if (!identification) continue;

    const { mappedKey, confidence } = identification;

    // Resolve value using the mapping function (handles flat profile structure)
    const value = mapPredictionToValue(mappedKey, profile, resume, {
      visibleLabel: getLabelForElement(element),
      placeholder: 'placeholder' in element ? (element as any).placeholder || '' : '',
      fieldName: element.name || element.id || '',
      ariaLabel: element.getAttribute('aria-label') || '',
    });

    if (!value) continue;

    // Fill the field
    const success = AutofillEngine.injectValue(element, value);
    if (success) {
      HighlightEngine.apply(element, confidence >= 0.85 ? 'AUTO_FILL' : 'APPROVAL');
      processedElements.add(element);
      filledFieldsCount++;
      filledKeys.push(mappedKey);
    }
  }

  const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;

  // Step 4: Set up observer for dynamically loaded fields
  if (domObserver) domObserver.stop();
  domObserver = new DynamicDOMObserver(async (newFields) => {
    if (!isContextValid() || !activeProfileData) return;
    for (const field of newFields) {
      const el = field.element;
      if (processedElements.has(el)) continue;
      const id = identifyField(el as any);
      if (!id) continue;
      const val = mapPredictionToValue(id.mappedKey, activeProfileData, activeResumeData, {
        visibleLabel: field.metadata.visibleLabel,
        placeholder: field.metadata.placeholder,
        fieldName: field.metadata.fieldName,
        ariaLabel: field.metadata.ariaLabel,
      });
      if (val && AutofillEngine.injectValue(el, val)) {
        HighlightEngine.apply(el, 'AUTO_FILL');
        processedElements.add(el);
      }
    }
  });
  const scannedFields = scanDomForFields();
  domObserver.markProcessed(scannedFields.map(f => f.element));
  domObserver.start();

  return {
    success: filledFieldsCount > 0,
    totalFields,
    filledFieldsCount,
    filledKeys,
    executionTimeMs,
  };
}

// Register the message listener using the safe wrapper
safeAddMessageListener((message, _sender, sendResponse) => {
  if (message.action === 'PING') {
    sendResponse({ alive: true });
    return false;
  }

  if (message.action === 'EXECUTE_AUTOFILL') {
    executeDirectAutofill(message.profile, message.resume)
      .then((report) => sendResponse({ success: true, report }))
      .catch((error) => {
        console.error('[CareerHub] Autofill error:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // keep channel open for async response
  }
  return false;
});
