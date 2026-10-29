/**
 * Field Highlight Engine
 * Applies visual cues to fields based on confidence levels.
 */

export function highlightField(element: HTMLElement, level: 'HIGH' | 'MEDIUM' | 'LOW') {
  const borderColors: Record<string, string> = {
    HIGH: '2px solid rgba(34, 197, 94, 0.8)',    // Green for autofill
    MEDIUM: '2px solid rgba(245, 158, 11, 0.8)',  // Yellow for ask
    LOW: '2px solid rgba(239, 68, 68, 0.8)',      // Red for manual
  };
  
  const bgColors: Record<string, string> = {
    HIGH: 'rgba(34, 197, 94, 0.05)',
    MEDIUM: 'rgba(245, 158, 11, 0.05)',
    LOW: 'rgba(239, 68, 68, 0.05)',
  };

  element.style.outline = borderColors[level] || '';
  element.style.backgroundColor = bgColors[level] || '';
  element.style.transition = 'outline 0.3s ease, background-color 0.3s ease';

  // Attach a data attribute for feedback engine
  element.setAttribute('data-careerhub-confidence', level);
}
