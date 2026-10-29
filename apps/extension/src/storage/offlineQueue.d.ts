/**
 * Offline Queue
 * Queues feedback events when offline and syncs them once online.
 */
export interface OfflineEvent {
    id: string;
    type: 'DATASET_SAMPLE' | 'ANALYTICS_EVENT';
    payload: any;
    timestamp: number;
}
export declare class OfflineQueue {
    private static KEY;
    static getQueue(): Promise<OfflineEvent[]>;
    static enqueue(event: Omit<OfflineEvent, 'id' | 'timestamp'>): Promise<void>;
    static dequeueBatch(limit?: number): Promise<OfflineEvent[]>;
    static clear(): Promise<void>;
}
//# sourceMappingURL=offlineQueue.d.ts.map