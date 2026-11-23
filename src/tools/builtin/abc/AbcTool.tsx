"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import {
  Field,
  fieldClass,
  primaryBtnClass,
  secondaryBtnClass,
  Segmented,
} from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { formatNumber } from "@/lib/format";
import {
  prefillFlag,
  prefillNumber,
  type ToolPrefill,
} from "@/tools/prefill";
import {
  abcRowsToCsv,
  classifyAbc,
  parseAbcPaste,
  type AbcItemInput,
} from "./calc";

const MAX_ROWS = 200;

type RowDraft = {
  id: string;
  item: string;
  quantity: string;
  unitPrice: string;
};

function newRow(index: number, da: boolean): RowDraft {
  return {
    id: `r-${Date.now()}-${index}`,
    item: da ? `Vare ${index}` : `Item ${index}`,
    quantity: index === 1 ? "120" : index === 2 ? "80" : "40",
    unitPrice: index === 1 ? "25" : index === 2 ? "18" : "9",
  };
}

function parseNum(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const value = Number(trimmed.replace(",", "."));
  return Number.isFinite(value) ? value : undefined;
}

export function AbcTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const da = locale === "da";

  const [paste, setPaste] = useState(prefill?.csv ?? prefill?.paste ?? "");
  const [aPct, setAPct] = useState(
    prefillNumber(prefill, "a", { min: 1, max: 99 }) ?? "80",
  );
  const [bPct, setBPct] = useState(
    prefillNumber(prefill, "b", { min: 1, max: 100 }) ?? "95",
  );
  const [dual, setDual] = useState(prefillFlag(prefill, "dual"));
  const [rows, setRows] = useState<RowDraft[]>(() => [
    newRow(1, da),
    newRow(2, da),
    newRow(3, da),
  ]);
  const [pasteError, setPasteError] = useState<string | null>(null);

  const itemsFromRows = useMemo((): AbcItemInput[] => {
    const out: AbcItemInput[] = [];
    for (const r of rows) {
      const quantity = parseNum(r.quantity);
      const unitPrice = parseNum(r.unitPrice);
      if (quantity === undefined || unitPrice === undefined) continue;
      out.push({
        item: r.item.trim() || (da ? "Vare" : "Item"),
        quantity,
        unitPrice,
      });
    }
    return out;
  }, [rows, da]);

  const result = useMemo(() => {
    const a = parseNum(aPct);
    const b = parseNum(bPct);
    if (a === undefined || b === undefined) return null;
    return classifyAbc(itemsFromRows, { aPct: a, bPct: b });
  }, [itemsFromRows, aPct, bPct]);

  function applyPaste() {
    const parsed = parseAbcPaste(paste);
    if (parsed.items.length === 0) {
      setPasteError(
        da
          ? "Ingen gyldige rækker. Brug vare, antal, pris — eller vare, værdi."
          : "No valid rows. Use item, quantity, price — or item, value.",
      );
      return;
    }
    const limited = parsed.items.slice(0, MAX_ROWS);
    setRows(
      limited.map((it, i) => ({
        id: `p-${Date.now()}-${i}`,
        item: it.item,
        quantity: String(it.quantity),
        unitPrice: String(it.unitPrice),
      })),
    );
    setPasteError(
      parsed.items.length > MAX_ROWS
        ? da
          ? `Importerede ${MAX_ROWS} af ${parsed.items.length} rækker.`
          : `Imported ${MAX_ROWS} of ${parsed.items.length} rows.`
        : null,
    );
  }

  function addRow() {
    setRows((prev) => {
      if (prev.length >= MAX_ROWS) return prev;
      return [...prev, newRow(prev.length + 1, da)];
    });
  }

  function removeRow(id: string) {
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== id)));
  }

  function updateRow(id: string, patch: Partial<RowDraft>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  const copyLabel = da ? "Kopiér" : "Copy";
  const copiedLabel = da ? "Kopieret" : "Copied";
  const csvText = result ? abcRowsToCsv(result.rows, dual) : "";

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <div className="space-y-5">
        <Field
          label={da ? "Indsæt CSV / TSV" : "Paste CSV / TSV"}
          hint={
            da
              ? "Kolonner: vare, antal, pris — eller vare, værdi. Overskrifter genkendes på dansk/engelsk."
              : "Columns: item, quantity, price — or item, value. Headers detected in Danish/English."
          }
        >
          <textarea
            value={paste}
            onChange={(e) => setPaste(e.target.value)}
            rows={5}
            className={`${fieldClass} font-mono text-sm`}
            placeholder={
              da
                ? "vare,antal,pris\nBolt,120,25\nMøtrik,80,18"
                : "item,quantity,price\nBolt,120,25\nNut,80,18"
            }
          />
        </Field>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={primaryBtnClass} onClick={applyPaste}>
            {da ? "Indlæs paste" : "Load paste"}
          </button>
          <button
            type="button"
            className={secondaryBtnClass}
            onClick={() => {
              setPaste("");
              setPasteError(null);
            }}
          >
            {da ? "Ryd paste" : "Clear paste"}
          </button>
        </div>
        {pasteError ? (
          <p className="text-sm text-muted" role="status">
            {pasteError}
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={da ? "A-grænse (kumulativ %)" : "A threshold (cumulative %)"}
            hint={da ? "Standard 80 % (klassisk 80/15/5)" : "Default 80% (classic 80/15/5)"}
          >
            <input
              type="number"
              inputMode="decimal"
              min="1"
              max="99"
              step="0.1"
              value={aPct}
              onChange={(e) => setAPct(e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field
            label={da ? "B-grænse (kumulativ %)" : "B threshold (cumulative %)"}
            hint={da ? "Standard 95 % — resten er C" : "Default 95% — remainder is C"}
          >
            <input
              type="number"
              inputMode="decimal"
              min="1"
              max="100"
              step="0.1"
              value={bPct}
              onChange={(e) => setBPct(e.target.value)}
              className={fieldClass}
            />
          </Field>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            {da ? "Dobbelt ABC (værdi × volumen)" : "Dual ABC (value × volume)"}
          </p>
          <Segmented
            value={dual ? "on" : "off"}
            onChange={(id) => setDual(id === "on")}
            ariaLabel={da ? "Dobbelt ABC" : "Dual ABC"}
            options={[
              { id: "off", label: da ? "Kun værdi" : "Value only" },
              { id: "on", label: da ? "Værdi + volumen" : "Value + volume" },
            ]}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-foreground">
              {da
                ? `Rækker (${rows.length}/${MAX_ROWS})`
                : `Rows (${rows.length}/${MAX_ROWS})`}
            </p>
            <button
              type="button"
              className={secondaryBtnClass}
              onClick={addRow}
              disabled={rows.length >= MAX_ROWS}
            >
              {da ? "Tilføj række" : "Add row"}
            </button>
          </div>
          <div className="max-h-[28rem] space-y-2 overflow-y-auto pr-1">
            {rows.map((row) => (
              <div
                key={row.id}
                className="grid gap-2 rounded-[10px] border border-border bg-surface p-3 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,0.7fr)_minmax(0,0.7fr)_auto]"
              >
                <input
                  type="text"
                  value={row.item}
                  onChange={(e) => updateRow(row.id, { item: e.target.value })}
                  className={fieldClass}
                  aria-label={da ? "Vare" : "Item"}
                  placeholder={da ? "Vare" : "Item"}
                />
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={row.quantity}
                  onChange={(e) =>
                    updateRow(row.id, { quantity: e.target.value })
                  }
                  className={fieldClass}
                  aria-label={da ? "Antal" : "Quantity"}
                  placeholder={da ? "Antal" : "Qty"}
                />
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={row.unitPrice}
                  onChange={(e) =>
                    updateRow(row.id, { unitPrice: e.target.value })
                  }
                  className={fieldClass}
                  aria-label={da ? "Enhedspris" : "Unit price"}
                  placeholder={da ? "Pris" : "Price"}
                />
                <button
                  type="button"
                  className={secondaryBtnClass}
                  onClick={() => removeRow(row.id)}
                  disabled={rows.length <= 1}
                >
                  {da ? "Fjern" : "Remove"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-[12px] border border-border bg-surface px-5 py-4">
          {result ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted">
                    {da ? "Samlet værdi" : "Total value"}
                  </p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">
                    {formatNumber(result.totalValue, locale, 2)}
                  </p>
                </div>
                <CopyButton
                  value={csvText}
                  label={da ? "Kopiér CSV" : "Copy CSV"}
                  copiedLabel={copiedLabel}
                />
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[16rem] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted">
                      <th className="py-2 pr-3 font-medium">
                        {da ? "Klasse" : "Class"}
                      </th>
                      <th className="py-2 pr-3 font-medium">
                        {da ? "Antal" : "Count"}
                      </th>
                      <th className="py-2 font-medium">
                        {da ? "Værdiandel" : "Value share"}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.byValue.map((s) => (
                      <tr key={s.class} className="border-b border-border/60">
                        <td className="py-2 pr-3 font-medium">{s.class}</td>
                        <td className="py-2 pr-3">
                          {formatNumber(s.count, locale, 0)}
                        </td>
                        <td className="py-2">
                          {formatNumber(s.valueShare, locale, 1)} %
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {dual ? (
                <p className="mt-3 text-xs text-muted">
                  {da
                    ? "Dobbeltkode = ValueClass + VolumeClass (fx AA, AB, BC)."
                    : "Dual code = ValueClass + VolumeClass (e.g. AA, AB, BC)."}
                </p>
              ) : null}
            </>
          ) : (
            <p className="py-6 text-sm text-muted">
              {da
                ? "Tilføj gyldige rækker for at se ABC-fordelingen."
                : "Add valid rows to see the ABC breakdown."}
            </p>
          )}
        </div>

        {result ? (
          <div className="rounded-[12px] border border-border bg-surface px-4 py-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-medium">
                {da ? "Rangeret tabel" : "Ranked table"}
              </p>
              <CopyButton
                value={csvText}
                label={copyLabel}
                copiedLabel={copiedLabel}
              />
            </div>
            <div className="max-h-[28rem] overflow-auto">
              <table className="w-full min-w-[32rem] text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border text-muted">
                    <th className="sticky top-0 bg-surface py-2 pr-2 font-medium">
                      {da ? "Vare" : "Item"}
                    </th>
                    <th className="sticky top-0 bg-surface py-2 pr-2 font-medium">
                      {da ? "Værdi" : "Value"}
                    </th>
                    <th className="sticky top-0 bg-surface py-2 pr-2 font-medium">
                      %
                    </th>
                    <th className="sticky top-0 bg-surface py-2 pr-2 font-medium">
                      {da ? "Kum %" : "Cum %"}
                    </th>
                    <th className="sticky top-0 bg-surface py-2 font-medium">
                      {dual
                        ? da
                          ? "V/Vol"
                          : "Val/Vol"
                        : da
                          ? "Klasse"
                          : "Class"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((r, i) => (
                    <tr key={`${r.item}-${i}`} className="border-b border-border/50">
                      <td className="py-1.5 pr-2">{r.item}</td>
                      <td className="py-1.5 pr-2 tabular-nums">
                        {formatNumber(r.value, locale, 2)}
                      </td>
                      <td className="py-1.5 pr-2 tabular-nums">
                        {formatNumber(r.pct, locale, 2)}
                      </td>
                      <td className="py-1.5 pr-2 tabular-nums">
                        {formatNumber(r.cumPct, locale, 2)}
                      </td>
                      <td className="py-1.5 font-medium tabular-nums">
                        {dual ? r.dualCode : r.class}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
