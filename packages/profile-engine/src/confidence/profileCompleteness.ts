import { ProfessionalProfile } from '../schema/professionalProfile';

/**
 * Profile Completeness Calculator
 * Calculates the overall and sectional completeness percentage of a profile.
 */

export class ProfileCompleteness {
  static calculate(profile: ProfessionalProfile): Record<string, number> {
    const scores = {
      personal: 0,
      contact: 0,
      education: 0,
      experience: 0,
      skills: 0,
      overall: 0,
    };

    if (profile.personal) {
      const p = profile.personal;
      const total = 4;
      let filled = 0;
      if (p.firstName) filled++;
      if (p.lastName) filled++;
      if (p.headline) filled++;
      if (p.bio) filled++;
      scores.personal = Math.round((filled / total) * 100);
    }

    if (profile.contact) {
      const c = profile.contact;
      const total = 4;
      let filled = 0;
      if (c.email) filled++;
      if (c.phone) filled++;
      if (c.city) filled++;
      if (c.country) filled++;
      scores.contact = Math.round((filled / total) * 100);
    }

    if (profile.education && profile.education.length > 0) {
      scores.education = 100;
    }

    if (profile.experience && profile.experience.length > 0) {
      scores.experience = 100;
    }

    if (profile.skills && profile.skills.length > 0) {
      scores.skills = 100;
    }

    scores.overall = Math.round(
      (scores.personal + scores.contact + scores.education + scores.experience + scores.skills) / 5
    );

    return scores;
  }
}
