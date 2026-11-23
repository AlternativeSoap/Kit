"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import {
  Field,
  KitInput,
  KitSelect,
  fieldClass,
  primaryBtnClass,
  secondaryBtnClass,
} from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  ActionBar,
  EmptyState,
  MatrixCell,
  Panel,
  PanelHeader,
  Stat,
  StatStrip,
  ToneBadge,
  ToolShell,
  type Tone,
} from "../_amo/ui";
import {
  AREA_OPTIONS,
  CONSEQUENCE_LABELS,
  LIKELIHOOD_LABELS,
  assessRisks,
  levelHint,
  levelLabel,
  matrixCell,
  risksToText,
  type Consequence,
  type Likelihood,
  type RiskItemInput,
  type RiskLevel,
} from "./calc";

let seq = 1;
function uid() {
  seq += 1;
  return `risk-${Date.now()}-${seq}`;
}

function toneFor(level: RiskLevel): Tone {
  if (level === "critical") return "critical";
  if (level === "high") return "bad";
  if (level === "medium") return "warn";
  return "ok";
}

function blank(da: boolean): RiskItemInput {
  return {
    id: uid(),
    title: "",
    area: AREA_OPTIONS[da ? "da" : "en"][0],
    likelihood: 3,
    consequence: 3,
    notes: "",
    mitigation: "",
  };
}

export function RisikovurderingTool() {
  const { locale } = useLanguage();
  const da = locale === "da";
  const [items, setItems] = useState<RiskItemInput[]>(() => [
    {
      ...blank(da),
      title: da
        ? "Tung håndvask ustabil på palle"
        : "Heavy sink unstable on pallet",
      area: da ? "Løft og ergonomi" : "Lifting and ergonomics",
      likelihood: 3,
      consequence: 4,
      notes: da
        ? "Risiko for væltning og rygskader ved håndtering."
        : "Risk of tip-over and back injury during handling.",
      mitigation: da
        ? "Bedre palleplacering og hjælpemidler."
        : "Better pallet placement and handling aids.",
    },
  ]);

  const results = useMemo(() => assessRisks(items), [items]);
  const exportText = useMemo(() => risksToText(results, da), [results, da]);
  const counts = useMemo(() => {
    const base = { low: 0, medium: 0, high: 0, critical: 0 };
    for (const r of results) base[r.level] += 1;
    return base;
  }, [results]);

  const update = (id: string, patch: Partial<RiskItemInput>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  };

  return (
    <ToolShell
      wide
      intro={
        da
          ? "Vælg hvor sandsynligt noget er, og hvor slemt det kan blive. Tallet hjælper jer med at prioritere. Det er et samtaleværktøj, ikke en facitliste."
          : "Choose how likely something is, and how bad it could be. The number helps you prioritise. It is a talking tool, not a final answer."
      }
    >
      <StatStrip>
        <Stat label={da ? "Risici" : "Risks"} value={results.length} accent />
        <Stat label={da ? "Kritiske" : "Critical"} value={counts.critical} />
        <Stat label={da ? "Høje" : "High"} value={counts.high} />
        <Stat
          label={da ? "Mellem/lav" : "Med/low"}
          value={counts.medium + counts.low}
        />
      </StatStrip>

      <Panel>
        <PanelHeader
          title={da ? "Oversigt 5×5" : "Overview 5×5"}
          subtitle={
            da
              ? "Venstre: hvor ofte. Top: hvor slemt. Score = de to tal ganget."
              : "Left: how often. Top: how bad. Score = the two numbers multiplied."
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[300px] border-collapse text-center text-xs">
            <thead>
              <tr>
                <th className="px-2 py-1.5 text-muted">
                  {da ? "Ofte \\ Slem" : "Often \\ Bad"}
                </th>
                {([1, 2, 3, 4, 5] as Consequence[]).map((c) => (
                  <th key={c} className="px-1 py-1.5 font-medium text-muted">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {([5, 4, 3, 2, 1] as Likelihood[]).map((l) => (
                <tr key={l}>
                  <th className="px-2 py-1 font-medium text-muted">{l}</th>
                  {([1, 2, 3, 4, 5] as Consequence[]).map((c) => (
                    <td key={c} className="p-0.5">
                      <MatrixCell
                        value={l * c}
                        tone={toneFor(matrixCell(l, c))}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted">
          <ToneBadge tone="ok">{da ? "Lav" : "Low"}</ToneBadge>
          <ToneBadge tone="warn">{da ? "Mellem" : "Medium"}</ToneBadge>
          <ToneBadge tone="bad">{da ? "Høj" : "High"}</ToneBadge>
          <ToneBadge tone="critical">{da ? "Kritisk" : "Critical"}</ToneBadge>
        </div>
      </Panel>

      <div className="space-y-3">
        {items.map((item, index) => {
          const assessed = results.find((r) => r.id === item.id);
          return (
            <Panel key={item.id}>
              <PanelHeader
                title={da ? `Risiko ${index + 1}` : `Risk ${index + 1}`}
                action={
                  <button
                    type="button"
                    className={secondaryBtnClass}
                    disabled={items.length <= 1}
                    onClick={() =>
                      setItems((prev) => prev.filter((x) => x.id !== item.id))
                    }
                  >
                    {da ? "Fjern" : "Remove"}
                  </button>
                }
              />

              <Field label={da ? "Hvad er faren?" : "What is the hazard?"}>
                <KitInput
                  value={item.title}
                  onChange={(e) => update(item.id, { title: e.target.value })}
                  placeholder={
                    da
                      ? "Fx ustabil palle med tungt gods"
                      : "e.g. unstable pallet with heavy goods"
                  }
                />
              </Field>

              <div className="grid gap-3 sm:grid-cols-3">
                <Field label={da ? "Område" : "Area"}>
                  <KitSelect
                    value={item.area}
                    onChange={(e) => update(item.id, { area: e.target.value })}
                  >
                    {AREA_OPTIONS[da ? "da" : "en"].map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </KitSelect>
                </Field>
                <Field
                  label={da ? "Hvor sandsynligt?" : "How likely?"}
                  hint={LIKELIHOOD_LABELS[da ? "da" : "en"][item.likelihood - 1]}
                >
                  <KitSelect
                    value={String(item.likelihood)}
                    onChange={(e) =>
                      update(item.id, {
                        likelihood: Number(e.target.value) as Likelihood,
                      })
                    }
                  >
                    {([1, 2, 3, 4, 5] as Likelihood[]).map((n) => (
                      <option key={n} value={n}>
                        {n} – {LIKELIHOOD_LABELS[da ? "da" : "en"][n - 1]}
                      </option>
                    ))}
                  </KitSelect>
                </Field>
                <Field
                  label={da ? "Hvor slemt?" : "How bad?"}
                  hint={
                    CONSEQUENCE_LABELS[da ? "da" : "en"][item.consequence - 1]
                  }
                >
                  <KitSelect
                    value={String(item.consequence)}
                    onChange={(e) =>
                      update(item.id, {
                        consequence: Number(e.target.value) as Consequence,
                      })
                    }
                  >
                    {([1, 2, 3, 4, 5] as Consequence[]).map((n) => (
                      <option key={n} value={n}>
                        {n} – {CONSEQUENCE_LABELS[da ? "da" : "en"][n - 1]}
                      </option>
                    ))}
                  </KitSelect>
                </Field>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label={da ? "Hvad kan ske?" : "What could happen?"}
                >
                  <textarea
                    className={fieldClass}
                    rows={2}
                    value={item.notes}
                    onChange={(e) => update(item.id, { notes: e.target.value })}
                    placeholder={
                      da
                        ? "Kort beskrivelse af risikoen"
                        : "Short description of the risk"
                    }
                  />
                </Field>
                <Field
                  label={da ? "Sådan gør I det sikrere" : "How to make it safer"}
                >
                  <textarea
                    className={fieldClass}
                    rows={2}
                    value={item.mitigation}
                    onChange={(e) =>
                      update(item.id, { mitigation: e.target.value })
                    }
                    placeholder={
                      da
                        ? "Konkret forslag til løsning"
                        : "Concrete suggestion"
                    }
                  />
                </Field>
              </div>

              {assessed ? (
                <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
                  <ToneBadge tone={toneFor(assessed.level)}>
                    {assessed.score} · {levelLabel(assessed.level, da)}
                  </ToneBadge>
                  <span className="text-sm text-muted">
                    {levelHint(assessed.level, da)}
                  </span>
                </div>
              ) : (
                <EmptyState>
                  {da
                    ? "Giv risikoen en titel for at se scoren."
                    : "Give the risk a title to see the score."}
                </EmptyState>
              )}
            </Panel>
          );
        })}
      </div>

      <ActionBar>
        <button
          type="button"
          className={primaryBtnClass}
          onClick={() => setItems((prev) => [...prev, blank(da)])}
        >
          {da ? "Tilføj risiko" : "Add risk"}
        </button>
        <CopyButton
          value={exportText}
          label={da ? "Kopiér vurdering" : "Copy assessment"}
          copiedLabel={da ? "Kopieret" : "Copied"}
        />
      </ActionBar>
    </ToolShell>
  );
}
