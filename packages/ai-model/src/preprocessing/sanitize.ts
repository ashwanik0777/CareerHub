/**
 * Sanitizes input element attributes by stripping HTML tags, resolving standard
 * entities, collapsing whitespace, dropping control characters, and trimming.
 */
export function sanitizeText(text: string | null | undefined): string {
  if (text === null || text === undefined) {
    return '';
  }

  let cleaned = String(text);

  // Strip HTML tags
  cleaned = cleaned.replace(/<\/?[^>]+(>|$)/g, '');

  // Replace common HTML entities
  cleaned = cleaned
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Remove control characters (C0 and C1 ranges)
  cleaned = cleaned.replace(/[\x00-\x1F\x7F-\x9F]/g, '');

  // Collapse whitespace
  cleaned = cleaned.replace(/\s+/g, ' ');

  return cleaned.trim();
}
