"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import {
  Field,
  fieldClass,
  primaryBtnClass,
  secondaryBtnClass,
} from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { formatNumber } from "@/lib/format";
import {
  MAX_CRITERIA,
  MAX_OPTIONS,
  MIN_CRITERIA,
  MIN_OPTIONS,
  normalizeWeights,
  scoreDecision,
  type Criterion,
  type Option,
} from "./calc";

let nextId = 1;
function uid(prefix: string) {
  nextId += 1;
  return `${prefix}-${nextId}`;
}

function defaultCriteria(da: boolean): Criterion[] {
  return [
    { id: uid("c"), name: da ? "Pris" : "Price", weight: 30 },
    { id: uid("c"), name: da ? "Kvalitet" : "Quality", weight: 40 },
    { id: uid("c"), name: da ? "Risiko" : "Risk", weight: 30 },
  ];
}

function defaultOptions(criteria: Criterion[], da: boolean): Option[] {
  const blank = (): Record<string, number> => {
    const scores: Record<string, number> = {};
    for (const c of criteria) scores[c.id] = 5;
    return scores;
  };
  return [
    { id: uid("o"), name: da ? "Valg A" : "Option A", scores: blank() },
    { id: uid("o"), name: da ? "Valg B" : "Option B", scores: blank() },
  ];
}

export function BeslutningTool() {
  const { locale } = useLanguage();
  const da = locale === "da";

  const [criteria, setCriteria] = useState<Criterion[]>(() =>
    defaultCriteria(da),
  );
  const [options, setOptions] = useState<Option[]>(() =>
    defaultOptions(criteria, da),
  );

  const weights = useMemo(() => normalizeWeights(criteria), [criteria]);
  const result = useMemo(
    () => scoreDecision(criteria, options),
    [criteria, options],
  );

  const copyLabel = da ? "Kopiér" : "Copy";
  const copiedLabel = da ? "Kopieret" : "Copied";

  const addCriterion = () => {
    if (criteria.length >= MAX_CRITERIA) return;
    const id = uid("c");
    setCriteria((prev) => [
      ...prev,
      { id, name: da ? `Kriterium ${prev.length + 1}` : `Criterion ${prev.length + 1}`, weight: 10 },
    ]);
    setOptions((prev) =>
      prev.map((opt) => ({
        ...opt,
        scores: { ...opt.scores, [id]: 5 },
      })),
    );
  };

  const removeCriterion = (id: string) => {
    if (criteria.length <= MIN_CRITERIA) return;
    setCriteria((prev) => prev.filter((c) => c.id !== id));
    setOptions((prev) =>
      prev.map((opt) => {
        const rest = { ...opt.scores };
        delete rest[id];
        return { ...opt, scores: rest };
      }),
    );
  };

  const addOption = () => {
    if (options.length >= MAX_OPTIONS) return;
    const scores: Record<string, number> = {};
    for (const c of criteria) scores[c.id] = 5;
    setOptions((prev) => [
      ...prev,
      {
        id: uid("o"),
        name: da ? `Valg ${String.fromCharCode(65 + prev.length)}` : `Option ${String.fromCharCode(65 + prev.length)}`,
        scores,
      },
    ]);
  };

  const removeOption = (id: string) => {
    if (options.length <= MIN_OPTIONS) return;
    setOptions((prev) => prev.filter((o) => o.id !== id));
  };

  const updateScore = (optionId: string, criterionId: string, raw: string) => {
    const n = Number(raw.replace(",", "."));
    setOptions((prev) =>
      prev.map((opt) =>
        opt.id === optionId
          ? { ...opt, scores: { ...opt.scores, [criterionId]: n } }
          : opt,
      ),
    );
  };

  const summaryText = result
    ? result.scores
        .map((s) => {
          const name =
            options.find((o) => o.id === s.optionId)?.name ?? s.optionId;
          return `${name}: ${formatNumber(s.total, locale, 2)}`;
        })
        .join("\n")
    : "";

  return (
    <div className="space-y-8">
      <p className="text-sm text-muted">
        {da
          ? "Vægt kriterier (normaliseres til 100 %) og score hvert valg fra 1–10. Vinderen markeres automatisk."
          : "Weight criteria (normalized to 100%) and score each option from 1–10. The winner is highlighted automatically."}
      </p>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-medium text-foreground">
            {da ? "Kriterier" : "Criteria"}
          </h2>
          <button
            type="button"
            className={secondaryBtnClass}
            onClick={addCriterion}
            disabled={criteria.length >= MAX_CRITERIA}
          >
            {da ? "Tilføj kriterium" : "Add criterion"}
          </button>
        </div>
        <div className="space-y-3">
          {criteria.map((c) => (
            <div
              key={c.id}
              className="grid gap-3 rounded-[12px] border border-border bg-surface p-3 sm:grid-cols-[1fr_120px_100px_auto]"
            >
              <Field label={da ? "Navn" : "Name"}>
                <input
                  type="text"
                  value={c.name}
                  onChange={(e) =>
                    setCriteria((prev) =>
                      prev.map((item) =>
                        item.id === c.id
                          ? { ...item, name: e.target.value }
                          : item,
                      ),
                    )
                  }
                  className={fieldClass}
                />
              </Field>
              <Field label={da ? "Vægt" : "Weight"}>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1"
                  value={c.weight}
                  onChange={(e) =>
                    setCriteria((prev) =>
                      prev.map((item) =>
                        item.id === c.id
                          ? {
                              ...item,
                              weight: Number(e.target.value.replace(",", ".")),
                            }
                          : item,
                      ),
                    )
                  }
                  className={fieldClass}
                />
              </Field>
              <div className="flex flex-col justify-end pb-1 text-sm text-muted">
                {formatNumber(weights[c.id] ?? 0, locale, 1)} %
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  className={secondaryBtnClass}
                  onClick={() => removeCriterion(c.id)}
                  disabled={criteria.length <= MIN_CRITERIA}
                >
                  {da ? "Fjern" : "Remove"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-medium text-foreground">
            {da ? "Valgmuligheder" : "Options"}
          </h2>
          <button
            type="button"
            className={secondaryBtnClass}
            onClick={addOption}
            disabled={options.length >= MAX_OPTIONS}
          >
            {da ? "Tilføj valg" : "Add option"}
          </button>
        </div>

        <div className="overflow-x-auto rounded-[12px] border border-border">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-surface">
              <tr>
                <th className="px-3 py-2.5 font-medium">
                  {da ? "Valg" : "Option"}
                </th>
                {criteria.map((c) => (
                  <th key={c.id} className="px-3 py-2.5 font-medium">
                    {c.name || "—"}
                    <span className="ml-1 text-xs text-muted">
                      ({formatNumber(weights[c.id] ?? 0, locale, 0)}%)
                    </span>
                  </th>
                ))}
                <th className="px-3 py-2.5 font-medium">
                  {da ? "Total" : "Total"}
                </th>
                <th className="px-3 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {options.map((opt) => {
                const score = result?.scores.find(
                  (s) => s.optionId === opt.id,
                );
                const isWinner = result?.winnerId === opt.id;
                return (
                  <tr
                    key={opt.id}
                    className={`border-b border-border last:border-0 ${
                      isWinner ? "bg-[var(--accent-soft)]" : ""
                    }`}
                  >
                    <td className="px-3 py-2 align-middle">
                      <input
                        type="text"
                        value={opt.name}
                        onChange={(e) =>
                          setOptions((prev) =>
                            prev.map((item) =>
                              item.id === opt.id
                                ? { ...item, name: e.target.value }
                                : item,
                            ),
                          )
                        }
                        className={fieldClass}
                      />
                      {isWinner ? (
                        <span className="mt-1 block text-xs font-medium text-foreground">
                          {da ? "Vinder" : "Winner"}
                        </span>
                      ) : null}
                    </td>
                    {criteria.map((c) => (
                      <td key={c.id} className="px-3 py-2 align-middle">
                        <input
                          type="number"
                          inputMode="numeric"
                          min="1"
                          max="10"
                          step="1"
                          value={opt.scores[c.id] ?? ""}
                          onChange={(e) =>
                            updateScore(opt.id, c.id, e.target.value)
                          }
                          className={fieldClass}
                        />
                      </td>
                    ))}
                    <td className="px-3 py-2 align-middle font-medium tabular-nums">
                      {score
                        ? formatNumber(score.total, locale, 2)
                        : "—"}
                    </td>
                    <td className="px-3 py-2 align-middle">
                      <button
                        type="button"
                        className={secondaryBtnClass}
                        onClick={() => removeOption(opt.id)}
                        disabled={options.length <= MIN_OPTIONS}
                      >
                        {da ? "Fjern" : "Remove"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3 rounded-[12px] border border-border bg-surface px-5 py-4">
        {result ? (
          <>
            <div className="flex-1">
              <p className="text-xs text-muted">
                {da ? "Vægtet vinder" : "Weighted winner"}
              </p>
              <p className="mt-1 text-xl font-semibold tracking-tight">
                {options.find((o) => o.id === result.winnerId)?.name ?? "—"}
              </p>
            </div>
            <CopyButton
              value={summaryText}
              label={copyLabel}
              copiedLabel={copiedLabel}
            />
          </>
        ) : (
          <p className="text-sm text-muted">
            {da
              ? "Sæt positive vægte og scores mellem 1 og 10 for at se resultatet."
              : "Set positive weights and scores between 1 and 10 to see the result."}
          </p>
        )}
        <button
          type="button"
          className={primaryBtnClass}
          onClick={() => {
            const next = defaultCriteria(da);
            setCriteria(next);
            setOptions(defaultOptions(next, da));
          }}
        >
          {da ? "Nulstil" : "Reset"}
        </button>
      </div>
    </div>
  );
}
