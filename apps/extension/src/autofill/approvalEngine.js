/**
 * Approval Engine
 * Renders the Shadow DOM popup for user review on Medium Confidence fields.
 */
import { AutofillEngine } from './autofillEngine';
import { HighlightEngine } from './highlightEngine';
export class ApprovalEngine {
    static container = null;
    static shadowRoot = null;
    static activePopup = null;
    static init() {
        if (this.container)
            return;
        this.container = document.createElement('div');
        this.container.id = 'careerhub-approval-root';
        this.container.style.position = 'absolute';
        this.container.style.zIndex = '2147483647';
        this.container.style.pointerEvents = 'none';
        this.shadowRoot = this.container.attachShadow({ mode: 'closed' });
        document.body.appendChild(this.container);
    }
    static show(targetElement, sampleData, suggestedValue, onApprove, onReject) {
        this.init();
        if (!this.shadowRoot || !this.container)
            return;
        if (this.activePopup) {
            this.activePopup.remove();
        }
        const rect = targetElement.getBoundingClientRect();
        const top = window.scrollY + rect.bottom + 8;
        const left = window.scrollX + rect.left;
        const popup = document.createElement('div');
        this.activePopup = popup;
        popup.style.pointerEvents = 'auto';
        popup.style.position = 'absolute';
        popup.style.top = `${top}px`;
        popup.style.left = `${left}px`;
        popup.style.background = '#ffffff';
        popup.style.border = '1px solid #e2e8f0';
        popup.style.borderRadius = '8px';
        popup.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
        popup.style.padding = '16px';
        popup.style.fontFamily = 'system-ui, -apple-system, sans-serif';
        popup.style.fontSize = '14px';
        popup.style.color = '#0f172a';
        popup.style.width = '320px';
        popup.style.display = 'flex';
        popup.style.flexDirection = 'column';
        popup.style.gap = '12px';
        const pct = Math.round(sampleData.aiPrediction.confidence * 100);
        popup.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">
        <span style="font-weight: 700; font-size: 14px; color: #1e293b;">CareerHub AI</span>
        <span style="background: #fef3c7; color: #b45309; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 700; border: 1px solid #fde68a;">${pct}% Confidence</span>
      </div>
      
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <span style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Predicted Label</span>
        <span style="font-size: 13px; font-weight: 500; color: #334155;">${sampleData.aiPrediction.label}</span>
      </div>

      <div style="display: flex; flex-direction: column; gap: 4px;">
        <span style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Suggested Value</span>
        <input type="text" id="ch-edit-value" value="${suggestedValue}" style="width: 100%; box-sizing: border-box; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 13px; color: #0f172a; outline: none;" />
      </div>

      <div style="display: flex; gap: 8px; margin-top: 4px;">
        <button id="btn-approve" style="flex: 1; background: #2563eb; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 13px; transition: background 0.2s;">Approve</button>
        <button id="btn-reject" style="flex: 1; background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 13px; transition: background 0.2s;">Reject</button>
      </div>
    `;
        popup.querySelector('#btn-approve')?.addEventListener('click', () => {
            const editedValue = popup.querySelector('#ch-edit-value').value;
            AutofillEngine.injectValue(targetElement, editedValue);
            HighlightEngine.apply(targetElement, 'AUTO_FILL');
            onApprove(editedValue);
            popup.remove();
            this.activePopup = null;
        });
        popup.querySelector('#btn-reject')?.addEventListener('click', () => {
            HighlightEngine.apply(targetElement, 'MANUAL');
            onReject();
            popup.remove();
            this.activePopup = null;
        });
        // Hover effects via JS since it's shadow DOM without a stylesheet
        const approveBtn = popup.querySelector('#btn-approve');
        approveBtn.addEventListener('mouseenter', () => approveBtn.style.background = '#1d4ed8');
        approveBtn.addEventListener('mouseleave', () => approveBtn.style.background = '#2563eb');
        const rejectBtn = popup.querySelector('#btn-reject');
        rejectBtn.addEventListener('mouseenter', () => rejectBtn.style.background = '#e2e8f0');
        rejectBtn.addEventListener('mouseleave', () => rejectBtn.style.background = '#f1f5f9');
        this.shadowRoot.appendChild(popup);
    }
}
//# sourceMappingURL=approvalEngine.js.map