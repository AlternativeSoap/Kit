"use client";

import { useEffect, useMemo, useState } from "react";
import { useDictionary } from "@/i18n/LanguageProvider";
import { getToolCopy } from "@/i18n/tools";
import {
  clearPersonalData,
  excludeTool,
  getExcludedIds,
  getPinnedSlugs,
  getShortcuts,
  movePin,
  removeShortcut,
  restoreExcluded,
  setShortcut,
  shortcutConflict,
  togglePin,
  type Shortcut,
} from "@/lib/personal";
import { kitTools, tools } from "@/tools/registry";

export function SettingsForm() {
  const dictionary = useDictionary();
  const t = dictionary.personal;
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [pins, setPins] = useState<string[]>([]);
  const [excluded, setExcluded] = useState<string[]>([]);
  const [alias, setAlias] = useState("");
  const [toolId, setToolId] = useState("moms");
  const [error, setError] = useState("");
  const [cleared, setCleared] = useState(false);

  const refresh = () => {
    setShortcuts(getShortcuts());
    setPins(getPinnedSlugs());
    setExcluded(getExcludedIds());
  };

  useEffect(() => {
    document.title = `${t.title} · ${dictionary.brand}`;
  }, [t.title, dictionary.brand]);

  useEffect(() => {
    refresh();
    window.addEventListener("kit:personal-changed", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("kit:personal-changed", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const pinChoices = useMemo(
    () => kitTools.filter((tool) => tool.kind === "builtin"),
    [],
  );

  const shortcutChoices = useMemo(() => tools, []);

  const add = () => {
    setCleared(false);
    const conflict = shortcutConflict(alias);
    if (conflict?.type === "shortcut") {
      setError(t.conflictShortcut);
      return;
    }
    if (conflict?.type === "builtin") {
      setError(t.conflictBuiltin);
      return;
    }
    const result = setShortcut(alias, toolId);
    if (!result.ok) {
      setError(result.reason === "invalid" ? t.invalidAlias : t.conflictBuiltin);
      return;
    }
    setAlias("");
    setError("");
    refresh();
  };

  const clearAll = () => {
    clearPersonalData();
    refresh();
    setError("");
    setCleared(true);
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <header className="mb-8">
        <h1 className="font-serif text-[1.75rem] leading-tight tracking-tight text-foreground sm:text-4xl">
          {t.title}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted sm:text-base">
          {t.description}
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-sm font-medium">{t.pinsTitle}</h2>
        <p className="text-xs text-muted sm:text-sm">{t.pinsHelp}</p>
        {pins.length === 0 ? (
          <p className="text-sm text-muted">{t.emptyPins}</p>
        ) : (
          <ul className="space-y-3">
            {pins.map((slug, index) => {
              const tool = tools.find((item) => item.slug === slug);
              if (!tool) return null;
              const copy = getToolCopy(dictionary, tool.id);
              return (
                <li
                  key={slug}
                  className="flex flex-col gap-2 rounded-[10px] border border-border/80 px-3 py-2.5 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:border-0 sm:px-0 sm:py-0"
                >
                  <span className="min-w-0 break-words">{copy.name}</span>
                  <span className="flex flex-wrap items-center gap-1 sm:gap-2">
                    <button
                      type="button"
                      className="kit-touch-target inline-flex items-center justify-center rounded-[8px] px-2.5 py-1.5 text-muted hover:bg-accent-soft hover:text-foreground disabled:opacity-40 sm:min-h-0 sm:min-w-0 sm:px-1 sm:py-0"
                      disabled={index === 0}
                      onClick={() => {
                        setPins(movePin(slug, -1));
                        setCleared(false);
                      }}
                    >
                      {t.movePinUp}
                    </button>
                    <button
                      type="button"
                      className="kit-touch-target inline-flex items-center justify-center rounded-[8px] px-2.5 py-1.5 text-muted hover:bg-accent-soft hover:text-foreground disabled:opacity-40 sm:min-h-0 sm:min-w-0 sm:px-1 sm:py-0"
                      disabled={index === pins.length - 1}
                      onClick={() => {
                        setPins(movePin(slug, 1));
                        setCleared(false);
                      }}
                    >
                      {t.movePinDown}
                    </button>
                    <button
                      type="button"
                      className="kit-touch-target inline-flex items-center justify-center rounded-[8px] px-2.5 py-1.5 text-muted hover:bg-accent-soft hover:text-foreground sm:min-h-0 sm:min-w-0 sm:px-1 sm:py-0"
                      onClick={() => {
                        setPins(togglePin(slug));
                        setCleared(false);
                      }}
                    >
                      {dictionary.search.unpin}
                    </button>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">
            {t.pinTool}
          </span>
          <select
            className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-base outline-none focus:border-accent sm:py-2 sm:text-sm"
            defaultValue=""
            onChange={(event) => {
              const slug = event.target.value;
              if (!slug) return;
              setPins(togglePin(slug));
              event.target.value = "";
              setCleared(false);
            }}
          >
            <option value="" disabled>
              {t.pinTool}
            </option>
            {pinChoices.map((tool) => {
              const copy = getToolCopy(dictionary, tool.id);
              return (
                <option key={tool.id} value={tool.slug}>
                  {copy.name}
                </option>
              );
            })}
          </select>
        </label>
      </section>

      <section className="mt-10 space-y-3 border-t border-border pt-8">
        <h2 className="text-sm font-medium">{t.exclusionsTitle}</h2>
        <p className="text-xs text-muted sm:text-sm">{t.exclusionsHelp}</p>
        {excluded.length === 0 ? (
          <p className="text-sm text-muted">{t.emptyExclusions}</p>
        ) : (
          <ul className="space-y-3">
            {excluded.map((id) => {
              const copy = getToolCopy(dictionary, id);
              return (
                <li
                  key={id}
                  className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3"
                >
                  <span className="min-w-0 break-words">{copy.name}</span>
                  <button
                    type="button"
                    className="kit-touch-target inline-flex items-center justify-center self-start rounded-[8px] px-2.5 py-1.5 text-muted hover:bg-accent-soft hover:text-foreground sm:min-h-0 sm:min-w-0 sm:px-1 sm:py-0"
                    onClick={() => {
                      setExcluded(restoreExcluded(id));
                      setCleared(false);
                    }}
                  >
                    {t.restoreExcluded}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">
            {t.excludeTool}
          </span>
          <select
            className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-base outline-none focus:border-accent sm:py-2 sm:text-sm"
            defaultValue=""
            onChange={(event) => {
              const id = event.target.value;
              if (!id) return;
              setExcluded(excludeTool(id));
              event.target.value = "";
              setCleared(false);
            }}
          >
            <option value="" disabled>
              {t.excludeTool}
            </option>
            {shortcutChoices.map((tool) => {
              const copy = getToolCopy(dictionary, tool.id);
              return (
                <option key={tool.id} value={tool.id}>
                  {copy.name}
                </option>
              );
            })}
          </select>
        </label>
      </section>

      <section className="mt-10 space-y-3 border-t border-border pt-8">
        <h2 className="text-sm font-medium">{t.shortcutsTitle}</h2>
        <p className="text-xs text-muted sm:text-sm">{t.shortcutsHelp}</p>
        {shortcuts.length === 0 ? (
          <p className="text-sm text-muted">{t.emptyShortcuts}</p>
        ) : (
          <ul className="space-y-3">
            {shortcuts.map((item) => {
              const copy = getToolCopy(dictionary, item.toolId);
              return (
                <li
                  key={item.alias}
                  className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3"
                >
                  <span className="min-w-0 break-words">
                    <span className="font-mono font-medium">{item.alias}</span>
                    <span className="text-muted"> → {copy.name}</span>
                  </span>
                  <button
                    type="button"
                    className="kit-touch-target inline-flex items-center justify-center self-start rounded-[8px] px-2.5 py-1.5 text-muted hover:bg-accent-soft hover:text-foreground sm:min-h-0 sm:min-w-0 sm:px-1 sm:py-0"
                    onClick={() => {
                      setShortcuts(removeShortcut(item.alias));
                      setCleared(false);
                    }}
                  >
                    {t.removeShortcut}
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="grid gap-3 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted">
              {t.alias}
            </span>
            <input
              value={alias}
              onChange={(event) => {
                setAlias(event.target.value);
                setError("");
                setCleared(false);
              }}
              className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-base outline-none focus:border-accent sm:py-2 sm:text-sm"
              maxLength={32}
              placeholder="pw"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted">
              {t.tool}
            </span>
            <select
              value={toolId}
              onChange={(event) => setToolId(event.target.value)}
              className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-base outline-none focus:border-accent sm:py-2 sm:text-sm"
            >
              {shortcutChoices.map((tool) => {
                const copy = getToolCopy(dictionary, tool.id);
                return (
                  <option key={tool.id} value={tool.id}>
                    {copy.name}
                  </option>
                );
              })}
            </select>
          </label>
        </div>
        {error ? <p className="text-sm text-foreground">{error}</p> : null}
        <button
          type="button"
          onClick={add}
          className="kit-touch-target inline-flex w-full items-center justify-center rounded-[10px] bg-accent px-3 py-2.5 text-sm font-medium text-white hover:opacity-90 sm:w-auto sm:min-h-0 sm:min-w-0"
        >
          {t.addShortcut}
        </button>
      </section>

      <section className="mt-10 space-y-3 border-t border-border pt-8">
        <h2 className="text-sm font-medium">{t.clearTitle}</h2>
        <p className="text-xs text-muted sm:text-sm">{t.clearHelp}</p>
        <button
          type="button"
          onClick={clearAll}
          className="kit-touch-target inline-flex w-full items-center justify-center rounded-[10px] border border-border px-3 py-2.5 text-sm font-medium hover:bg-accent-soft sm:w-auto sm:min-h-0 sm:min-w-0"
        >
          {t.clearAction}
        </button>
        {cleared ? (
          <p className="text-sm text-foreground">{t.cleared}</p>
        ) : null}
      </section>
    </div>
  );
}
