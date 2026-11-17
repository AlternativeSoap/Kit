"use client";

import { useCallback, useRef, useState } from "react";

type HistoryState<T> = {
  past: T[];
  present: T;
  future: T[];
};

/**
 * Undo/redo for Papers documents.
 * Use setPresent for edits that should be undoable.
 * Use mutate during live drag, then markGestureEnd() so one undo step covers the gesture.
 * Use replace when loading a file or starting a new document.
 */
export function useHistory<T>(initial: T, limit = 40) {
  const [state, setState] = useState<HistoryState<T>>({
    past: [],
    present: initial,
    future: [],
  });
  const gestureBase = useRef<T | null>(null);
  const presentRef = useRef(state.present);
  presentRef.current = state.present;

  const setPresent = useCallback(
    (next: T | ((prev: T) => T)) => {
      setState((s) => {
        const value =
          typeof next === "function" ? (next as (p: T) => T)(s.present) : next;
        if (Object.is(value, s.present)) return s;
        return {
          past: [...s.past.slice(-(limit - 1)), s.present],
          present: value,
          future: [],
        };
      });
      gestureBase.current = null;
    },
    [limit],
  );

  const mutate = useCallback((next: T | ((prev: T) => T)) => {
    setState((s) => {
      const value =
        typeof next === "function" ? (next as (p: T) => T)(s.present) : next;
      if (Object.is(value, s.present)) return s;
      return { ...s, present: value };
    });
  }, []);

  const markGestureStart = useCallback(() => {
    gestureBase.current = presentRef.current;
  }, []);

  const markGestureEnd = useCallback(() => {
    const base = gestureBase.current;
    gestureBase.current = null;
    if (base == null) return;
    setState((s) => {
      if (Object.is(base, s.present)) return s;
      return {
        past: [...s.past.slice(-(limit - 1)), base],
        present: s.present,
        future: [],
      };
    });
  }, [limit]);

  const replace = useCallback((next: T) => {
    gestureBase.current = null;
    setState({ past: [], present: next, future: [] });
  }, []);

  const undo = useCallback(() => {
    gestureBase.current = null;
    setState((s) => {
      if (!s.past.length) return s;
      const previous = s.past[s.past.length - 1]!;
      return {
        past: s.past.slice(0, -1),
        present: previous,
        future: [s.present, ...s.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    gestureBase.current = null;
    setState((s) => {
      if (!s.future.length) return s;
      const [next, ...rest] = s.future;
      return {
        past: [...s.past, s.present],
        present: next!,
        future: rest,
      };
    });
  }, []);

  return {
    present: state.present,
    setPresent,
    mutate,
    markGestureStart,
    markGestureEnd,
    replace,
    undo,
    redo,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  };
}
