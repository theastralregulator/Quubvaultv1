'use client';

import { useMemo, DependencyList } from 'react';

/**
 * A specialized version of useMemo for Firebase references and queries.
 * Ensures the reference is stable unless dependencies change.
 */
export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
}
