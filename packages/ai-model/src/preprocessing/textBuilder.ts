import { AiFieldDescriptor } from '@platform/validation';
import { sanitizeText } from './sanitize';

export type NullPolicy = 'skip' | 'none_str' | 'empty';
export type TemplateStyle = 'prefix' | 'raw';

export interface TextBuilderOptions {
  separator: string;
  nullPolicy: NullPolicy;
  style: TemplateStyle;
}

/**
 * Best configuration found by exhaustive grid search over the validation split.
 * 
 * NOTE: The original training notebook (Colab) that produced the fine-tuned model
 * is not available, so the exact text template used during training cannot be
 * reproduced. This configuration was selected as the empirical best across
 * 18 combinations of separator × nullPolicy × style, achieving macro-F1 ≈ 0.27
 * on a 20% stratified validation split (seed=42).
 * 
 * The model's reported training F1 of 0.423 was computed on the training
 * validation split with the original (unknown) template. The ONNX export has been
 * verified to produce identical argmax predictions to the PyTorch source model.
 */
export let activeOptions: TextBuilderOptions = {
  separator: '\n',
  nullPolicy: 'empty',
  style: 'prefix',
};

/**
 * Configure the global options for text generation.
 */
export function configureTextBuilder(options: Partial<TextBuilderOptions>): void {
  activeOptions = { ...activeOptions, ...options };
}

/**
 * Formats a field descriptor into the model input text.
 */
export function buildTextInput(field: AiFieldDescriptor, options = activeOptions): string {
  const fields = [
    { key: 'Label', val: sanitizeText(field.visibleLabel) },
    { key: 'Placeholder', val: sanitizeText(field.placeholder) },
    { key: 'FieldName', val: sanitizeText(field.fieldName) },
    { key: 'Nearby', val: sanitizeText(field.nearbyText) },
    { key: 'Section', val: sanitizeText(field.sectionHeading) },
    { key: 'Aria', val: sanitizeText(field.ariaLabel) },
    { key: 'Type', val: sanitizeText(field.fieldType) },
  ];

  const parts: string[] = [];

  for (const f of fields) {
    const isNull = f.val === '';

    if (isNull) {
      if (options.nullPolicy === 'skip') {
        continue;
      } else if (options.nullPolicy === 'none_str') {
        if (options.style === 'prefix') {
          parts.push(`${f.key}: None`);
        } else {
          parts.push('None');
        }
      } else if (options.nullPolicy === 'empty') {
        if (options.style === 'prefix') {
          parts.push(`${f.key}: `);
        } else {
          parts.push('');
        }
      }
    } else {
      if (options.style === 'prefix') {
        parts.push(`${f.key}: ${f.val}`);
      } else {
        parts.push(f.val);
      }
    }
  }

  return parts.join(options.separator);
}
