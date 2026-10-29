import { ProfessionalProfile } from '../schema/professionalProfile';
import { SemanticMapper } from '../mapper/semanticMapper';
import { ProfileCompleteness } from '../confidence/profileCompleteness';
import { profileCache } from '../utils/cache';

/**
 * Profile Service
 * Main API surface for interacting with professional profiles.
 */

export class ProfileService {
  /**
   * Caches a profile in memory.
   */
  static cacheProfile(profile: ProfessionalProfile): void {
    profileCache.set(profile.userId, profile);
  }

  /**
   * Resolves a single field from a profile based on a semantic AI label.
   */
  static resolveField(userId: string, semanticLabel: string): string | null {
    const profile = profileCache.get(userId) as ProfessionalProfile | null;
    if (!profile) return null;

    return SemanticMapper.resolve(semanticLabel, profile);
  }

  /**
   * Resolves multiple fields in a batch.
   */
  static resolveMultipleFields(userId: string, semanticLabels: string[]): Record<string, string | null> {
    const profile = profileCache.get(userId) as ProfessionalProfile | null;
    if (!profile) {
      return semanticLabels.reduce((acc, label) => {
        acc[label] = null;
        return acc;
      }, {} as Record<string, string | null>);
    }

    const results: Record<string, string | null> = {};
    for (const label of semanticLabels) {
      results[label] = SemanticMapper.resolve(label, profile);
    }
    return results;
  }

  /**
   * Calculates completeness metrics for a user's profile.
   */
  static getCompleteness(userId: string): Record<string, number> | null {
    const profile = profileCache.get(userId) as ProfessionalProfile | null;
    if (!profile) return null;

    return ProfileCompleteness.calculate(profile);
  }
}
