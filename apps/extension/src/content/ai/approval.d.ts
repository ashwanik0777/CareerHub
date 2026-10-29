/**
 * Shadow DOM Approval Popup
 * Injects a professional UI near medium confidence fields.
 */
export declare class ApprovalPopup {
    private static container;
    private static shadowRoot;
    static init(): void;
    static show(targetElement: HTMLElement, predictedLabel: string, confidence: number, suggestedValue: string, onApprove: () => void, onReject: () => void): void;
}
//# sourceMappingURL=approval.d.ts.map