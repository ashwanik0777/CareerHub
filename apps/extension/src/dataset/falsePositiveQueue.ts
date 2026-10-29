/**
 * False Positive Queue
 * Detects fields that should NEVER be learned from (security tokens, passwords, analytics, etc.)
 */

export class FalsePositiveDetector {
  private static FORBIDDEN_TYPES = new Set(['password', 'hidden', 'color', 'file', 'image', 'reset', 'submit', 'button']);
  private static FORBIDDEN_NAMES = ['csrf', 'token', 'captcha', 'security', 'otp', 'cvv', 'credit', 'card', 'payment', 'stripe', 'tracking', 'analytics'];

  static isFalsePositive(element: HTMLElement, metadata: any): boolean {
    if (element.tagName === 'INPUT') {
      const input = element as HTMLInputElement;
      if (this.FORBIDDEN_TYPES.has(input.type.toLowerCase())) return true;
    }

    const name = (metadata.fieldName || '').toLowerCase();
    const id = (metadata.id || '').toLowerCase();

    for (const forbidden of this.FORBIDDEN_NAMES) {
      if (name.includes(forbidden) || id.includes(forbidden)) return true;
    }

    // Heuristic: If it has display: none or opacity: 0 it might be a honeypot
    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
      return true;
    }

    return false;
  }
}
