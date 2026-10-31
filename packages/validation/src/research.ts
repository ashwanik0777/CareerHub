import { z } from 'zod';
import { httpUrl, queryInt } from './common';

const shortText = (max: number) => z.string().trim().max(max);
const optShortText = (max: number) => shortText(max).nullable().optional();
const count = z.number().int().min(0).max(100_000).default(0);
const ratio = z.number().min(0).max(1).default(0);

/** Up to 64 KB of JSON for free-form details. */
const boundedJson = z
  .unknown()
  .refine((v) => JSON.stringify(v ?? null).length <= 64 * 1024, 'Payload too large (64KB max)');

export const telemetrySchema = z.object({
  platform: shortText(100).min(1, 'Required'),
  pageUrl: httpUrl('pageUrl must be a valid http(s) URL'),
  totalFields: count,
  detectedFields: count,
  filledFields: count,
  skippedFields: count,
  userCorrections: count,
  highConfidence: count,
  mediumConfidence: count,
  lowConfidence: count,
  avgConfidence: ratio,
  executionTimeMs: z.number().int().min(0).max(3_600_000).default(0),
  mappingDetails: boundedJson.nullable().optional(),
});

export const datasetEntrySchema = z.object({
  platform: shortText(100).min(1, 'Required'),
  pageUrl: httpUrl('pageUrl must be a valid http(s) URL'),
  pageType: shortText(50).default('application'),
  fieldName: shortText(300).min(1, 'Required'),
  fieldId: optShortText(300),
  fieldLabel: optShortText(300),
  fieldPlaceholder: optShortText(300),
  fieldType: shortText(50).min(1, 'Required'),
  inputType: optShortText(50),
  ariaLabel: optShortText(300),
  nearbyHeading: optShortText(300),
  parentSection: optShortText(300),
  domHierarchy: optShortText(2000),
  validationRules: optShortText(2000),
  semanticCategory: optShortText(100),
  ontologyAttributeId: optShortText(100),
  isVerified: z.boolean().default(false),
});

export const experimentRunSchema = z.object({
  name: shortText(200).min(1, 'Required'),
  description: optShortText(2000),
  strategy: shortText(100).min(1, 'Required'),
  datasetSize: count,
  accuracy: ratio,
  precision: ratio,
  recall: ratio,
  f1Score: ratio,
  avgInferenceMs: z.number().min(0).max(3_600_000).default(0),
  configuration: boundedJson.nullable().optional(),
  results: boundedJson.nullable().optional(),
});

/** Shared pagination query params. */
export const paginationQuerySchema = z.object({
  limit: queryInt(50, 200),
  offset: queryInt(0, 1_000_000),
});

export type TelemetryInput = z.infer<typeof telemetrySchema>;
export type DatasetEntryInput = z.infer<typeof datasetEntrySchema>;
export type ExperimentRunInput = z.infer<typeof experimentRunSchema>;
