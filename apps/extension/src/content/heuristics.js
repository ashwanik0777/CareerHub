import { querySelectorAllDeep } from './dom/shadowdom';
// Keywords for heuristic matching — exported for reuse by semantic engine
export const FIELD_KEYWORDS = {
    'personalInfo.firstName': [
        /first\s*name/i,
        /given\s*name/i,
        /forename/i,
        /^fname$/i,
        /^first$/i,
    ],
    'personalInfo.lastName': [
        /last\s*name/i,
        /family\s*name/i,
        /surname/i,
        /^lname$/i,
        /^last$/i,
    ],
    'name': [
        /^name$/i,
        /full\s*name/i,
        /candidate\s*name/i,
        /applicant\s*name/i,
        /your\s*name/i,
    ],
    'email': [
        /email/i,
        /e-mail/i,
        /mail\s*address/i,
        /e_mail/i,
    ],
    'personalInfo.phone': [
        /phone/i,
        /telephone/i,
        /mobile/i,
        /cell/i,
        /contact\s*number/i,
        /whatsapp/i,
        /phone\s*number/i,
        /mob\s*no/i,
    ],
    'personalInfo.headline': [
        /headline/i,
        /tagline/i,
        /professional\s*title/i,
        /current\s*designation/i,
        /job\s*title/i,
        /designation/i,
        /current\s*role/i,
    ],
    'personalInfo.bio': [
        /summary/i,
        /biography/i,
        /about\s*me/i,
        /cover\s*letter/i,
        /about\s*yourself/i,
        /describe\s*yourself/i,
        /objective/i,
        /profile\s*summary/i,
        /career\s*objective/i,
        /why\s*should\s*we\s*hire/i,
    ],
    'personalInfo.location': [
        /location/i,
        /city/i,
        /address/i,
        /residence/i,
        /current\s*city/i,
        /hometown/i,
        /current\s*location/i,
        /preferred\s*location/i,
    ],
    'identity.gender': [
        /gender/i,
        /sex/i,
    ],
    'linkedinUrl': [
        /linkedin/i,
        /lnkd/i,
        /linkedin\s*profile/i,
        /linkedin\s*url/i,
    ],
    'githubUrl': [
        /\bgithub\b/i,
        /github\s*url/i,
        /github\s*profile/i,
        /github\s*username/i,
        /github\s*link/i,
    ],
    'websiteUrl': [
        /portfolio/i,
        /website/i,
        /personal\s*site/i,
        /homepage/i,
        /blog/i,
        /personal\s*url/i,
    ],
    'twitterUrl': [
        /twitter/i,
        /\bx\.com\b/i,
    ],
    'experience.company': [
        /company/i,
        /organization/i,
        /organisation/i,
        /employer/i,
        /current\s*company/i,
        /company\s*name/i,
        /workplace/i,
    ],
    'experience.position': [
        /position/i,
        /job\s*title/i,
        /role/i,
        /designation/i,
        /current\s*position/i,
        /title/i,
    ],
    'experience.description': [
        /responsibilities/i,
        /job\s*description/i,
        /work\s*description/i,
        /duties/i,
        /describe\s*your\s*role/i,
    ],
    'education.school': [
        /school/i,
        /university/i,
        /college/i,
        /institution/i,
        /institute/i,
        /alma\s*mater/i,
    ],
    'education.degree': [
        /degree/i,
        /qualification/i,
        /education\s*level/i,
        /highest\s*degree/i,
        /graduation/i,
    ],
    'education.fieldOfStudy': [
        /field\s*of\s*study/i,
        /major/i,
        /specialization/i,
        /branch/i,
        /stream/i,
        /course/i,
        /department/i,
    ],
    'education.grade': [
        /grade/i,
        /gpa/i,
        /cgpa/i,
        /percentage/i,
        /marks/i,
        /score/i,
    ],
    'skills.name': [
        /skills/i,
        /key\s*skills/i,
        /technical\s*skills/i,
        /competencies/i,
        /proficiency/i,
        /expertise/i,
    ],
    'preference.salary': [
        /salary/i,
        /expected\s*salary/i,
        /current\s*salary/i,
        /ctc/i,
        /compensation/i,
        /expected\s*ctc/i,
        /annual\s*salary/i,
    ],
    'preference.workAuthorization': [
        /work\s*authorization/i,
        /visa\s*status/i,
        /work\s*permit/i,
        /eligible\s*to\s*work/i,
        /authorized\s*to\s*work/i,
        /notice\s*period/i,
    ],
    'resume_file': [
        /resume/i,
        /cv/i,
        /curriculum/i,
        /upload\s*resume/i,
        /attach\s*resume/i,
    ],
};
function cleanText(text) {
    return text.replace(/\s+/g, ' ').trim();
}
/**
 * Extract the label text for a form element using multiple DOM sources.
 * Exported for reuse by the semantic engine's rule strategy.
 */
export function getLabelForElement(element) {
    let labelText = '';
    // 1. Check if element is nested inside a <label>
    const parentLabel = element.closest('label');
    if (parentLabel) {
        labelText = parentLabel.textContent || '';
    }
    // 2. Check for matching label with 'for' attribute matching element ID
    if (!labelText && element.id) {
        const label = document.querySelector(`label[for="${element.id}"]`);
        if (label) {
            labelText = label.textContent || '';
        }
    }
    // 3. Check aria-label
    if (!labelText) {
        labelText = element.getAttribute('aria-label') || '';
    }
    // 4. Resolve aria-labelledby to referenced element text
    if (!labelText) {
        const ariaLabelledBy = element.getAttribute('aria-labelledby');
        if (ariaLabelledBy) {
            const ids = ariaLabelledBy.split(/\s+/);
            const parts = ids
                .map(id => document.getElementById(id))
                .filter(Boolean)
                .map(el => cleanText(el.textContent || ''));
            labelText = parts.join(' ');
        }
    }
    // 5. Check title attribute
    if (!labelText) {
        labelText = element.getAttribute('title') || '';
    }
    // 6. Check preceding sibling or parent text
    if (!labelText) {
        const sibling = element.previousElementSibling;
        if (sibling && (sibling.tagName === 'LABEL' || sibling.tagName === 'SPAN')) {
            labelText = sibling.textContent || '';
        }
    }
    return cleanText(labelText);
}
export function analyzeFormFields(formElement) {
    const detected = [];
    const inputs = querySelectorAllDeep('input, textarea, select', formElement);
    inputs.forEach((node) => {
        const element = node;
        // Ignore hidden inputs
        if (element.type === 'hidden')
            return;
        const label = getLabelForElement(element);
        const placeholder = 'placeholder' in element ? element.placeholder || '' : '';
        const nameAttr = element.name || '';
        const idAttr = element.id || '';
        // Search matches across all metadata sources
        const searchString = `${label} ${placeholder} ${nameAttr} ${idAttr}`;
        let bestMatchKey = '';
        let maxConfidence = 0;
        // Special check for file upload
        if (element.type === 'file') {
            const resumeKeywords = FIELD_KEYWORDS['resume_file'] || [];
            const isResume = resumeKeywords.some((regex) => regex.test(searchString));
            if (isResume) {
                detected.push({ element, mappedKey: 'resume_file', confidence: 0.9 });
                return;
            }
        }
        // Standard text heuristic matching
        for (const [fieldKey, regexes] of Object.entries(FIELD_KEYWORDS)) {
            if (fieldKey === 'resume_file')
                continue;
            if (!regexes)
                continue;
            for (const regex of regexes) {
                if (regex.test(searchString)) {
                    // Weight confidence based on where the match occurred
                    let confidence = 0.5;
                    if (regex.test(label))
                        confidence = 0.9;
                    else if (regex.test(nameAttr))
                        confidence = 0.8;
                    else if (regex.test(idAttr))
                        confidence = 0.7;
                    else if (regex.test(placeholder))
                        confidence = 0.6;
                    if (confidence > maxConfidence) {
                        maxConfidence = confidence;
                        bestMatchKey = fieldKey;
                    }
                }
            }
        }
        if (bestMatchKey && maxConfidence > 0.4) {
            detected.push({ element, mappedKey: bestMatchKey, confidence: maxConfidence });
        }
    });
    return detected;
}
//# sourceMappingURL=heuristics.js.map