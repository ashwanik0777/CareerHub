/**
 * Dataset Builder
 * Converts historical quality-scored data into AI-ready JSONL/CSV formats for background downloads.
 */

import { DatasetSample } from '../dataset/datasetQueues';

export class DatasetBuilder {
  static generateJsonl(samples: DatasetSample[]): string {
    return samples.map(s => JSON.stringify({
      text: `[FIELD] ${s.metadata.visibleLabel} [NEARBY] ${s.metadata.nearbyText} [PLACEHOLDER] ${s.metadata.placeholder}`,
      label: s.aiPrediction.label
    })).join('\n');
  }

  static generateCsv(samples: DatasetSample[]): string {
    const header = 'VisibleLabel,Placeholder,NearbyText,Label\n';
    const rows = samples.map(s => {
      const label = `"${(s.metadata.visibleLabel || '').replace(/"/g, '""')}"`;
      const placeholder = `"${(s.metadata.placeholder || '').replace(/"/g, '""')}"`;
      const nearby = `"${(s.metadata.nearbyText || '').replace(/"/g, '""')}"`;
      return `${label},${placeholder},${nearby},${s.aiPrediction.label}`;
    }).join('\n');
    return header + rows;
  }
}
