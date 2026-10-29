/**
 * Country Normalizer
 * Converts country inputs to standardized ISO codes or full names.
 */

import { StringNormalizer } from './stringNormalizer';

export class CountryNormalizer {
  private static countryMap: Record<string, string> = {
    'us': 'United States',
    'usa': 'United States',
    'united states of america': 'United States',
    'uk': 'United Kingdom',
    'great britain': 'United Kingdom',
    'in': 'India',
    'ca': 'Canada',
    'au': 'Australia',
  };

  static normalize(country: string | null | undefined): string | null {
    const cleaned = StringNormalizer.toLowerCase(country);
    if (!cleaned) return null;

    if (this.countryMap[cleaned]) {
      return this.countryMap[cleaned];
    }

    return StringNormalizer.toTitleCase(country);
  }
}
