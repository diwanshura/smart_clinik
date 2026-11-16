'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Small data-loading hook: runs `fetcher` on mount and whenever `deps` change,
 * and exposes loading / error state plus a stable `reload` function.
 *
 * - Stale responses (from an older request) are ignored.
 * - `reload({ silent: true })` refreshes in the background without showing the spinner
 *   (used for real-time updates so the screen doesn't flicker).
 * - Pass `enabled: false` to hold off until required inputs exist.
 *
 * `deps` must always have the same length for a given call site.
 */
export function useAsyncData(fetcher, deps = [], { enabled = true } = {}) {
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const requestId = useRef(0);
  const [state, setState] = useState({ data: null, error: null, loading: enabled });

  const load = useCallback(async (options) => {
    const silent = options?.silent === true;
    const id = ++requestId.current;
    if (!silent) setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fetcherRef.current();
      if (id === requestId.current) setState({ data, error: null, loading: false });
      return data;
    } catch (error) {
      if (id === requestId.current) {
        // Keep showing the previous data if a silent refresh fails.
        setState((s) => ({ data: silent ? s.data : null, error: silent ? s.error : error, loading: false }));
      }
      return undefined;
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      load();
    } else {
      requestId.current++;
      setState((s) => ({ ...s, loading: false }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, load, ...deps]);

  // Ignore anything that resolves after unmount.
  useEffect(
    () => () => {
      requestId.current++;
    },
    []
  );

  const setData = useCallback((updater) => {
    setState((s) => ({ ...s, data: typeof updater === 'function' ? updater(s.data) : updater }));
  }, []);

  return { ...state, reload: load, setData };
}
