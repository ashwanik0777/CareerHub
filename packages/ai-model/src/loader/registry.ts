import fs from 'fs';
import path from 'path';
import { resolveModelDir } from '../config';

export interface ModelMetadata {
  version: string;
  checksum: string;
  loadedAt: number;
  isActive: boolean;
}

const UPDATE_CHECK_INTERVAL_MS = 30_000;

export class ModelRegistry {
  private versions = new Map<string, ModelMetadata>();
  private activeVersion: string | null = null;
  private basePath: string;
  private lastCheckAt = 0;

  constructor() {
    // Never throw at import time: a missing model dir must degrade to the
    // fallback engine, not crash every module that imports this package.
    try {
      this.basePath = resolveModelDir();
    } catch {
      this.basePath = '';
    }
    this.scanVersions();
  }

  private scanVersions() {
    if (!this.basePath || !fs.existsSync(this.basePath)) return;
    
    // Check if the base path itself is the model dir or if it contains version subdirs
    const isModelDir = fs.existsSync(path.join(this.basePath, 'config.json'));
    
    if (isModelDir) {
      const stat = fs.statSync(path.join(this.basePath, 'config.json'));
      const version = `v_${stat.mtimeMs}`;
      this.versions.set(version, {
        version,
        checksum: 'local_hash',
        loadedAt: Date.now(),
        isActive: true
      });
      this.activeVersion = version;
    }
  }

  getActiveVersion(): ModelMetadata | null {
    if (!this.activeVersion) return null;
    return this.versions.get(this.activeVersion) || null;
  }

  getAllVersions(): ModelMetadata[] {
    return Array.from(this.versions.values());
  }

  /**
   * Returns true when the on-disk model changed since the active version was recorded.
   * Throttled to one filesystem stat per UPDATE_CHECK_INTERVAL_MS so the check is
   * safe to call on the request hot path.
   */
  checkForUpdates(): boolean {
    const now = Date.now();
    if (now - this.lastCheckAt < UPDATE_CHECK_INTERVAL_MS) return false;
    this.lastCheckAt = now;

    if (!this.basePath || !fs.existsSync(this.basePath)) return false;
    const isModelDir = fs.existsSync(path.join(this.basePath, 'config.json'));
    if (isModelDir) {
      const stat = fs.statSync(path.join(this.basePath, 'config.json'));
      const latestVersion = `v_${stat.mtimeMs}`;
      if (this.activeVersion !== latestVersion) {
        // Hot reload needed
        return true;
      }
    }
    return false;
  }

  /**
   * Records the on-disk version as active. Must be called after a hot reload is
   * handled, otherwise checkForUpdates() keeps reporting the same change and the
   * loader would evict and reload the model on every request.
   */
  acknowledgeUpdate(): void {
    this.versions.clear();
    this.activeVersion = null;
    this.scanVersions();
  }
}

export const modelRegistry = new ModelRegistry();
