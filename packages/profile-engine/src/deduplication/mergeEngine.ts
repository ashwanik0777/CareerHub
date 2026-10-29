import { ProfessionalProfile } from '../schema/professionalProfile';
import { DuplicateChecker } from './duplicateChecker';

/**
 * Merge Engine
 * Intelligently merges data from multiple sources into a single pristine profile.
 */

export class MergeEngine {
  static mergeProfiles(base: ProfessionalProfile, incoming: Partial<ProfessionalProfile>): ProfessionalProfile {
    const merged: ProfessionalProfile = { ...base };

    // Merge Personal
    if (incoming.personal) {
      merged.personal = { ...base.personal, ...incoming.personal };
    }

    // Merge Contact
    if (incoming.contact) {
      merged.contact = { ...base.contact, ...incoming.contact };
    }

    // Merge Education with Deduplication
    if (incoming.education) {
      const combinedEd = [...(base.education || []), ...incoming.education];
      merged.education = DuplicateChecker.deduplicateArray(combinedEd, DuplicateChecker.areEducationsDuplicate);
    }

    // Merge Experience with Deduplication
    if (incoming.experience) {
      const combinedExp = [...(base.experience || []), ...incoming.experience];
      merged.experience = DuplicateChecker.deduplicateArray(combinedExp, DuplicateChecker.areExperiencesDuplicate);
    }

    // Merge Skills
    if (incoming.skills) {
      const existingSkillNames = new Set((base.skills || []).map(s => s.name.toLowerCase()));
      const newSkills = incoming.skills.filter(s => !existingSkillNames.has(s.name.toLowerCase()));
      merged.skills = [...(base.skills || []), ...newSkills];
    }

    return merged;
  }
}
