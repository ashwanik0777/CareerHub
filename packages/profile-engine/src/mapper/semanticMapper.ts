import { ProfessionalProfile } from '../schema/professionalProfile';
import { PriorityResolver } from './priorityResolver';

export class SemanticMapper {
  /**
   * Resolves a semantic field prediction (e.g., "experience.company_name") 
   * against the structured profile object.
   */
  static resolve(prediction: string, profile: ProfessionalProfile): string | null {
    const parts = prediction.split('.');
    if (parts.length < 2) return null;

    const domain = parts[0];
    const field = parts[1];

    switch (domain) {
      case 'personal':
        if (field === 'first_name') return profile.personal?.firstName || null;
        if (field === 'last_name') return profile.personal?.lastName || null;
        if (field === 'full_name') {
          const first = profile.personal?.firstName || '';
          const last = profile.personal?.lastName || '';
          const full = `${first} ${last}`.trim();
          return full || null;
        }
        break;

      case 'contact':
        if (field === 'email') return profile.contact?.email || null;
        if (field === 'phone_number') return profile.contact?.phone || null;
        if (field === 'address_city') return profile.contact?.city || null;
        if (field === 'address_country') return profile.contact?.country || null;
        if (field === 'address_state') return profile.contact?.state || null;
        if (field === 'address_zip') return profile.contact?.postalCode || null;
        break;

      case 'social':
        if (field === 'github') return profile.social?.github || null;
        if (field === 'linkedin') return profile.social?.linkedin || null;
        if (field === 'portfolio') return profile.social?.portfolio || null;
        if (field === 'twitter') return profile.social?.twitter || null;
        break;

      case 'education': {
        const latestEd = PriorityResolver.getLatestEducation(profile.education);
        if (!latestEd) return null;
        
        if (field === 'college') return latestEd.institutionName || null;
        if (field === 'degree') return latestEd.degree || null;
        if (field === 'major') return latestEd.fieldOfStudy || null;
        if (field === 'gpa') return latestEd.gpa || null;
        break;
      }

      case 'experience': {
        const currentExp = PriorityResolver.getCurrentExperience(profile.experience);
        if (!currentExp) return null;

        if (field === 'company_name') return currentExp.companyName || null;
        if (field === 'title') return currentExp.title || null;
        break;
      }
    }

    return null;
  }
}
