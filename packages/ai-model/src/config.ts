import { existsSync } from 'fs';
import { join } from 'path';

/**
 * Probes candidate paths to resolve the directory of the local CareerHub model.
 */
export function resolveModelDir(): string {
  if (process.env.AI_MODEL_DIR) {
    return process.env.AI_MODEL_DIR;
  }

  // Candidate search locations (supports dev, built apps, and script environments).
  // Next.js runs with cwd = apps/web, so the repo root is two levels up.
  const candidates = [
    join(__dirname, '..', 'model', 'careerhub_production_model'),
    join(__dirname, 'model', 'careerhub_production_model'),
    join(process.cwd(), 'packages', 'ai-model', 'model', 'careerhub_production_model'),
    join(process.cwd(), '..', 'packages', 'ai-model', 'model', 'careerhub_production_model'),
    join(process.cwd(), '..', '..', 'packages', 'ai-model', 'model', 'careerhub_production_model'),
    join(process.cwd(), 'model', 'careerhub_production_model'),
  ];

  for (const c of candidates) {
    if (existsSync(join(c, 'config.json'))) {
      return c;
    }
  }

  throw new Error(
    `[ai-model] Model directory not found. Set AI_MODEL_DIR or place the model at ` +
      `packages/ai-model/model/careerhub_production_model. Probed: ${candidates.join(', ')}`
  );
}

export const MAX_SEQ_LENGTH = 128;
export const HIGH_CONFIDENCE_THRESHOLD = 0.85;
export const MEDIUM_CONFIDENCE_THRESHOLD = 0.60;
export const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
export const CACHE_MAX_ENTRIES = 1000;
