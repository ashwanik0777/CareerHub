/**
 * Highlight Engine
 * Briefly animates and borders fields so the user understands the AI action.
 */

export class HighlightEngine {
  static apply(element: HTMLElement, mode: 'AUTO_FILL' | 'APPROVAL' | 'MANUAL') {
    const borderColors = {
      AUTO_FILL: '2px solid rgba(34, 197, 94, 0.9)',    // Green
      APPROVAL: '2px solid rgba(245, 158, 11, 0.9)',  // Yellow
      MANUAL: '2px solid rgba(239, 68, 68, 0.9)',      // Red
    };
    
    const bgColors = {
      AUTO_FILL: 'rgba(34, 197, 94, 0.1)',
      APPROVAL: 'rgba(245, 158, 11, 0.1)',
      MANUAL: 'rgba(239, 68, 68, 0.1)',
    };

    const originalBg = element.style.backgroundColor;

    element.style.transition = 'outline 0.3s ease, background-color 0.3s ease';
    element.style.outline = borderColors[mode];
    element.style.backgroundColor = bgColors[mode];

    // For Auto-filled fields, fade out the background after a short delay, but keep a subtle border
    if (mode === 'AUTO_FILL') {
      setTimeout(() => {
        element.style.backgroundColor = originalBg;
        element.style.outline = '1px solid rgba(34, 197, 94, 0.4)';
      }, 1500);
    }
  }

  static clear(element: HTMLElement) {
    element.style.outline = '';
    element.style.backgroundColor = '';
  }
}
