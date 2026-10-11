import { useSyncExternalStore } from 'react';

// Mock data lives in module arrays; this bumps a version so hooks re-render after a mutation.
// Remove it once reports/cases come from the API.
let version = 0;
const listeners = new Set<() => void>();

/** Tells the subscribed hooks that the mock data changed */
export const notify = () => {
  version++;
  listeners.forEach((l) => l());
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

/**
 * Re-renders the component each time the mock data changes
 *
 * @returns The current version number
 */
export const useStoreVersion = () => useSyncExternalStore(subscribe, () => version);
