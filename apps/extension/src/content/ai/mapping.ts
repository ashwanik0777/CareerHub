/**
 * AI Prediction to Profile Mapper
 * Resolves a predicted ontology attribute ID (from /api/ai/predict) to the
 * matching value in the /api/profile response shape.
 */

export interface FieldHints {
  visibleLabel?: string;
  placeholder?: string;
  fieldName?: string;
  ariaLabel?: string;
}

function firstWord(value: string): string {
  return value.trim().split(/\s+/)[0] || '';
}

function restWords(value: string): string {
  const parts = value.trim().split(/\s+/);
  return parts.slice(1).join(' ');
}

/**
 * All four address classes collapse to 'personalInfo.location' in the ontology,
 * so the concrete sub-field (city vs state vs zip vs country) is recovered from
 * the field's own label/name keywords.
 */
function resolveLocationValue(profile: any, hints?: FieldHints): string | null {
  const hintText = [hints?.visibleLabel, hints?.placeholder, hints?.fieldName, hints?.ariaLabel]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (/\b(zip|postal|pin\s?code|pincode)\b/.test(hintText)) {
    return profile.addressZip || null;
  }
  if (/\b(city|town|district)\b/.test(hintText)) {
    return profile.addressCity || null;
  }
  if (/\b(state|province|region)\b/.test(hintText)) {
    return profile.addressState || null;
  }
  if (/\b(country|nation)\b/.test(hintText)) {
    return profile.addressCountry || null;
  }

  // Generic "location" field: prefer the free-text location, else city+state
  if (profile.location) return profile.location;
  const parts = [profile.addressCity, profile.addressState].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : null;
}

export function mapPredictionToValue(
  predictedClass: string,
  profileData: any,
  resumeData?: any,
  hints?: FieldHints
): string | null {
  if (!predictedClass || predictedClass === 'miscellaneous' || !profileData) return null;

  const profile = profileData;
  const fullName: string = profile.fullName || '';
  const latestExperience = profile.experiences?.[0];
  const latestEducation = profile.educations?.[0];

  switch (predictedClass) {
    // --- Identity ---
    case 'name':
      return fullName || [profile.firstName, profile.lastName].filter(Boolean).join(' ') || null;
    case 'personalInfo.firstName':
      return profile.firstName || firstWord(fullName) || null;
    case 'personalInfo.lastName':
      return profile.lastName || restWords(fullName) || null;
    case 'identity.gender':
      return profile.gender || null;

    // --- Contact ---
    case 'email':
      return profile.email || null;
    case 'personalInfo.phone':
      return profile.phone || null;
    case 'personalInfo.location':
      return resolveLocationValue(profile, hints);

    // --- Social links ---
    case 'linkedinUrl':
      return profile.linkedinUrl || null;
    case 'githubUrl':
      return profile.githubUrl || null;
    case 'websiteUrl':
      return profile.websiteUrl || null;
    case 'twitterUrl':
      return profile.twitterUrl || null;

    // --- Professional summary ---
    case 'personalInfo.headline':
      return profile.headline || null;
    case 'personalInfo.bio':
      return profile.bio || null;
    case 'personalInfo.preferredLocation':
    case 'preference.remotePreference':
      return profile.preferredLocation || null;
    case 'personalInfo.availability':
      return profile.availability || null;

    // --- Application preferences ---
    case 'preference.salary':
      return profile.expectedSalary || null;
    case 'preference.workAuthorization':
      return profile.workAuthorization || null;

    // --- Latest experience ---
    case 'experience.company':
      return latestExperience?.company || null;
    case 'experience.position':
      return latestExperience?.position || profile.headline || null;
    case 'experience.location':
      return latestExperience?.location || null;
    case 'experience.description':
      return latestExperience?.description || null;

    // --- Latest education ---
    case 'education.school':
      return latestEducation?.school || null;
    case 'education.degree':
      return latestEducation?.degree || null;
    case 'education.fieldOfStudy':
      return latestEducation?.fieldOfStudy || null;
    case 'education.grade':
      return latestEducation?.grade || null;

    // --- Skills ---
    case 'skills.name':
      return profile.skills?.length
        ? profile.skills.map((s: any) => s.name).filter(Boolean).join(', ')
        : null;

    // --- Not fillable via text injection ---
    case 'resume_file':
      return null;

    default: {
      // Generic dot-path fallback against profile, then resume data
      const getValue = (obj: any, path: string): any =>
        path.split('.').reduce((acc, part) => (acc == null ? undefined : acc[part]), obj);
      const val = getValue(profile, predictedClass) ?? getValue(resumeData, predictedClass);
      return val != null && val !== '' ? String(val) : null;
    }
  }
}
