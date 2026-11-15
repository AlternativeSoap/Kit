"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import { getDictionary } from "./dictionaries";
import { resolveInitialLocale, writeStoredLocale } from "./detect";
import type { Dictionary, Locale } from "./types";

type LanguageContextValue = {
  locale: Locale;
  dictionary: Dictionary;
  setLocale: (locale: Locale) => void;
  ready: boolean;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

type LocaleStore = {
  locale: Locale;
  ready: boolean;
};

const listeners = new Set<() => void>();

let store: LocaleStore = {
  locale: "en",
  ready: false,
};

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getStoreSnapshot(): LocaleStore {
  return store;
}

/** Must be referentially stable — React warns (and can loop) if this allocates. */
const SERVER_STORE_SNAPSHOT: LocaleStore = {
  locale: "en",
  ready: false,
};

function getServerStoreSnapshot(): LocaleStore {
  return SERVER_STORE_SNAPSHOT;
}

function writeStore(next: Partial<LocaleStore>) {
  store = { ...store, ...next };
  emit();
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const snapshot = useSyncExternalStore(
    subscribe,
    getStoreSnapshot,
    getServerStoreSnapshot,
  );

  useEffect(() => {
    const next = resolveInitialLocale();
    writeStoredLocale(next);
    document.documentElement.lang = next;
    writeStore({ locale: next, ready: true });
  }, []);

  const setLocale = useCallback((next: Locale) => {
    writeStoredLocale(next);
    document.documentElement.lang = next;
    writeStore({ locale: next, ready: true });
  }, []);

  const dictionary = useMemo(
    () => getDictionary(snapshot.locale),
    [snapshot.locale],
  );

  const value = useMemo(
    () => ({
      locale: snapshot.locale,
      dictionary,
      setLocale,
      ready: snapshot.ready,
    }),
    [snapshot.locale, snapshot.ready, dictionary, setLocale],
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

/**
 * Hydration-safe locale for a route segment.
 *
 * During SSR and hydration, `useSyncExternalStore` always returns
 * `serverLocale`. After hydration it follows the shared client store, so
 * Activity-restored client state cannot mismatch the server HTML.
 */
export function LocaleGate({
  serverLocale,
  children,
}: {
  serverLocale: Locale;
  children: React.ReactNode;
}) {
  const parent = useLanguage();

  const locale = useSyncExternalStore(
    subscribe,
    () => (store.ready ? store.locale : serverLocale),
    () => serverLocale,
  );

  const ready = useSyncExternalStore(
    subscribe,
    () => store.ready,
    () => false,
  );

  const dictionary = useMemo(() => getDictionary(locale), [locale]);

  const value = useMemo(
    () => ({
      locale,
      dictionary,
      setLocale: parent.setLocale,
      ready,
    }),
    [dictionary, locale, parent.setLocale, ready],
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
}

export function useDictionary(): Dictionary {
  return useLanguage().dictionary;
}
