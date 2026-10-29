/**
 * Quality Scorer
 * Classifies the interaction into Gold, Silver, Bronze, or Noise.
 */
import { DatasetSample } from '../dataset/datasetQueues';
export declare class QualityScorer {
    static score(action: DatasetSample['userAction']['action'], confidence: number, edited: boolean): DatasetSample['qualityScore'];
}
//# sourceMappingURL=qualityScorer.d.ts.map