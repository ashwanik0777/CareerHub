/**
 * Dataset Builder
 * Converts historical quality-scored data into AI-ready JSONL/CSV formats for background downloads.
 */
import { DatasetSample } from '../dataset/datasetQueues';
export declare class DatasetBuilder {
    static generateJsonl(samples: DatasetSample[]): string;
    static generateCsv(samples: DatasetSample[]): string;
}
//# sourceMappingURL=datasetBuilder.d.ts.map