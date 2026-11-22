"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { Field, fieldClass } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { formatNumber } from "@/lib/format";
import { prefillChoice, type ToolPrefill } from "@/tools/prefill";
import {
  ABO_TYPES,
  RH_TYPES,
  calculateInheritance,
  type AboType,
  type RhType,
} from "./calc";

export function BlodtypeTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const da = locale === "da";

  const [motherAbo, setMotherAbo] = useState<AboType>(
    prefillChoice(prefill, "mother", ABO_TYPES) ??
      prefillChoice(prefill, "parent1", ABO_TYPES) ??
      "A",
  );
  const [motherRh, setMotherRh] = useState<RhType>(
    prefillChoice(prefill, "motherRh", RH_TYPES) ?? "+",
  );
  const [fatherAbo, setFatherAbo] = useState<AboType>(
    prefillChoice(prefill, "father", ABO_TYPES) ??
      prefillChoice(prefill, "parent2", ABO_TYPES) ??
      "B",
  );
  const [fatherRh, setFatherRh] = useState<RhType>(
    prefillChoice(prefill, "fatherRh", RH_TYPES) ?? "+",
  );

  const result = useMemo(
    () =>
      calculateInheritance(
        { abo: motherAbo, rh: motherRh },
        { abo: fatherAbo, rh: fatherRh },
      ),
    [motherAbo, motherRh, fatherAbo, fatherRh],
  );

  const copyLabel = da ? "Kopiér" : "Copy";
  const copiedLabel = da ? "Kopieret" : "Copied";

  const listText = result.outcomes
    .map(
      (o) =>
        `${o.label}: ${formatNumber(o.probability * 100, locale, 1)}%`,
    )
    .join("\n");

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={da ? "Forælder 1 ABO" : "Parent 1 ABO"}>
            <select
              value={motherAbo}
              onChange={(e) => setMotherAbo(e.target.value as AboType)}
              className={fieldClass}
            >
              {ABO_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label={da ? "Forælder 1 Rh" : "Parent 1 Rh"}>
            <select
              value={motherRh}
              onChange={(e) => setMotherRh(e.target.value as RhType)}
              className={fieldClass}
            >
              {RH_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t === "+" ? "Rh+" : "Rh−"}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={da ? "Forælder 2 ABO" : "Parent 2 ABO"}>
            <select
              value={fatherAbo}
              onChange={(e) => setFatherAbo(e.target.value as AboType)}
              className={fieldClass}
            >
              {ABO_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label={da ? "Forælder 2 Rh" : "Parent 2 Rh"}>
            <select
              value={fatherRh}
              onChange={(e) => setFatherRh(e.target.value as RhType)}
              className={fieldClass}
            >
              {RH_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t === "+" ? "Rh+" : "Rh−"}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <p className="text-sm text-muted">
          {da
            ? "Forenklet Mendelsk model. A og B antages lige ofte at være homo- og heterozygote. Rh+ antages lige ofte ++ og +−."
            : "Simplified Mendelian model. A and B are treated as equally often homo- and heterozygous. Rh+ is treated as equally often ++ and +−."}
        </p>
      </div>

      <div className="rounded-[12px] border border-border bg-surface px-5 py-2">
        {result.outcomes.length > 0 ? (
          <>
            <div className="flex items-start justify-between gap-3 py-3">
              <div>
                <p className="text-xs text-muted">
                  {da ? "Mulige barn-typer" : "Possible child types"}
                </p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">
                  {result.outcomes[0]!.label}{" "}
                  <span className="text-base font-medium text-muted">
                    {formatNumber(
                      result.outcomes[0]!.probability * 100,
                      locale,
                      1,
                    )}
                    %
                  </span>
                </p>
              </div>
              <CopyButton
                value={listText}
                label={copyLabel}
                copiedLabel={copiedLabel}
              />
            </div>
            <dl className="space-y-2 border-t border-border py-3 text-sm">
              {result.outcomes.map((o) => (
                <div key={o.label} className="flex justify-between gap-4">
                  <dt className="text-muted">{o.label}</dt>
                  <dd className="font-medium tabular-nums">
                    {formatNumber(o.probability * 100, locale, 1)}%
                  </dd>
                </div>
              ))}
            </dl>
            <p className="pb-3 text-xs text-muted">
              {da
                ? "Kun til undervisning. Faktiske sandsynligheder afhænger af genotyper og population. Spørg sundhedsfagligt personale ved behov."
                : "For education only. Real probabilities depend on genotypes and population. Ask a clinician when it matters."}
            </p>
          </>
        ) : (
          <p className="py-8 text-sm text-muted">
            {da ? "Vælg forældrenes blodtyper." : "Choose the parents’ blood types."}
          </p>
        )}
      </div>
    </div>
  );
}
