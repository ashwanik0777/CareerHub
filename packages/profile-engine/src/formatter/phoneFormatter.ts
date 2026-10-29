/**
 * Phone Formatter
 * Normalizes phone numbers to standard E.164 or desired output formats.
 */

export class PhoneFormatter {
  static normalize(phone: string, defaultCountryCode: string = '+1'): string | null {
    if (!phone) return null;

    // Strip all non-numeric characters except leading +
    let cleaned = phone.replace(/(?!^\+)[^\d]/g, '');
    
    // If it doesn't start with +, assume default country code
    if (!cleaned.startsWith('+')) {
      if (cleaned.length === 10) {
        cleaned = `${defaultCountryCode}${cleaned}`;
      } else if (cleaned.length > 10 && cleaned.startsWith('1')) {
        cleaned = `+${cleaned}`;
      } else {
        // Fallback for unknown formats, just return digits
        return cleaned;
      }
    }

    return cleaned;
  }

  static formatUs(phone: string): string | null {
    const normalized = this.normalize(phone, '');
    if (!normalized) return null;
    
    const digits = normalized.replace(/\D/g, '');
    
    // US Format (XXX) XXX-XXXX
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length === 11 && digits.startsWith('1')) {
      return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    }

    return normalized; // Return as-is if it doesn't fit standard US
  }
}
