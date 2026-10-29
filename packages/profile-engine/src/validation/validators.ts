/**
 * Field Validators
 * Validates fields according to strict formatting rules.
 */

export class Validators {
  static isEmail(value: string | null | undefined): boolean {
    if (!value) return false;
    // Standard basic email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  static isUrl(value: string | null | undefined): boolean {
    if (!value) return false;
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }

  static isLinkedInUrl(value: string | null | undefined): boolean {
    if (!value) return false;
    return this.isUrl(value) && value.toLowerCase().includes('linkedin.com/in/');
  }

  static isGithubUrl(value: string | null | undefined): boolean {
    if (!value) return false;
    return this.isUrl(value) && value.toLowerCase().includes('github.com/');
  }

  static isPhone(value: string | null | undefined): boolean {
    if (!value) return false;
    // Accepts optional +, numbers, spaces, parens, hyphens. Min 7 digits.
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
    const digitsOnly = value.replace(/\D/g, '');
    return digitsOnly.length >= 7 && phoneRegex.test(value);
  }
}
