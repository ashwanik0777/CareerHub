/**
 * Dataset Builder
 * Converts historical quality-scored data into AI-ready JSONL/CSV formats for background downloads.
 */
export class DatasetBuilder {
    static generateJsonl(samples) {
        return samples.map(s => JSON.stringify({
            text: `[FIELD] ${s.metadata.visibleLabel} [NEARBY] ${s.metadata.nearbyText} [PLACEHOLDER] ${s.metadata.placeholder}`,
            label: s.aiPrediction.label
        })).join('\n');
    }
    static generateCsv(samples) {
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
//# sourceMappingURL=datasetBuilder.js.map