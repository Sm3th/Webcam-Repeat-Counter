import { useEffect, useState } from 'react';

export interface Prefs {
  modelType: 'lightning' | 'thunder';
  sound: boolean;
  voice: boolean;
  restSeconds: number;
}

const KEY = 'rep-counter:prefs';

const DEFAULTS: Prefs = {
  modelType: 'lightning',
  sound: true,
  voice: false,
  restSeconds: 0,
};

function load(): Prefs {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Prefs>) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

/** User preferences for the standalone host, persisted to localStorage. */
export function usePrefs(): [Prefs, (patch: Partial<Prefs>) => void] {
  const [prefs, setPrefs] = useState<Prefs>(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(prefs));
    } catch {
      /* storage unavailable — preferences just won't persist */
    }
  }, [prefs]);

  return [prefs, (patch) => setPrefs((p) => ({ ...p, ...patch }))];
}
