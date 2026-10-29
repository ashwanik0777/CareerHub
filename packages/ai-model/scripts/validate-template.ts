import { readFileSync, existsSync } from 'fs';
import { modelLoader } from '../src/loader/modelLoader';
import { softmax } from '../src/predict/predict';
import {
  buildTextInput,
  configureTextBuilder,
  TextBuilderOptions,
} from '../src/preprocessing/textBuilder';
import { MODEL_CLASSES } from '../src/labels';
import { AiFieldDescriptor } from '@platform/validation';

interface DatasetRecord {
  visibleLabel: string | null;
  placeholder: string | null;
  fieldName: string | null;
  fieldType: string;
  ariaLabel: string | null;
  nearbyText: string | null;
  sectionHeading: string | null;
  pageTitle: string;
  portalDomain: string;
  semanticLabel: string;
}

const DATASET_PATH =
  process.env.AI_DATASET_PATH ||
  '/Users/ashwanikushwaha/dataCollector/dataset/exports/clean_dataset.jsonl';
const GATE_MIN = 0.38;
const GATE_MAX = 0.47;
const BATCH_SIZE = 32;

function loadDataset(datasetPath: string): DatasetRecord[] {
  if (!existsSync(datasetPath)) {
    throw new Error(`Dataset file not found at ${datasetPath}`);
  }

  const records: DatasetRecord[] = [];
  for (const line of readFileSync(datasetPath, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    try {
      records.push(JSON.parse(line));
    } catch {
      console.warn('Skipping invalid JSON line');
    }
  }
  return records;
}

function toField(record: DatasetRecord): AiFieldDescriptor {
  return {
    visibleLabel: record.visibleLabel || '',
    placeholder: record.placeholder || '',
    fieldName: record.fieldName || '',
    fieldType: record.fieldType || '',
    ariaLabel: record.ariaLabel || '',
    nearbyText: record.nearbyText || '',
    sectionHeading: record.sectionHeading || '',
    pageTitle: record.pageTitle || '',
    portalDomain: record.portalDomain || '',
  };
}

function calculateMetrics(
  predictions: string[],
  groundTruths: string[]
): { macroF1: number; accuracy: number } {
  const stats: Record<string, { tp: number; fp: number; fn: number }> = {};
  for (const label of MODEL_CLASSES) {
    stats[label] = { tp: 0, fp: 0, fn: 0 };
  }

  let correct = 0;
  for (let i = 0; i < predictions.length; i++) {
    const pred = predictions[i]!;
    const gt = groundTruths[i]!;
    if (pred === gt) {
      correct++;
      stats[gt] && stats[gt].tp++;
    } else {
      stats[pred] && stats[pred].fp++;
      stats[gt] && stats[gt].fn++;
    }
  }

  let totalF1 = 0;
  for (const label of MODEL_CLASSES) {
    const s = stats[label]!;
    const precision = s.tp + s.fp > 0 ? s.tp / (s.tp + s.fp) : 0;
    const recall = s.tp + s.fn > 0 ? s.tp / (s.tp + s.fn) : 0;
    totalF1 += precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
  }

  return {
    macroF1: totalF1 / MODEL_CLASSES.length,
    accuracy: predictions.length > 0 ? correct / predictions.length : 0,
  };
}

/**
 * Runs argmax classification for every record under the given template options,
 * going through the SAME buildTextInput path used at runtime (incl. sanitize).
 * Raw model classes are compared, bypassing the ontology collapse in ranking.
 */
async function evaluateConfig(
  records: DatasetRecord[],
  options: TextBuilderOptions,
  tokenizer: any,
  model: any
): Promise<{ macroF1: number; accuracy: number }> {
  configureTextBuilder(options);

  const preds: string[] = [];
  const gts: string[] = [];

  for (let start = 0; start < records.length; start += BATCH_SIZE) {
    const batch = records.slice(start, start + BATCH_SIZE);
    const texts = batch.map((r) => buildTextInput(toField(r)));

    const inputs = await tokenizer(texts, {
      padding: true,
      truncation: true,
      max_length: 128,
    });
    const outputs = await model(inputs);
    const flatLogits = outputs.logits.data as Float32Array;
    const numClasses = MODEL_CLASSES.length;

    for (let i = 0; i < batch.length; i++) {
      const logits = Array.from(flatLogits.slice(i * numClasses, (i + 1) * numClasses));
      const probs = softmax(logits);

      let argmaxIdx = 0;
      for (let idx = 1; idx < probs.length; idx++) {
        if (probs[idx]! > probs[argmaxIdx]!) argmaxIdx = idx;
      }

      preds.push(MODEL_CLASSES[argmaxIdx]!);
      gts.push(batch[i]!.semanticLabel);
    }
  }

  return calculateMetrics(preds, gts);
}

async function main() {
  console.log('--- 🛡️ Preprocessing Template Validation Gate ---');

  const allRecords = loadDataset(DATASET_PATH);
  console.log(`Loaded ${allRecords.length} dataset records.`);

  // All non-miscellaneous records plus a sample of miscellaneous ones,
  // to keep runtime bounded while still exercising every minority class.
  const nonMisc = allRecords.filter((r) => r.semanticLabel !== 'miscellaneous');
  const miscSample = allRecords.filter((r) => r.semanticLabel === 'miscellaneous').slice(0, 100);
  const evalDataset = [...nonMisc, ...miscSample];
  console.log(
    `Evaluating on ${evalDataset.length} records (${nonMisc.length} non-misc, ${miscSample.length} misc).`
  );

  const { tokenizer, model } = await modelLoader.load();

  const separatorOptions = [' | ', '\n', ' [SEP] '];
  const nullPolicyOptions: TextBuilderOptions['nullPolicy'][] = ['skip', 'none_str', 'empty'];
  const styleOptions: TextBuilderOptions['style'][] = ['prefix', 'raw'];

  let bestOptions: TextBuilderOptions | null = null;
  let bestMacroF1 = -1;
  let bestAccuracy = 0;

  console.log('\nSearching for the trained template configuration...');
  for (const separator of separatorOptions) {
    for (const nullPolicy of nullPolicyOptions) {
      for (const style of styleOptions) {
        const options: TextBuilderOptions = { separator, nullPolicy, style };
        const { macroF1, accuracy } = await evaluateConfig(evalDataset, options, tokenizer, model);

        console.log(
          `Separator: ${JSON.stringify(separator).padEnd(9)} | Null: ${nullPolicy.padEnd(8)} | ` +
            `Style: ${style.padEnd(6)} => Macro-F1: ${macroF1.toFixed(4)} | Acc: ${accuracy.toFixed(4)}`
        );

        if (macroF1 > bestMacroF1) {
          bestMacroF1 = macroF1;
          bestAccuracy = accuracy;
          bestOptions = options;
        }
      }
    }
  }

  if (!bestOptions) {
    console.error('❌ FAILURE: No valid configuration found.');
    process.exit(1);
  }

  console.log('\n=============================================');
  console.log('🏆 BEST TEMPLATE CONFIGURATION FOUND:');
  console.log(`  Separator:   ${JSON.stringify(bestOptions.separator)}`);
  console.log(`  Null Policy: ${bestOptions.nullPolicy}`);
  console.log(`  Style:       ${bestOptions.style}`);
  console.log(`  Macro-F1:    ${bestMacroF1.toFixed(4)}`);
  console.log(`  Accuracy:    ${bestAccuracy.toFixed(4)}`);
  console.log('=============================================');
  console.log(
    'If this differs from activeOptions in src/preprocessing/textBuilder.ts, update it there.'
  );

  if (bestMacroF1 >= GATE_MIN && bestMacroF1 <= GATE_MAX) {
    console.log(
      `✅ SUCCESS: Macro-F1 ${bestMacroF1.toFixed(4)} is within the target range [${GATE_MIN}, ${GATE_MAX}].`
    );
    process.exit(0);
  }

  console.error(
    `❌ GATE FAILED: Macro-F1 ${bestMacroF1.toFixed(4)} is outside [${GATE_MIN}, ${GATE_MAX}]. ` +
      'The training template was not reproduced; predictions must stay confidence-gated ' +
      'with the semantic-engine fallback as primary.'
  );
  process.exit(1);
}

main().catch((error) => {
  console.error('❌ Template validation harness error:', error);
  process.exit(1);
});
