import type { CompletedSet, RepSessionSink } from './contracts';

const STORAGE_KEY = 'rep-counter:sets';

/**
 * Standalone persistence: appends completed sets to localStorage. FitTrack swaps
 * this out for an API / IndexedDB write-queue impl of the same `RepSessionSink`.
 */
export function createLocalStorageSink(key: string = STORAGE_KEY): RepSessionSink {
  return {
    saveSet(set: CompletedSet): void {
      try {
        const raw = localStorage.getItem(key);
        const existing: CompletedSet[] = raw ? JSON.parse(raw) : [];
        existing.push(set);
        localStorage.setItem(key, JSON.stringify(existing));
      } catch {
        // Storage may be unavailable (private mode / quota). Persistence is
        // best-effort for the standalone demo, so swallow rather than crash.
      }
    },
  };
}

export function readSavedSets(key: string = STORAGE_KEY): CompletedSet[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as CompletedSet[]) : [];
  } catch {
    return [];
  }
}
