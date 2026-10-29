/**
 * Approval Engine
 * Renders the Shadow DOM popup for user review on Medium Confidence fields.
 */
import { DatasetSample } from '../dataset/datasetQueues';
export declare class ApprovalEngine {
    private static container;
    private static shadowRoot;
    private static activePopup;
    static init(): void;
    static show(targetElement: HTMLElement, sampleData: Omit<DatasetSample, 'id' | 'timestamp' | 'qualityScore' | 'userAction'>, suggestedValue: string, onApprove: (finalValue: string) => void, onReject: () => void): void;
}
//# sourceMappingURL=approvalEngine.d.ts.map