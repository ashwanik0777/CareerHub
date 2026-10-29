/**
 * Shadow DOM Approval Popup
 * Injects a professional UI near medium confidence fields.
 */

import { autofillElement } from './autofill';
import { highlightField } from './highlight';
import { FeedbackEngine } from './feedback';

export class ApprovalPopup {
  private static container: HTMLElement | null = null;
  private static shadowRoot: ShadowRoot | null = null;

  static init() {
    if (this.container) return;

    this.container = document.createElement('div');
    this.container.id = 'careerhub-approval-root';
    this.container.style.position = 'absolute';
    this.container.style.zIndex = '2147483647'; // Max z-index
    this.container.style.pointerEvents = 'none'; // Click through wrapper
    
    this.shadowRoot = this.container.attachShadow({ mode: 'closed' });
    document.body.appendChild(this.container);
  }

  static show(
    targetElement: HTMLElement, 
    predictedLabel: string, 
    confidence: number, 
    suggestedValue: string,
    onApprove: () => void,
    onReject: () => void
  ) {
    this.init();
    if (!this.shadowRoot || !this.container) return;

    // Calculate position
    const rect = targetElement.getBoundingClientRect();
    const top = window.scrollY + rect.bottom + 8;
    const left = window.scrollX + rect.left;

    const popup = document.createElement('div');
    popup.style.pointerEvents = 'auto'; // Enable clicks on popup
    popup.style.position = 'absolute';
    popup.style.top = `${top}px`;
    popup.style.left = `${left}px`;
    popup.style.background = '#ffffff';
    popup.style.border = '1px solid #e2e8f0';
    popup.style.borderRadius = '8px';
    popup.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
    popup.style.padding = '12px';
    popup.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    popup.style.fontSize = '14px';
    popup.style.color = '#0f172a';
    popup.style.width = 'max-content';
    popup.style.maxWidth = '300px';
    popup.style.display = 'flex';
    popup.style.flexDirection = 'column';
    popup.style.gap = '8px';

    const pct = Math.round(confidence * 100);
    
    popup.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 4px;">
        <span style="font-weight: 600; font-size: 13px;">Auto-detect: ${predictedLabel}</span>
        <span style="background: #fef3c7; color: #d97706; padding: 2px 6px; border-radius: 999px; font-size: 11px; font-weight: 600;">${pct}%</span>
      </div>
      <div style="font-size: 13px; color: #475569; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
        Value: <strong>${suggestedValue}</strong>
      </div>
      <div style="display: flex; gap: 8px; margin-top: 4px;">
        <button id="btn-approve" style="flex: 1; background: #2563eb; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 12px;">Approve</button>
        <button id="btn-reject" style="flex: 1; background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 12px;">Reject</button>
      </div>
    `;

    popup.querySelector('#btn-approve')?.addEventListener('click', () => {
      onApprove();
      autofillElement(targetElement, suggestedValue);
      highlightField(targetElement, 'HIGH');
      FeedbackEngine.recordPositive(predictedLabel, suggestedValue);
      popup.remove();
    });

    popup.querySelector('#btn-reject')?.addEventListener('click', () => {
      onReject();
      highlightField(targetElement, 'LOW');
      FeedbackEngine.recordNegative(predictedLabel, suggestedValue);
      popup.remove();
    });

    this.shadowRoot.appendChild(popup);
    
    // Auto-remove if user clicks outside
    const outsideClickListener = () => {
      popup.remove();
      document.removeEventListener('mousedown', outsideClickListener);
    };
    
    setTimeout(() => {
      document.addEventListener('mousedown', outsideClickListener);
    }, 100);
    
    // Prevent clicks inside popup from triggering outside click
    popup.addEventListener('mousedown', (e) => e.stopPropagation());
  }
}
