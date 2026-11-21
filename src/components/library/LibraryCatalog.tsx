"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fieldClass } from "@/components/tools/ui";
import { useDictionary, useLanguage } from "@/i18n/LanguageProvider";
import type { Dictionary } from "@/i18n/types";
import { getToolCopy } from "@/i18n/tools";
import { getUsageCounts } from "@/lib/personal";
import { listLibraryCatalog, sortLibraryEntries } from "@/lib/search";
import { normalize } from "@/lib/search/normalize";
import type { ToolDefinition } from "@/tools/types";

type LibraryScope = "tools" | "sites" | "all";

function ToolList({ tools }: { tools: ToolDefinition[] }) {
  const dictionary = useDictionary();

  return (
    <ul className="divide-y divide-border border-y border-border">
      {tools.map((tool) => {
        const copy = getToolCopy(dictionary, tool.id);
        let host: string | null = null;
        if (tool.kind === "external" && tool.href) {
          try {
            host = new URL(tool.href).host;
          } catch {
            host = null;
          }
        }

        return (
          <li key={tool.id}>
            <Link
              href={`/t/${tool.slug}`}
              className="flex min-h-14 flex-col justify-center gap-0.5 py-3 transition-colors hover:bg-accent-soft/60 focus-visible:bg-accent-soft/60 focus-visible:outline-none sm:min-h-0 sm:py-3.5"
            >
              <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="text-[15px] font-medium text-foreground">
                  {copy.name}
                </span>
                {host ? (
                  <span className="font-mono text-[12px] text-muted">
                    {host}
                  </span>
                ) : null}
              </span>
              <span className="text-[13px] leading-snug text-muted">
                {copy.description}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function matchesFilter(
  tool: ToolDefinition,
  dictionary: Dictionary,
  query: string,
): boolean {
  if (!query) return true;
  const copy = getToolCopy(dictionary, tool.id);
  const host =
    tool.kind === "external" && tool.href
      ? (() => {
          try {
            return new URL(tool.href).host;
          } catch {
            return "";
          }
        })()
      : "";
  const haystack = normalize(
    `${copy.name} ${copy.description} ${tool.slug} ${host} ${(tool.aliases ?? []).join(" ")} ${(tool.tags ?? []).join(" ")}`,
  );
  return haystack.includes(query);
}

export function LibraryCatalog() {
  const { dictionary } = useLanguage();
  const t = dictionary.library;
  const [filter, setFilter] = useState("");
  const [scope, setScope] = useState<LibraryScope>("tools");
  const [usageCounts, setUsageCounts] = useState<Record<string, number>>({});
  const [randomSalt] = useState(() => {
    const day = Math.floor(Date.now() / 86_400_000);
    return day * 9973 + 17;
  });

  useEffect(() => {
    document.title = `${t.title} · ${dictionary.brand}`;
  }, [t.title, dictionary.brand]);

  useEffect(() => {
    const refresh = () => setUsageCounts(getUsageCounts());
    refresh();
    window.addEventListener("kit:personal-changed", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("kit:personal-changed", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const sortOptions = useMemo(
    () => ({ usage: usageCounts, randomSalt }),
    [usageCounts, randomSalt],
  );

  const catalog = useMemo(
    () => listLibraryCatalog(dictionary, sortOptions),
    [dictionary, sortOptions],
  );

  const query = normalize(filter);

  const filtered = useMemo(() => {
    return {
      builtins: sortLibraryEntries(
        catalog.builtins.filter((tool) =>
          matchesFilter(tool, dictionary, query),
        ),
        sortOptions,
      ),
      externals: sortLibraryEntries(
        catalog.externals.filter((tool) =>
          matchesFilter(tool, dictionary, query),
        ),
        sortOptions,
      ),
    };
  }, [catalog, dictionary, query, sortOptions]);

  const scopeOptions: Array<{
    id: LibraryScope;
    label: string;
    count: number;
  }> = [
    {
      id: "tools",
      label: t.scopeTools,
      count: filtered.builtins.length,
    },
    {
      id: "sites",
      label: t.scopeSites,
      count: filtered.externals.length,
    },
    {
      id: "all",
      label: t.scopeAll,
      count: filtered.builtins.length + filtered.externals.length,
    },
  ];

  const showTools = scope === "tools" || scope === "all";
  const showSites = scope === "sites" || scope === "all";
  const visibleTools = showTools ? filtered.builtins : [];
  const visibleSites = showSites ? filtered.externals : [];
  const total = visibleTools.length + visibleSites.length;

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

      <div className="mb-8 space-y-4">
        <div
          role="group"
          aria-label={t.scopeLabel}
          className="flex flex-wrap gap-1"
        >
          {scopeOptions.map((option) => {
            const active = option.id === scope;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={active}
                onClick={() => setScope(option.id)}
                className={`kit-touch-target inline-flex items-center gap-2 rounded-[10px] px-3 py-2 text-sm font-medium transition-colors sm:min-h-0 ${
                  active
                    ? "bg-accent text-on-accent"
                    : "text-muted hover:bg-accent-soft hover:text-foreground"
                }`}
              >
                {option.label}
                <span
                  className={`tabular-nums text-xs ${
                    active ? "text-on-accent/80" : "text-muted"
                  }`}
                >
                  {option.count}
                </span>
              </button>
            );
          })}
        </div>

        <label className="block">
          <span className="sr-only">{t.filterLabel}</span>
          <input
            type="search"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder={t.filterPlaceholder}
            className={`${fieldClass} px-4 py-3`}
          />
        </label>
      </div>

      {total === 0 ? (
        <p className="text-sm text-muted">{t.emptyFilter}</p>
      ) : (
        <div className="space-y-10">
          {visibleTools.length > 0 ? (
            <section>
              {scope === "all" ? (
                <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.06em] text-muted">
                  {t.toolsHeading}
                </h2>
              ) : null}
              <ToolList tools={visibleTools} />
            </section>
          ) : null}
          {visibleSites.length > 0 ? (
            <section>
              {scope === "all" ? (
                <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.06em] text-muted">
                  {t.sitesHeading}
                </h2>
              ) : null}
              <ToolList tools={visibleSites} />
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
