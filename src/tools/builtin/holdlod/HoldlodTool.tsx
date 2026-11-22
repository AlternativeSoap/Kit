"use client";

import { useCallback, useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import {
  Field,
  fieldClass,
  primaryBtnClass,
} from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { prefillChoice, prefillNumber, type ToolPrefill } from "@/tools/prefill";
import {
  formatTeams,
  parseNames,
  splitTeams,
  type TeamMode,
} from "./calc";

const MODES: readonly TeamMode[] = ["teams", "size"];
const DEFAULT_NAMES = "Anna\nBjørn\nClara\nDavid\nEmma\nFreja\nGustav\nHelle";

export function HoldlodTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const da = locale === "da";

  const [namesRaw, setNamesRaw] = useState(
    prefill?.names ?? prefill?.people ?? DEFAULT_NAMES,
  );
  const [mode, setMode] = useState<TeamMode>(
    prefillChoice(prefill, "mode", MODES) ?? "teams",
  );
  const [count, setCount] = useState(
    prefillNumber(prefill, "count", { min: 1, integer: true }) ??
      prefillNumber(prefill, "teams", { min: 1, integer: true }) ??
      prefillNumber(prefill, "size", { min: 1, integer: true }) ??
      "2",
  );
  const [seed, setSeed] = useState(0);

  const names = useMemo(() => parseNames(namesRaw), [namesRaw]);

  const result = useMemo(() => {
    void seed;
    const n = Number(count.replace(",", "."));
    if (!Number.isInteger(n) || n < 1) return null;
    return splitTeams(names, mode, n);
  }, [names, mode, count, seed]);

  const reshuffle = useCallback(() => setSeed((s) => s + 1), []);

  const teamLabel = (index: number) =>
    da ? `Hold ${index + 1}` : `Team ${index + 1}`;

  const listText = result
    ? formatTeams(result.teams, teamLabel)
    : "";

  const copyLabel = da ? "Kopiér" : "Copy";
  const copiedLabel = da ? "Kopieret" : "Copied";

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <Field
          label={da ? "Navne" : "Names"}
          hint={da ? "Ét navn pr. linje" : "One name per line"}
        >
          <textarea
            value={namesRaw}
            onChange={(e) => setNamesRaw(e.target.value)}
            rows={8}
            className={fieldClass}
          />
        </Field>

        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: "teams" as const, label: da ? "Antal hold" : "Number of teams" },
              { id: "size" as const, label: da ? "Holdstørrelse" : "Team size" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setMode(item.id)}
              className={`kit-touch-target rounded-[10px] border px-3 py-2 text-sm transition-colors sm:min-h-0 ${
                mode === item.id
                  ? "border-accent bg-accent text-on-accent"
                  : "border-border bg-surface text-muted hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <Field
          label={
            mode === "teams"
              ? da
                ? "Antal hold"
                : "Number of teams"
              : da
                ? "Personer pr. hold"
                : "People per team"
          }
        >
          <input
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className={fieldClass}
          />
        </Field>

        <button type="button" className={primaryBtnClass} onClick={reshuffle}>
          {da ? "Bland igen" : "Reshuffle"}
        </button>
      </div>

      <div className="rounded-[12px] border border-border bg-surface px-5 py-2">
        {result && result.teams.length > 0 ? (
          <>
            <div className="flex items-start justify-between gap-3 py-3">
              <div>
                <p className="text-xs text-muted">
                  {da ? "Hold" : "Teams"}
                </p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">
                  {result.teams.length}{" "}
                  {da ? "hold" : "teams"} · {names.length}{" "}
                  {da ? "personer" : "people"}
                </p>
              </div>
              <CopyButton
                value={listText}
                label={copyLabel}
                copiedLabel={copiedLabel}
              />
            </div>
            <div className="space-y-4 border-t border-border py-3">
              {result.teams.map((members, i) => (
                <div key={i}>
                  <p className="text-xs font-medium text-muted">
                    {teamLabel(i)}{" "}
                    <span className="font-normal">
                      ({members.length})
                    </span>
                  </p>
                  <ul className="mt-1 space-y-0.5 text-sm font-medium">
                    {members.map((name) => (
                      <li key={name}>{name}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="pb-3 text-xs text-muted">
              {da
                ? "Overskydende personer fordeles, så holdene højst afviger med én."
                : "Leftover people are spread so team sizes differ by at most one."}
            </p>
          </>
        ) : (
          <p className="py-8 text-sm text-muted">
            {da
              ? "Indtast navne og vælg antal hold eller holdstørrelse."
              : "Enter names and choose number of teams or team size."}
          </p>
        )}
      </div>
    </div>
  );
}
