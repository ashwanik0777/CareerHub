import { z } from 'zod';

/**
 * Length caps are enforced by truncation, not rejection: real-world pages
 * routinely produce oversized nearbyText/labels, and clipping matches what the
 * model's 128-token window sees anyway. Wrong types still fail with 400, and a
 * hard ceiling (8× the clip) rejects pathological payloads before they are
 * sliced.
 */
const clippedString = (max: number) =>
  z
    .string()
    .max(max * 8)
    .default('')
    .transform((s) => s.slice(0, max));

export const aiFieldDescriptorSchema = z.object({
  visibleLabel: clippedString(300),
  placeholder: clippedString(300),
  fieldName: clippedString(300),
  fieldType: clippedString(50),
  ariaLabel: clippedString(300),
  nearbyText: clippedString(1000),
  sectionHeading: clippedString(300),
  pageTitle: clippedString(300),
  portalDomain: clippedString(253),
});

export const predictRequestSchema = z.object({
  field: aiFieldDescriptorSchema,
});

export const batchPredictRequestSchema = z.object({
  fields: z.array(aiFieldDescriptorSchema).min(1).max(50),
});

export const aiFeedbackSchema = z.object({
  url: clippedString(500),
  predictedClass: clippedString(100),
  elementName: clippedString(300),
  wasCorrected: z.boolean().default(false),
  // Unix epoch ms; anything outside 2000-01-01 … +1 day from now is garbage.
  timestamp: z
    .number()
    .int()
    .min(946684800000)
    .refine((t) => t <= Date.now() + 86_400_000, 'timestamp is in the future')
    .optional(),
});

export type AiFieldDescriptor = z.infer<typeof aiFieldDescriptorSchema>;
export type PredictRequest = z.infer<typeof predictRequestSchema>;
export type BatchPredictRequest = z.infer<typeof batchPredictRequestSchema>;
export type AiFeedback = z.infer<typeof aiFeedbackSchema>;
