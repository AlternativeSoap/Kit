"use client";

import { useMemo, useState } from "react";
import {
  Field,
  KitInput,
  KitSelect,
  Segmented,
} from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { LAB_FORMULAS, type LabFormulaId } from "./labFormulas";
import {
  CATEGORIES,
  UNITS,
  convertValue,
  formatNum,
  type UnitCategory,
} from "./units";

type Mode = "units" | "formulas";

function parseNum(raw: string): number | null {
  const n = Number(String(raw).trim().replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export function FormellabTool() {
  const { locale } = useLanguage();
  const da = locale === "da";
  const [mode, setMode] = useState<Mode>("units");

  const [category, setCategory] = useState<UnitCategory>("length");
  const units = UNITS[category];
  const [fromId, setFromId] = useState(units[0]!.id);
  const [midId, setMidId] = useState(units[1]?.id ?? units[0]!.id);
  const [toId, setToId] = useState(units[2]?.id ?? units[1]?.id ?? units[0]!.id);
  const [amount, setAmount] = useState("1");
  const [chainSteps, setChainSteps] = useState<2 | 3>(2);

  const [formulaId, setFormulaId] = useState<LabFormulaId>("ohm");
  const formula = LAB_FORMULAS.find((f) => f.id === formulaId) ?? LAB_FORMULAS[0]!;
  const [inputs, setInputs] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const inp of formula.inputs) init[inp.id] = inp.defaultValue;
    return init;
  });

  function onCategoryChange(next: UnitCategory) {
    setCategory(next);
    const list = UNITS[next];
    setFromId(list[0]!.id);
    setMidId(list[1]?.id ?? list[0]!.id);
    setToId(list[2]?.id ?? list[1]?.id ?? list[0]!.id);
  }

  function onFormulaChange(id: LabFormulaId) {
    const f = LAB_FORMULAS.find((x) => x.id === id) ?? LAB_FORMULAS[0]!;
    setFormulaId(id);
    const next: Record<string, string> = {};
    for (const inp of f.inputs) next[inp.id] = inp.defaultValue;
    setInputs(next);
  }

  const value = parseNum(amount);

  const chain = useMemo(() => {
    if (value == null) return null;
    if (chainSteps === 2) {
      const out = convertValue(category, value, fromId, toId);
      if (out == null) return null;
      return [
        { unitId: fromId, value },
        { unitId: toId, value: out },
      ];
    }
    const mid = convertValue(category, value, fromId, midId);
    if (mid == null) return null;
    const out = convertValue(category, mid, midId, toId);
    if (out == null) return null;
    return [
      { unitId: fromId, value },
      { unitId: midId, value: mid },
      { unitId: toId, value: out },
    ];
  }, [value, category, fromId, midId, toId, chainSteps]);

  const formulaValues = useMemo(() => {
    const out: Record<string, number> = {};
    for (const inp of formula.inputs) {
      const n = parseNum(inputs[inp.id] ?? "");
      if (n != null) out[inp.id] = n;
    }
    return out;
  }, [formula, inputs]);

  const formulaResult = formula.evaluate(formulaValues);

  function unitLabel(id: string) {
    const u = units.find((x) => x.id === id);
    return da ? u?.labelDa ?? id : u?.labelEn ?? id;
  }

  return (
    <div className="kit-tool mx-auto max-w-3xl space-y-5">
      <p className="text-sm leading-relaxed text-muted">
        {da
          ? "Konverter enheder i en synlig kæde, eller regn med udvalgte fysik- og matematikformler."
          : "Convert units in a visible chain, or compute with selected physics and math formulas."}
      </p>

      <Segmented
        value={mode}
        onChange={setMode}
        ariaLabel={da ? "Tilstand" : "Mode"}
        options={[
          { id: "units", label: da ? "Enheder" : "Units" },
          { id: "formulas", label: da ? "Formler" : "Formulas" },
        ]}
      />

      {mode === "units" ? (
        <section className="kit-tool-panel space-y-4 p-4 sm:p-5">
          <Field label={da ? "Kategori" : "Category"}>
            <KitSelect
              value={category}
              onChange={(e) => onCategoryChange(e.target.value as UnitCategory)}
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {da ? c.nameDa : c.nameEn}
                </option>
              ))}
            </KitSelect>
          </Field>

          <Field label={da ? "Værdi" : "Value"}>
            <KitInput
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Field>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`kit-touch-target rounded-[10px] border px-3 py-2 text-sm sm:min-h-0 ${
                chainSteps === 2
                  ? "border-accent bg-accent-soft"
                  : "border-border bg-surface"
              }`}
              onClick={() => setChainSteps(2)}
            >
              {da ? "2 trin" : "2 steps"}
            </button>
            <button
              type="button"
              className={`kit-touch-target rounded-[10px] border px-3 py-2 text-sm sm:min-h-0 ${
                chainSteps === 3
                  ? "border-accent bg-accent-soft"
                  : "border-border bg-surface"
              }`}
              onClick={() => setChainSteps(3)}
            >
              {da ? "3 trin" : "3 steps"}
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={da ? "Fra" : "From"}>
              <KitSelect value={fromId} onChange={(e) => setFromId(e.target.value)}>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {da ? u.labelDa : u.labelEn}
                  </option>
                ))}
              </KitSelect>
            </Field>
            {chainSteps === 3 ? (
              <Field label={da ? "Via" : "Via"}>
                <KitSelect value={midId} onChange={(e) => setMidId(e.target.value)}>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {da ? u.labelDa : u.labelEn}
                    </option>
                  ))}
                </KitSelect>
              </Field>
            ) : null}
            <Field label={da ? "Til" : "To"}>
              <KitSelect value={toId} onChange={(e) => setToId(e.target.value)}>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {da ? u.labelDa : u.labelEn}
                  </option>
                ))}
              </KitSelect>
            </Field>
          </div>

          <div className="rounded-[12px] border border-border bg-background p-4">
            <h3 className="text-xs font-medium uppercase tracking-wide text-muted">
              {da ? "Kæde" : "Chain"}
            </h3>
            {chain ? (
              <ol className="mt-3 space-y-2">
                {chain.map((step, i) => (
                  <li
                    key={`${step.unitId}-${i}`}
                    className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm"
                  >
                    <span className="tabular-nums font-semibold text-foreground">
                      {formatNum(step.value, da)}
                    </span>
                    <span className="text-muted">{unitLabel(step.unitId)}</span>
                    {i < chain.length - 1 ? (
                      <span className="text-muted" aria-hidden>
                        →
                      </span>
                    ) : null}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-2 text-sm text-muted">
                {da ? "Indtast et gyldigt tal." : "Enter a valid number."}
              </p>
            )}
          </div>
        </section>
      ) : (
        <section className="kit-tool-panel space-y-4 p-4 sm:p-5">
          <Field label={da ? "Formel" : "Formula"}>
            <KitSelect
              value={formulaId}
              onChange={(e) => onFormulaChange(e.target.value as LabFormulaId)}
            >
              {LAB_FORMULAS.map((f) => (
                <option key={f.id} value={f.id}>
                  {da ? f.nameDa : f.nameEn}
                </option>
              ))}
            </KitSelect>
          </Field>

          <div className="rounded-[12px] border border-border bg-background px-3 py-3">
            <p className="font-mono text-base font-semibold text-foreground">
              {formula.expression}
            </p>
            <p className="mt-1 text-sm text-muted">
              {da ? formula.aboutDa : formula.aboutEn}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {formula.inputs.map((inp) => (
              <Field
                key={inp.id}
                label={`${da ? inp.labelDa : inp.labelEn}${
                  (da ? inp.unitDa : inp.unitEn)
                    ? ` (${da ? inp.unitDa : inp.unitEn})`
                    : ""
                }`}
              >
                <KitInput
                  inputMode="decimal"
                  value={inputs[inp.id] ?? ""}
                  onChange={(e) =>
                    setInputs((prev) => ({ ...prev, [inp.id]: e.target.value }))
                  }
                />
              </Field>
            ))}
          </div>

          <div className="rounded-[12px] border border-border bg-background px-4 py-5 text-center">
            {formulaResult != null ? (
              <>
                <p className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">
                  {formatNum(formulaResult, da)}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {da ? formula.resultUnitDa : formula.resultUnitEn}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted">
                {da
                  ? "Udfyld gyldige tal. Nogle formler kræver positive værdier eller undgår totalrefleksion."
                  : "Enter valid numbers. Some formulas need positive values or avoid total internal reflection."}
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
