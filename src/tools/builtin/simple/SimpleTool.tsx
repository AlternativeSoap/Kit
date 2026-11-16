"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { useDictionary, useLanguage } from "@/i18n/LanguageProvider";
import { prefillChoice, type ToolPrefill } from "@/tools/prefill";
import { getSimpleDef, type SimpleResultRow, type SimpleToolDef } from "./defs";

function seedValues(
  def: SimpleToolDef,
  prefill?: ToolPrefill,
): Record<string, string> {
  const init: Record<string, string> = {};
  for (const field of def.fields) {
    const fromPrefill = prefill?.[field.key]?.trim();
    if (field.kind === "select" && field.options) {
      const allowed = field.options.map((o) => o.value);
      const choice = prefillChoice(prefill, field.key, allowed);
      init[field.key] = choice ?? field.defaultValue ?? allowed[0] ?? "";
      continue;
    }
    if (fromPrefill) {
      init[field.key] = fromPrefill;
      continue;
    }
    if (prefill?.value && field.key === "text" && !field.defaultValue) {
      init[field.key] = prefill.value;
      continue;
    }
    init[field.key] = field.defaultValue ?? "";
  }
  return init;
}

export function SimpleTool({
  id,
  prefill,
}: {
  id: string;
  prefill?: ToolPrefill;
}) {
  const { locale } = useLanguage();
  const dictionary = useDictionary();
  const def = getSimpleDef(id);
  const da = locale === "da";
  const copyLabel = dictionary.contrast.copy;
  const copiedLabel = dictionary.contrast.copied;

  const [values, setValues] = useState<Record<string, string>>(() =>
    def ? seedValues(def, prefill) : {},
  );
  const [nonce, setNonce] = useState(0);

  const computed = useMemo(() => {
    if (!def) return { rows: null as SimpleResultRow[] | null, errored: false };
    void nonce;
    const filled = def.fields.some((f) => (values[f.key] ?? "").trim().length > 0);
    try {
      const rows = def.compute(values);
      return { rows, errored: filled && rows === null };
    } catch {
      return { rows: null, errored: filled };
    }
  }, [def, values, nonce]);

  if (!def) return null;

  const inputClass =
    "w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)]";

  const actionLabel = da
    ? (def.actionDa ?? "Prøv igen")
    : (def.actionEn ?? "Try again");

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          {def.fields.map((field) => {
            const label = da ? field.labelDa : field.labelEn;
            const hint = da ? field.hintDa : field.hintEn;
            return (
              <label key={field.key} className="block">
                <span className="mb-1.5 block text-sm font-medium text-foreground">
                  {label}
                </span>
                {field.kind === "select" && field.options ? (
                  <select
                    value={values[field.key] ?? ""}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                    className={inputClass}
                  >
                    {field.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {da ? opt.labelDa : opt.labelEn}
                      </option>
                    ))}
                  </select>
                ) : field.multiline ? (
                  <textarea
                    value={values[field.key] ?? ""}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                    rows={8}
                    className={`${inputClass} font-mono`}
                  />
                ) : (
                  <input
                    type="text"
                    inputMode={field.kind === "number" ? "decimal" : undefined}
                    value={values[field.key] ?? ""}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                    className={inputClass}
                  />
                )}
                {hint ? (
                  <span className="mt-1 block text-xs text-muted">{hint}</span>
                ) : null}
              </label>
            );
          })}
          {def.fields.length === 0 ? (
            <p className="text-sm text-muted">
              {da ? "Resultatet opdateres automatisk." : "Results update automatically."}
            </p>
          ) : null}
          {def.volatile ? (
            <button
              type="button"
              onClick={() => setNonce((n) => n + 1)}
              className="kit-touch-target rounded-[10px] bg-accent px-4 py-2.5 text-sm font-medium text-white sm:min-h-0"
            >
              {actionLabel}
            </button>
          ) : null}
          {computed.errored ? (
            <p className="text-sm text-muted">
              {da
                ? "Tjek felterne. Nogle værdier kan ikke beregnes endnu."
                : "Check the fields. Some values cannot be calculated yet."}
            </p>
          ) : null}
        </div>

        <div className="space-y-3">
          {computed.rows?.length ? (
            computed.rows.map((row) => {
              const display =
                da && row.valueDa !== undefined ? row.valueDa : row.value;
              return (
                <div
                  key={row.labelEn}
                  className="rounded-[12px] border border-border bg-surface px-4 py-3"
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted">
                      {da ? row.labelDa : row.labelEn}
                    </span>
                    <CopyButton
                      value={display}
                      label={copyLabel}
                      copiedLabel={copiedLabel}
                    />
                  </div>
                  <pre className="whitespace-pre-wrap break-words font-mono text-sm text-foreground">
                    {display}
                  </pre>
                </div>
              );
            })
          ) : (
            <div className="rounded-[12px] border border-border bg-surface px-4 py-6 text-sm text-muted">
              {da
                ? "Udfyld felterne for at se resultatet."
                : "Fill in the fields to see results."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
