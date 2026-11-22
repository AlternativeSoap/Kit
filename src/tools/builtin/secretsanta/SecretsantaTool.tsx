"use client";

import { useCallback, useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import {
  Field,
  fieldClass,
  primaryBtnClass,
  secondaryBtnClass,
} from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { type ToolPrefill } from "@/tools/prefill";
import {
  drawSecretSanta,
  formatAssignments,
  parseExclusions,
  parseNames,
} from "./calc";

const DEFAULT_NAMES = "Anna\nBjørn\nClara\nDavid\nEmma";

export function SecretsantaTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const da = locale === "da";

  const [namesRaw, setNamesRaw] = useState(
    prefill?.names ?? prefill?.people ?? DEFAULT_NAMES,
  );
  const [exclusionsRaw, setExclusionsRaw] = useState(
    prefill?.exclusions ?? prefill?.exclude ?? "",
  );
  const [seed, setSeed] = useState(0);
  const [hidden, setHidden] = useState(true);

  const names = useMemo(() => parseNames(namesRaw), [namesRaw]);
  const exclusions = useMemo(
    () => parseExclusions(exclusionsRaw, names),
    [exclusionsRaw, names],
  );

  const result = useMemo(() => {
    void seed;
    return drawSecretSanta(names, exclusions);
  }, [names, exclusions, seed]);

  const reshuffle = useCallback(() => {
    setSeed((s) => s + 1);
    setHidden(true);
  }, []);

  const copyLabel = da ? "Kopiér" : "Copy";
  const copiedLabel = da ? "Kopieret" : "Copied";
  const listText = formatAssignments(result.assignments, "→");

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <Field
          label={da ? "Deltagere" : "Participants"}
          hint={da ? "Ét navn pr. linje" : "One name per line"}
        >
          <textarea
            value={namesRaw}
            onChange={(e) => setNamesRaw(e.target.value)}
            rows={8}
            className={fieldClass}
          />
        </Field>
        <Field
          label={da ? "Udelukkelser (valgfrit)" : "Exclusions (optional)"}
          hint={
            da
              ? "Én pr. linje, f.eks. Anna>David (Anna må ikke trække David)"
              : "One per line, e.g. Anna>David (Anna cannot draw David)"
          }
        >
          <textarea
            value={exclusionsRaw}
            onChange={(e) => setExclusionsRaw(e.target.value)}
            rows={4}
            className={fieldClass}
            placeholder="Anna>David"
          />
        </Field>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={primaryBtnClass} onClick={reshuffle}>
            {da ? "Bland igen" : "Reshuffle"}
          </button>
          <button
            type="button"
            className={secondaryBtnClass}
            onClick={() => setHidden((h) => !h)}
            disabled={result.assignments.length === 0}
          >
            {hidden
              ? da
                ? "Vis par"
                : "Reveal"
              : da
                ? "Skjul par"
                : "Hide"}
          </button>
        </div>
      </div>

      <div className="rounded-[12px] border border-border bg-surface px-5 py-2">
        {result.error === "need_two" ? (
          <p className="py-8 text-sm text-muted">
            {da
              ? "Tilføj mindst to deltagere."
              : "Add at least two participants."}
          </p>
        ) : result.error === "impossible" ? (
          <p className="py-8 text-sm text-muted">
            {da
              ? "Ingen gyldig fordeling med de nuværende udelukkelser. Prøv at fjerne nogle."
              : "No valid draw with the current exclusions. Try removing some."}
          </p>
        ) : result.assignments.length > 0 ? (
          <>
            <div className="flex items-start justify-between gap-3 py-3">
              <div>
                <p className="text-xs text-muted">
                  {da ? "Fordeling" : "Assignments"}
                </p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">
                  {names.length}{" "}
                  {da ? "deltagere" : "people"}
                </p>
              </div>
              <CopyButton
                value={listText}
                label={copyLabel}
                copiedLabel={copiedLabel}
              />
            </div>
            <ul className="space-y-2 border-t border-border py-3 text-sm">
              {result.assignments.map((a) => (
                <li
                  key={a.giver}
                  className="flex justify-between gap-4 font-medium"
                >
                  <span>{a.giver}</span>
                  <span className="text-muted">
                    {hidden ? "→ •••" : `→ ${a.receiver}`}
                  </span>
                </li>
              ))}
            </ul>
            <p className="pb-3 text-xs text-muted">
              {da
                ? "Hver person giver til præcis én anden. Ingen giver til sig selv."
                : "Everyone gives to exactly one other person. Nobody draws themselves."}
            </p>
          </>
        ) : (
          <p className="py-8 text-sm text-muted">
            {da ? "Indtast navne for at trække." : "Enter names to draw."}
          </p>
        )}
      </div>
    </div>
  );
}
