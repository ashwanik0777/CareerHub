/**
 * String Normalizer
 * Cleans up strings, handles whitespace, casing, and basic deduplication.
 */

export class StringNormalizer {
  static clean(value: string | null | undefined): string | null {
    if (!value) return null;
    const cleaned = value.replace(/\s+/g, ' ').trim();
    return cleaned.length > 0 ? cleaned : null;
  }

  static toTitleCase(value: string | null | undefined): string | null {
    const cleaned = this.clean(value);
    if (!cleaned) return null;

    return cleaned.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  static toLowerCase(value: string | null | undefined): string | null {
    const cleaned = this.clean(value);
    return cleaned ? cleaned.toLowerCase() : null;
  }
}
