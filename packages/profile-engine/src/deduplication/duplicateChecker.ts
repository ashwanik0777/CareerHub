
import { StringNormalizer } from '../normalizer/stringNormalizer';

/**
 * Duplicate Checker
 * Detects if two entities are likely the same using normalization and heuristics.
 */

export class DuplicateChecker {
  static areExperiencesDuplicate(exp1: any, exp2: any): boolean {
    if (!exp1 || !exp2) return false;
    
    const company1 = StringNormalizer.toLowerCase(exp1.companyName);
    const company2 = StringNormalizer.toLowerCase(exp2.companyName);
    const title1 = StringNormalizer.toLowerCase(exp1.title);
    const title2 = StringNormalizer.toLowerCase(exp2.title);

    // If company and title are the same, they're likely duplicates
    if (company1 && company2 && title1 && title2) {
      if (company1 === company2 && title1 === title2) {
        return true;
      }
    }

    return false;
  }

  static areEducationsDuplicate(edu1: any, edu2: any): boolean {
    if (!edu1 || !edu2) return false;

    const school1 = StringNormalizer.toLowerCase(edu1.institutionName);
    const school2 = StringNormalizer.toLowerCase(edu2.institutionName);
    const degree1 = StringNormalizer.toLowerCase(edu1.degree);
    const degree2 = StringNormalizer.toLowerCase(edu2.degree);

    if (school1 && school2 && school1 === school2) {
      if (degree1 === degree2) {
        return true;
      }
    }

    return false;
  }

  static deduplicateArray<T>(arr: T[], isDuplicate: (a: T, b: T) => boolean): T[] {
    const result: T[] = [];
    for (const item of arr) {
      const exists = result.find(r => isDuplicate(r, item));
      if (!exists) {
        result.push(item);
      }
    }
    return result;
  }
}
